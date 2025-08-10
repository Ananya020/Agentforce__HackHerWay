import { GoogleGenerativeAI } from "@google/generative-ai"
import { logger } from "../utils/logger"
import type { PersonaRequest, Persona, RefinementRequest, ChatRequest } from "../types"
import { generatePersonaId, generateAvatarUrl } from "../utils/helpers"

class AIService {
  private genAI: GoogleGenerativeAI
  private model: any

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      logger.warn("GEMINI_API_KEY not found, using mock responses")
      this.genAI = null as any
      this.model = null
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey)
      this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" })
    }
  }

  async generatePersonas(request: PersonaRequest): Promise<Persona[]> {
    try {
      const prompt = this.buildPersonaGenerationPrompt(request)

      if (!this.model) {
        // Return mock personas for development
        return this.generateMockPersonas(request)
      }

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Parse the AI response and convert to Persona objects
      const personasData = this.parsePersonaResponse(text)

      // Add IDs, avatars, and timestamps
      const personas: Persona[] = personasData.map((data: any, index: number) => ({
        ...data,
        id: generatePersonaId(),
        avatar: generateAvatarUrl(data.name),
        createdAt: new Date(),
        updatedAt: new Date(),
      }))

      logger.info(`Generated ${personas.length} personas for industry: ${request.industry}`)
      return personas
    } catch (error) {
      logger.error("Error generating personas:", error)
      // Fallback to mock personas
      return this.generateMockPersonas(request)
    }
  }

  async refinePersonas(request: RefinementRequest, existingPersonas: Persona[]): Promise<Persona[]> {
    try {
      const prompt = this.buildRefinementPrompt(request, existingPersonas)

      if (!this.model) {
        return this.generateRefinedMockPersonas(request, existingPersonas)
      }

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      const refinedData = this.parsePersonaResponse(text)

      const refinedPersonas: Persona[] = refinedData.map((data: any, index: number) => ({
        ...existingPersonas[index],
        ...data,
        updatedAt: new Date(),
      }))

      logger.info(`Refined ${refinedPersonas.length} personas`)
      return refinedPersonas
    } catch (error) {
      logger.error("Error refining personas:", error)
      return this.generateRefinedMockPersonas(request, existingPersonas)
    }
  }

  async generatePersonaChat(request: ChatRequest, persona: Persona): Promise<string> {
    try {
      const prompt = this.buildChatPrompt(request, persona)

      if (!this.model) {
        return this.generateMockChatResponse(request, persona)
      }

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      logger.info(`Generated chat response for persona: ${persona.name}`)
      return text.trim()
    } catch (error) {
      logger.error("Error generating chat response:", error)
      return this.generateMockChatResponse(request, persona)
    }
  }

  private buildPersonaGenerationPrompt(request: PersonaRequest): string {
    return `
You are an expert marketing strategist and consumer psychologist. Generate 3 detailed customer personas based on the following information:

Product Positioning: ${request.productPositioning}
Industry: ${request.industry}
Target Region: ${request.targetRegion}
Product Category: ${request.productCategory}
${request.surveyData ? `Survey Data: ${request.surveyData}` : ""}
${request.reviewData ? `Review Data: ${request.reviewData}` : ""}

For each persona, provide:
1. Realistic name and complete demographics (age, gender, location, occupation, income level)
2. Detailed psychographic profile (personality traits, values, interests, lifestyle)
3. Key behavioral traits and characteristics
4. Specific pain points and challenges they face
5. Core motivations and goals
6. Preferred messaging tone and communication style
7. Preferred marketing channels and platforms
8. Specific campaign recommendations and messaging angles
9. Detailed buying behavior patterns and decision factors
10. 2-3 realistic quotes they might say

Make each persona distinct, realistic, and based on actual market research patterns for the ${request.industry} industry in ${request.targetRegion}. Ensure diversity in demographics and psychographics.

Return the response as a valid JSON array with this exact structure:
{
  "personas": [
    {
      "name": "string",
      "demographics": {
        "age": number,
        "gender": "string",
        "location": "string",
        "occupation": "string",
        "income": "string"
      },
      "psychographics": {
        "personality": ["string"],
        "values": ["string"],
        "interests": ["string"],
        "lifestyle": "string"
      },
      "traits": ["string"],
      "painPoints": ["string"],
      "motivations": ["string"],
      "goals": ["string"],
      "messagingTone": "string",
      "preferredChannels": ["string"],
      "campaigns": ["string"],
      "buyingBehavior": {
        "decisionFactors": ["string"],
        "purchaseFrequency": "string",
        "budgetRange": "string",
        "researchHabits": ["string"]
      },
      "quotes": ["string"]
    }
  ]
}
`
  }

  private buildRefinementPrompt(request: RefinementRequest, personas: Persona[]): string {
    return `
Refine the following customer personas based on these new parameters:

Current Personas: ${JSON.stringify(personas, null, 2)}

Refinement Parameters:
- Budget Level: ${request.budgetLevel}% (0% = very budget-conscious, 100% = premium/luxury focused)
- Customer Focus: ${request.customerFocus}% (0% = broad market appeal, 100% = highly niche/specialized)
- Messaging Tone: ${request.tone}
- Include Demographic Variations: ${request.includeDemographicVariations}
- Generate Campaign Suggestions: ${request.generateCampaignSuggestions}
- Include Pain Point Analysis: ${request.includePainPointAnalysis}

Adjust the personas to reflect these parameters while maintaining their core identity. Focus on:
1. Budget-related traits and buying behavior based on budget level
2. Specificity of needs and preferences based on customer focus level
3. Communication style and messaging preferences based on tone
4. Enhanced demographic details if requested
5. Updated campaign suggestions if requested
6. Deeper pain point analysis if requested

Return the refined personas in the same JSON structure as the original.
`
  }

  private buildChatPrompt(request: ChatRequest, persona: Persona): string {
    const conversationHistory = request.conversationHistory?.slice(-5) || []
    const historyText = conversationHistory.map((msg) => `${msg.role}: ${msg.content}`).join("\n")

    return `
You are ${persona.name}, a ${persona.demographics.age}-year-old ${persona.demographics.occupation} from ${persona.demographics.location}.

Your personality traits: ${persona.traits.join(", ")}
Your main concerns: ${persona.painPoints.join(", ")}
Your goals: ${persona.goals.join(", ")}
Your communication style: ${persona.messagingTone}
Your typical quotes: ${persona.quotes.join(" | ")}

Recent conversation:
${historyText}

User just said: ${request.message}

Respond as ${persona.name} would, staying completely in character. Use your specific personality, concerns, and communication style. Keep the response conversational, authentic, and under 150 words. Reference your specific background and experiences when relevant. Do not break character or mention that you are an AI.
`
  }

  private parsePersonaResponse(text: string): any[] {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return parsed.personas || [parsed]
      }
      throw new Error("No valid JSON found in response")
    } catch (error) {
      logger.error("Error parsing persona response:", error)
      // Return empty array, will trigger fallback
      return []
    }
  }

  private generateMockPersonas(request: PersonaRequest): Persona[] {
    const mockPersonas = [
      {
        name: "Sarah Chen",
        demographics: {
          age: 28,
          gender: "Female",
          location: "San Francisco, CA",
          occupation: "UX Designer",
          income: "$85,000",
        },
        psychographics: {
          personality: ["Analytical", "Creative", "Detail-oriented", "Collaborative"],
          values: ["Innovation", "Quality", "Work-life balance", "Continuous learning"],
          interests: ["Design trends", "Technology", "Sustainability", "Travel"],
          lifestyle: "Urban professional with active social life",
        },
        traits: ["Tech-savvy", "Quality-focused", "Time-conscious", "Collaborative"],
        painPoints: [
          "Overwhelmed by too many tool options",
          "Needs seamless team collaboration",
          "Values intuitive user interfaces",
        ],
        motivations: ["Career advancement", "Creative fulfillment", "Work efficiency"],
        goals: ["Streamline workflow", "Improve team productivity", "Stay current with trends"],
        messagingTone: "Professional yet approachable",
        preferredChannels: ["LinkedIn", "Design blogs", "Slack communities", "Instagram"],
        campaigns: [
          "Focus on simplicity and ease of use",
          "Highlight collaboration features",
          "Use clean, modern visuals",
        ],
        buyingBehavior: {
          decisionFactors: ["User experience", "Integration capabilities", "Team features"],
          purchaseFrequency: "Quarterly",
          budgetRange: "$50-200/month",
          researchHabits: ["Reads reviews", "Tries free trials", "Asks colleagues"],
        },
        quotes: [
          "If it takes more than 5 minutes to figure out, I'm not using it.",
          "I need tools that help my team work together, not create more silos.",
        ],
      },
      {
        name: "Mike Rodriguez",
        demographics: {
          age: 35,
          gender: "Male",
          location: "Austin, TX",
          occupation: "Small Business Owner",
          income: "$65,000",
        },
        psychographics: {
          personality: ["Pragmatic", "Results-driven", "Independent", "Resourceful"],
          values: ["Efficiency", "Value for money", "Family", "Growth"],
          interests: ["Business development", "Local community", "Sports", "Technology"],
          lifestyle: "Busy entrepreneur balancing work and family",
        },
        traits: ["Budget-conscious", "Results-driven", "Practical", "Independent"],
        painPoints: ["Limited budget for tools", "Needs clear ROI demonstration", "Prefers simple solutions"],
        motivations: ["Business growth", "Cost efficiency", "Time savings"],
        goals: ["Increase revenue", "Reduce operational costs", "Scale business"],
        messagingTone: "Direct and value-focused",
        preferredChannels: ["Google search", "Business forums", "Email", "YouTube"],
        campaigns: [
          "Emphasize cost-effectiveness",
          "Show clear ROI metrics",
          "Use testimonials from similar businesses",
        ],
        buyingBehavior: {
          decisionFactors: ["Price", "ROI", "Ease of use", "Customer support"],
          purchaseFrequency: "Annually",
          budgetRange: "$20-100/month",
          researchHabits: ["Compares prices", "Reads case studies", "Seeks recommendations"],
        },
        quotes: ["Show me the numbers - how will this make me money?", "I don't have time for complicated setups."],
      },
      {
        name: "Emma Thompson",
        demographics: {
          age: 42,
          gender: "Female",
          location: "New York, NY",
          occupation: "Marketing Director",
          income: "$120,000",
        },
        psychographics: {
          personality: ["Strategic", "Ambitious", "Analytical", "Leadership-oriented"],
          values: ["Excellence", "Innovation", "Professional growth", "Results"],
          interests: ["Marketing trends", "Data analytics", "Leadership", "Networking"],
          lifestyle: "High-achieving executive with demanding schedule",
        },
        traits: ["Strategic", "Quality-focused", "Brand-conscious", "Innovation-seeking"],
        painPoints: ["Needs advanced features", "Requires integration capabilities", "Values premium support"],
        motivations: ["Professional excellence", "Brand building", "Market leadership"],
        goals: ["Drive brand awareness", "Optimize campaigns", "Lead innovation"],
        messagingTone: "Sophisticated and detailed",
        preferredChannels: ["Industry publications", "Conferences", "LinkedIn", "Webinars"],
        campaigns: ["Highlight premium features", "Focus on customization options", "Emphasize expert support"],
        buyingBehavior: {
          decisionFactors: ["Features", "Scalability", "Support quality", "Brand reputation"],
          purchaseFrequency: "Bi-annually",
          budgetRange: "$200-1000/month",
          researchHabits: ["Industry research", "Vendor demos", "Peer consultations"],
        },
        quotes: [
          "We need enterprise-grade solutions that can scale with our growth.",
          "Premium support isn't optional - it's essential for our operations.",
        ],
      },
    ]

    return mockPersonas.map((persona) => ({
      ...persona,
      id: generatePersonaId(),
      avatar: generateAvatarUrl(persona.name),
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
  }

  private generateRefinedMockPersonas(request: RefinementRequest, existingPersonas: Persona[]): Persona[] {
    // Apply refinements to existing personas
    return existingPersonas.map((persona) => {
      const refined = { ...persona }

      // Adjust based on budget level
      if (request.budgetLevel > 70) {
        refined.buyingBehavior.budgetRange = refined.buyingBehavior.budgetRange.replace(/\$\d+-\d+/, "$500-2000")
        refined.traits = [...refined.traits.filter((t) => t !== "Budget-conscious"), "Premium-focused"]
      } else if (request.budgetLevel < 30) {
        refined.buyingBehavior.budgetRange = refined.buyingBehavior.budgetRange.replace(/\$\d+-\d+/, "$10-50")
        refined.traits = [...refined.traits.filter((t) => t !== "Premium-focused"), "Budget-conscious"]
      }

      // Adjust messaging tone
      refined.messagingTone =
        request.tone === "formal"
          ? "Professional and formal"
          : request.tone === "humorous"
            ? "Casual and humorous"
            : request.tone === "empathetic"
              ? "Warm and understanding"
              : refined.messagingTone

      refined.updatedAt = new Date()
      return refined
    })
  }

  private generateMockChatResponse(request: ChatRequest, persona: Persona): string {
    const responses = {
      "Sarah Chen": [
        "That's a great question! As a UX designer, I always think about how users will interact with features like that.",
        "I really value tools that don't require a steep learning curve. Time is so precious in our industry.",
        "Collaboration features are huge for me. I work with developers and PMs daily, so seamless integration is key.",
        "I'm willing to invest in quality tools, but they need to prove their worth quickly.",
        "Clean, intuitive design isn't just nice to have - it's essential for my workflow.",
      ],
      "Mike Rodriguez": [
        "I need to see clear ROI before I invest in any new tool. Show me the numbers!",
        "As a small business owner, every dollar counts. I can't afford tools that don't deliver value.",
        "I prefer straightforward solutions. If it takes more than 10 minutes to set up, it's too complex.",
        "Customer support is crucial. When something breaks, I need it fixed fast.",
        "I trust recommendations from other small business owners more than fancy marketing.",
      ],
      "Emma Thompson": [
        "We need enterprise-grade solutions that can handle our scale and complexity.",
        "Integration capabilities are non-negotiable. Any new tool must work with our existing stack.",
        "I value premium support and dedicated account management. White-glove service is expected.",
        "Brand reputation and security are paramount. We can't risk our data with unknown vendors.",
        "Advanced features and customization options are essential for our sophisticated campaigns.",
      ],
    }

    const personaResponses = responses[persona.name as keyof typeof responses] || [
      "That's an interesting perspective! Let me think about that from my point of view.",
      "I appreciate you asking. Based on my experience, I'd say...",
      "That resonates with me. In my situation, I usually consider...",
    ]

    return personaResponses[Math.floor(Math.random() * personaResponses.length)]
  }
}

export const aiService = new AIService()
