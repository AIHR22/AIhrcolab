import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function generateAIResponse(prompt: string, fallbackResponse: string) {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      maxTokens: 1000,
    })

    return text
  } catch (error) {
    console.error("Error generating AI response:", error)
    return fallbackResponse
  }
}

export async function handleAIError(component: string, error: any) {
  console.error(`AI error in ${component}:`, error)

  // Check if it's a quota error
  if (error.message?.includes("quota") || error.message?.includes("billing")) {
    return "AI features are currently unavailable due to API quota limitations. Please try again later."
  }

  // Generic error message
  return "Unable to generate AI response at this time. Please try again later."
}

