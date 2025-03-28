import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { HiringRecommendationRequest } from "@/types/workforce-planning"

export async function POST(request: Request) {
  try {
    const body: HiringRecommendationRequest = await request.json()

    // Get project details if project_id is provided
    let projectDetails = null
    if (body.project_id) {
      const { data, error } = await supabaseAdmin
        .from("projects")
        .select(`
          id,
          name,
          description,
          start_date,
          end_date,
          status,
          project_skills (
            skill_id,
            required_level,
            required_count,
            skills (
              id,
              name,
              category
            )
          )
        `)
        .eq("id", body.project_id)
        .single()

      if (error) throw error
      projectDetails = data
    }

    // Get department details if department_id is provided
    let departmentDetails = null
    if (body.department_id) {
      const { data, error } = await supabaseAdmin
        .from("departments")
        .select(`
          id,
          name,
          description,
          employees (
            id,
            first_name,
            last_name,
            position
          )
        `)
        .eq("id", body.department_id)
        .single()

      if (error) throw error
      departmentDetails = data
    }

    // Get skill details if skills_needed is provided
    let skillDetails = []
    if (body.skills_needed && body.skills_needed.length > 0) {
      const skillIds = body.skills_needed.map((s) => s.skill_id)
      const { data, error } = await supabaseAdmin.from("skills").select("id, name, category").in("id", skillIds)

      if (error) throw error

      skillDetails = body.skills_needed.map((sn) => {
        const skillInfo = data.find((s) => s.id === sn.skill_id)
        return {
          ...sn,
          name: skillInfo?.name || "Unknown Skill",
          category: skillInfo?.category || "Uncategorized",
        }
      })
    }

    // Get market salary data (simulated)
    const marketSalaryData = {
      "Software Engineer": { junior: 70000, mid: 100000, senior: 150000 },
      "Data Scientist": { junior: 80000, mid: 120000, senior: 160000 },
      "Product Manager": { junior: 85000, mid: 130000, senior: 180000 },
      Designer: { junior: 65000, mid: 95000, senior: 140000 },
      Marketing: { junior: 60000, mid: 90000, senior: 130000 },
      Sales: { junior: 65000, mid: 100000, senior: 150000 },
      HR: { junior: 55000, mid: 85000, senior: 120000 },
      Operations: { junior: 60000, mid: 90000, senior: 130000 },
      Finance: { junior: 70000, mid: 110000, senior: 160000 },
      Legal: { junior: 80000, mid: 130000, senior: 200000 },
    }

    // Use AI to generate hiring recommendations
    const prompt = `
      I need hiring recommendations based on the following information:
      
      ${
        projectDetails
          ? `Project details:
      - Name: ${projectDetails.name}
      - Description: ${projectDetails.description || "No description"}
      - Timeline: ${projectDetails.start_date} to ${projectDetails.end_date}
      - Status: ${projectDetails.status}
      - Required skills: ${projectDetails.project_skills.map((ps: any) => `${ps.skills.name} (Level: ${ps.required_level}/5, Count: ${ps.required_count})`).join(", ")}
      `
          : ""
      }
      
      ${
        departmentDetails
          ? `Department details:
      - Name: ${departmentDetails.name}
      - Description: ${departmentDetails.description || "No description"}
      - Current headcount: ${departmentDetails.employees.length}
      `
          : ""
      }
      
      ${
        skillDetails.length > 0
          ? `Skills needed:
      ${skillDetails.map((s: any) => `- ${s.name} (Level: ${s.level}/5, Count: ${s.count})`).join("\n")}
      `
          : ""
      }
      
      Market salary data:
      ${Object.entries(marketSalaryData)
        .map(
          ([role, salaries]: [string, any]) =>
            `- ${role}: Junior $${salaries.junior}, Mid-level $${salaries.mid}, Senior $${salaries.senior}`,
        )
        .join("\n")}
      
      Based on this information, please provide:
      1. Recommended positions to hire
      2. Number of each position needed
      3. Estimated salary for each position
      4. Total hiring cost (including 30% for benefits and onboarding)
      5. Urgency level (critical, high, medium, low)
      6. Justification for each recommendation
      7. A JSON array with the following structure for each recommendation:
      [
        {
          "position_title": "title",
          "count": number,
          "urgency": "critical|high|medium|low",
          "estimated_salary": number,
          "estimated_cost": number,
          "justification": "detailed justification"
        },
        ...
      ]
      
      Only return the JSON array, nothing else.
    `

    const { text: aiResponse } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.2,
    })

    // Parse AI response
    let hiringRecommendations
    try {
      hiringRecommendations = JSON.parse(aiResponse)
    } catch (e) {
      console.error("Error parsing AI response:", e)
      hiringRecommendations = [
        {
          position_title: "Error",
          count: 0,
          urgency: "medium",
          estimated_salary: 0,
          estimated_cost: 0,
          justification: "Error generating hiring recommendations. Please try again.",
        },
      ]
    }

    // Store the hiring recommendations
    const hiringRecords = hiringRecommendations.map((rec: any) => ({
      project_id: body.project_id || null,
      department_id: body.department_id || null,
      position_title: rec.position_title,
      count: rec.count,
      urgency: rec.urgency,
      estimated_salary: rec.estimated_salary,
      estimated_cost: rec.estimated_cost,
      justification: rec.justification,
      status: "pending",
    }))

    const { data: savedRecommendations, error: recError } = await supabaseAdmin
      .from("hiring_recommendations")
      .insert(hiringRecords)
      .select()

    if (recError) throw recError

    return NextResponse.json({
      success: true,
      recommendations: hiringRecommendations,
      saved_records: savedRecommendations,
    })
  } catch (error: any) {
    console.error("Error generating hiring recommendations:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}

