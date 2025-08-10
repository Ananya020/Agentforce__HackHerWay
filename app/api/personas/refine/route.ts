import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

interface RefineRequest {
  personas: any[]
  refinements: {
    budgetLevel: number
    customerFocus: number
    tone: string
    includeDemographicVariations: boolean
    generateCampaignSuggestions: boolean
    includePainPointAnalysis: boolean
  }
  originalContext: {
    productPositioning: string
    industry: string
    targetRegion: string
    productCategory: string
  }
}

const generateRefinementPrompt = (data: RefineRequest) => `
You are refining existing customer personas based on new parameters. Here are the original personas:

${JSON.stringify(data.personas, null, 2)}

Original Context:
${JSON.stringify(data.originalContext, null, 2)}

New Refinement Parameters:
- Budget Level: ${data.refinements.budgetLevel}% (0% = very budget-conscious, 100% = premium/luxury focused)
- Customer Focus: ${data.refinements.customerFocus}% (0% = broad market appeal, 100% = highly niche/specialized)
- Messaging Tone: ${data.refinements.tone}
- Include Demographic Variations: ${data.refinements.includeDemographicVariations}
- Generate Campaign Suggestions: ${data.refinements.generateCampaignSuggestions}
- Include Pain Point Analysis: ${data.refinements.includePainPointAnalysis}

Refine the personas to reflect these new parameters while maintaining their core identity. Adjust:
1. Budget-related traits and buying behavior
2. Specificity of needs and preferences based on customer focus level
3. Communication style and messaging preferences
4. Add demographic variations if requested
5. Update campaign suggestions if requested
6. Enhance pain point analysis if requested

Return the refined personas in the same JSON structure as the input.
`

export async function POST(request: NextRequest) {
  try {
    const body: RefineRequest = await request.json()

    // Validate required fields
    if (!body.personas || !body.refinements || !body.originalContext) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate refined personas using AI
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: generateRefinementPrompt(body),
      temperature: 0.6,
    })

    // Parse the AI response
    let refinedPersonas
    try {
      refinedPersonas = JSON.parse(text)
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      return NextResponse.json({ error: "Failed to refine personas" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      personas: refinedPersonas,
      refinedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error refining personas:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
