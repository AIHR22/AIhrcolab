import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    const lastMessage = messages[messages.length - 1].content

    // Create a system prompt that includes HR knowledge
    const systemPrompt = `
      You are an AI HR Assistant for a company's HR Suite application.
      Your role is to help employees and HR staff with HR-related questions and tasks.
      
      You have knowledge about:
      - Company policies and procedures
      - Benefits and compensation
      - Time off and leave policies
      - Performance reviews
      - Onboarding and offboarding processes
      - Workplace issues and conflict resolution
      
      Be helpful, professional, and concise in your responses.
      If you don't know the answer to a specific company policy, suggest where the employee might find that information.
    `

    // Format the conversation history for the AI
    const conversationHistory = messages
      .map((msg: any) => {
        return `${msg.role === "user" ? "Employee" : "HR Assistant"}: ${msg.content}`
      })
      .join("\n")

    // Generate the AI response
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `${conversationHistory}\n\nEmployee: ${lastMessage}\n\nHR Assistant:`,
      system: systemPrompt,
      maxTokens: 500,
    })

    return NextResponse.json({ response: text })
  } catch (error: any) {
    console.error("Error in AI assistant:", error)
    return NextResponse.json({ error: "Failed to generate response. Please try again." }, { status: 500 })
  }
}

