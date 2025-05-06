import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function generateEmployeeInsights(employeeData: any) {
  const prompt = `
    Based on the following employee data, provide insights and recommendations:
    
    Name: ${employeeData.name}
    Position: ${employeeData.position}
    Department: ${employeeData.department}
    Skills: ${employeeData.skills.join(", ")}
    Performance Reviews: ${JSON.stringify(employeeData.performance_reviews)}
    
    Please analyze:
    1. Career development opportunities
    2. Skill gap analysis
    3. Performance trends
    4. Training recommendations
    5. Project fit suggestions
  `

  const { text } = await generateText({
    model: openai("gpt-4o"),
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  })

  return text
}

