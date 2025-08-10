import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

interface GeneratePersonasRequest {
  productPositioning: string
  industry: string
  targetRegion: string
  productCategory: string
  surveyData?: string
  reviewData?: string
}

interface Persona {
  id: string
  name: string
  avatar: string
  demographics: {
    age: number
    gender: string
    location: string
    occupation: string
    income: string
  }
  psychographics: {
    personality: string[]
    values: string[]
    interests: string[]
    lifestyle: string
  }
  traits: string[]
  painPoints: string[]
  motivations: string[]
  goals: string[]
  messagingTone: string
  preferredChannels: string[]
  campaigns: string[]
  buyingBehavior: {
    decisionFactors: string[]
    purchaseFrequency: string
    budgetRange: string
    researchHabits: string[]
  }
  quotes: string[]
}

const generatePersonaPrompt = (data: GeneratePersonasRequest) => `
You are an expert marketing strategist and consumer psychologist. Generate 3 detailed customer personas based on the following information:

Product Positioning: ${data.productPositioning}
Industry: ${data.industry}
Target Region: ${data.targetRegion}
Product Category: ${data.productCategory}
${data.surveyData ? `Survey Data: ${data.surveyData}` : ""}
${data.reviewData ? `Review Data: ${data.reviewData}` : ""}

For each persona, provide:
1. Realistic name and basic demographics (age, gender, location, occupation, income level)
2. Psychographic profile (personality traits, values, interests, lifestyle)
3. Key behavioral traits and characteristics
4. Main pain points and challenges
5. Core motivations and goals
6. Preferred messaging tone and communication style
7. Preferred marketing channels
8. Specific campaign recommendations
9. Buying behavior patterns
10. 2-3 realistic quotes they might say

Make each persona distinct and realistic. Base them on real market research patterns for the specified industry and region. Ensure diversity in demographics and psychographics.

Return the response as a valid JSON array of persona objects with the following structure:
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

export async function POST(request: NextRequest) {
  try {
    const body: GeneratePersonasRequest = await request.json()

    // Validate required fields
    if (!body.productPositioning || !body.industry || !body.targetRegion || !body.productCategory) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate personas using AI
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: generatePersonaPrompt(body),
      temperature: 0.7,
    })

    // Parse the AI response
    let personasData
    try {
      personasData = JSON.parse(text)
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      return NextResponse.json({ error: "Failed to generate valid personas" }, { status: 500 })
    }

    // Add IDs and avatars to personas
    const personas: Persona[] = personasData.personas.map((persona: any, index: number) => ({
      ...persona,
      id: `persona_${Date.now()}_${index}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(persona.name)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
    }))

    // Store personas in database (simulated with in-memory storage for now)
    // In production, you would save to a real database
    const sessionId = `session_${Date.now()}`

    return NextResponse.json({
      success: true,
      sessionId,
      personas,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error generating personas:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
