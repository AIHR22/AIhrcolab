import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    const systemPrompt = `You are an expert in organizational design and HR management. 
    Generate a detailed organization structure based on the user's requirements.
    The output should be in JSON format with departments, positions, and employees.`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    })

    return NextResponse.json({ result: text })
  } catch (error) {
    console.error("AI generation error:", error)
    return NextResponse.json({ error: "Failed to generate organization structure" }, { status: 500 })
  }
}

