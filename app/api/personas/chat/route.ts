import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

interface ChatRequest {
  personaId: string
  message: string
  conversationHistory: Array<{
    role: "user" | "assistant"
    content: string
  }>
  personaContext: {
    name: string
    demographics: any
    traits: string[]
    painPoints: string[]
    messagingTone: string
    quotes: string[]
  }
}

const generateChatPrompt = (data: ChatRequest) => `
You are roleplaying as ${data.personaContext.name}, a customer persona with the following characteristics:

Demographics: ${JSON.stringify(data.personaContext.demographics)}
Key Traits: ${data.personaContext.traits.join(", ")}
Pain Points: ${data.personaContext.painPoints.join(", ")}
Messaging Tone: ${data.personaContext.messagingTone}
Example Quotes: ${data.personaContext.quotes.join(" | ")}

Conversation History:
${data.conversationHistory.map((msg) => `${msg.role}: ${msg.content}`).join("\n")}

User's new message: ${data.message}

Respond as ${data.personaContext.name} would, staying true to their personality, demographics, and communication style. Keep responses conversational, authentic, and under 150 words. Show their personality through word choice, concerns, and perspective. Reference their specific pain points and traits when relevant.

Do not break character or mention that you are an AI. Respond as if you are a real person with real experiences and opinions.
`

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()

    // Validate required fields
    if (!body.personaId || !body.message || !body.personaContext) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate response using AI
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: generateChatPrompt(body),
      temperature: 0.8,
      maxTokens: 200,
    })

    // Simulate thinking delay for realism
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000))

    return NextResponse.json({
      success: true,
      response: text.trim(),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error generating chat response:", error)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
