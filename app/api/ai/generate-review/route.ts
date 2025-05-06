import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: Request) {
  try {
    const { employeeData } = await req.json()

    const prompt = `
      Generate a comprehensive performance review for the following employee:
      
      Name: ${employeeData.name}
      Position: ${employeeData.position}
      Department: ${employeeData.department}
      Skills: ${employeeData.skills.join(", ")}
      Achievements: ${employeeData.achievements.join(", ")}
      Areas for Improvement: ${employeeData.areas_for_improvement.join(", ")}
      
      The review should include:
      1. Overall performance assessment
      2. Key strengths and accomplishments
      3. Areas for improvement
      4. Development goals for the next period
      5. Specific actionable feedback
    `

    const { text } = await generateText({
      model: openai("gpt-4o"),
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    })

    return new Response(text, {
      headers: {
        "Content-Type": "text/plain",
      },
    })
  } catch (error) {
    console.error("AI review generation error:", error)
    return new Response(JSON.stringify({ error: "Failed to generate performance review" }), { status: 500 })
  }
}

