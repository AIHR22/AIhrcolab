import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { supabase } from "@/lib/supabase"
import type { OrgChartNode } from "@/types/organization"

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Generate organization structure using AI
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `
        Generate a JSON organization chart structure based on the following description:
        "${prompt}"
        
        The response should be a valid JSON object with the following structure:
        {
          "id": string,
          "name": string,
          "title": string,
          "department": string,
          "children": [ ... recursive structure with the same fields ]
        }
        
        Only return the JSON object, nothing else.
      `,
    })

    // Parse the generated text as JSON
    let orgStructure: OrgChartNode
    try {
      // Extract JSON from the response (in case there's any extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("No valid JSON found in the response")
      }

      orgStructure = JSON.parse(jsonMatch[0])
    } catch (error) {
      console.error("Failed to parse generated organization structure:", error)
      return NextResponse.json({ error: "Failed to generate valid organization structure" }, { status: 500 })
    }

    // Save the generated structure to the database
    const { data, error } = await supabase
      .from("org_structures")
      .insert({
        name: `Generated from prompt: ${prompt.substring(0, 50)}...`,
        structure: orgStructure,
        created_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error("Failed to save organization structure:", error)
      return NextResponse.json({ error: "Failed to save organization structure" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: orgStructure,
      savedId: data[0]?.id,
    })
  } catch (error) {
    console.error("Error generating organization chart:", error)
    return NextResponse.json({ error: "Failed to generate organization chart" }, { status: 500 })
  }
}

