import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { generateJsonWithLlama3 } from "@/lib/together"
import type { ProjectFeasibilityRequest, ProjectFeasibilityResult, AIRecommendations } from "@/types/workforce-planning"
import type { Json } from "@/types/supabase"

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      throw new Error("Supabase client not initialized")
    }

    const body: ProjectFeasibilityRequest = await request.json()

    // Validate required fields
    if (!body.project_name || !body.start_date || !body.end_date || !body.required_skills?.length) {
      return NextResponse.json({
        error: "Missing required fields: project_name, start_date, end_date, required_skills"
      }, {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Get current employees with their skills
    const { data: employees, error: empError } = await supabaseAdmin
      .from("employees")
      .select(`
        id,
        name,
        position_id,
        department_id,
        employee_skills (
          skill_id,
          proficiency_level,
          skills (
            id,
            name
          )
        )
      `)
      .eq("status", "active")

    if (empError) {
      console.error("[API] Error fetching employees:", empError)
      throw empError
    }

    // Get current allocations
    const { data: allocations, error: allocError } = await supabaseAdmin
      .from("project_allocations")
      .select(`
        employee_id,
        project_id,
        role,
        allocation_percentage,
        start_date,
        end_date
      `)
      .or(`and(start_date.lte.${body.end_date},end_date.gte.${body.start_date})`)

    if (allocError) {
      console.error("[API] Error fetching allocations:", allocError)
      throw allocError
    }

    // Calculate employee availability
    const employeeAllocations: Record<string, number> = {}
    allocations?.forEach(alloc => {
      if (!employeeAllocations[alloc.employee_id]) {
        employeeAllocations[alloc.employee_id] = 0
      }
      employeeAllocations[alloc.employee_id] += alloc.allocation_percentage || 25
    })

    // Calculate skill availability
    const skillAvailability = body.required_skills.map(req => {
      const availableEmployees = employees?.filter(emp => {
        // Check if employee has the required skill at or above the required level
        const hasSkill = emp.employee_skills?.some((skill: any) => 
          skill.skill_id === req.skill_id && 
          skill.proficiency_level >= req.required_level
        )
        
        // Check if employee has enough availability
        const currentAllocation = employeeAllocations[emp.id] || 0
        const hasAvailability = currentAllocation <= 80 // Allow up to 80% allocation

        return hasSkill && hasAvailability
      })

      return {
        skill_id: req.skill_id,
        skill_name: req.skill_name,
        required_count: req.required_count,
        available_count: availableEmployees?.length || 0,
        gap: req.required_count - (availableEmployees?.length || 0),
        severity: calculateSeverity(req.required_count, availableEmployees?.length || 0)
      }
    })

    // Calculate overall feasibility score
    const totalGap = skillAvailability.reduce((sum, skill) => sum + Math.max(0, skill.gap), 0)
    const totalRequired = body.required_skills.reduce((sum, skill) => sum + skill.required_count, 0)
    const feasibilityScore = Math.max(0, Math.min(100, ((totalRequired - totalGap) / totalRequired) * 100))

    // Generate AI recommendations
    const aiPrompt = `
      I need to analyze if a new project is feasible with our current workforce.
      
      Project details:
      - Name: ${body.project_name}
      - Start date: ${body.start_date}
      - End date: ${body.end_date}
      - Description: ${body.description || "No description provided"}
      
      Required skills:
      ${body.required_skills.map(s => `- ${s.skill_name} (Level: ${s.required_level}/5, Count: ${s.required_count})`).join("\n")}
      
      Skill availability analysis:
      ${skillAvailability.map(s => `- ${s.skill_name}: Required ${s.required_count}, Available ${s.available_count}, Gap ${s.gap} (${s.severity})`).join("\n")}
      
      Overall feasibility score: ${feasibilityScore.toFixed(1)}%
      
      Based on this data, provide:
      1. A brief assessment of project feasibility
      2. Specific recommendations for addressing skill gaps
      3. Risk factors to consider
      4. Estimated costs and timeline impact
      
      Format the response as JSON with the following structure:
      {
        "assessment": "string",
        "recommendations": ["string"],
        "risk_factors": ["string"],
        "cost_analysis": {
          "hiring_costs": number,
          "training_costs": number,
          "timeline_impact_days": number
        }
      }
    `

    const aiAnalysis = await generateJsonWithLlama3<AIRecommendations>(aiPrompt)

    // Save the analysis
    const { data: savedAnalysis, error: saveError } = await supabaseAdmin
      .from("project_feasibility")
      .insert([{
        project_name: body.project_name,
        analysis_date: new Date().toISOString(),
        start_date: body.start_date,
        end_date: body.end_date,
        feasibility_score: feasibilityScore,
        resource_gap: {
          total_employees_needed: totalRequired,
          available_employees: totalRequired - totalGap,
          gap: totalGap
        } as Json,
        skill_gap: skillAvailability as Json,
        recommendation: aiAnalysis.assessment,
        ai_recommendations: aiAnalysis as Json,
      }])
      .select()
      .single()

    if (saveError) {
      console.error("[API] Error saving analysis:", saveError)
      throw saveError
    }

    const result: ProjectFeasibilityResult = {
      id: savedAnalysis.id,
      feasibility_score: feasibilityScore,
      resource_gap: {
        total_employees_needed: totalRequired,
        available_employees: totalRequired - totalGap,
        gap: totalGap
      },
      skill_gaps: skillAvailability,
      recommendations: aiAnalysis.recommendations,
      risk_factors: aiAnalysis.risk_factors,
      cost_analysis: aiAnalysis.cost_analysis,
      created_at: savedAnalysis.created_at
    }

    return NextResponse.json(result, {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error: any) {
    console.error("[API] Error in POST /api/workforce/project-feasibility:", error)
    return NextResponse.json({
      error: error.message,
      details: error.details || error.hint || null,
      code: error.code || null
    }, {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

function calculateSeverity(required: number, available: number): "Critical" | "High" | "Medium" | "Low" | "None" {
  const gap = required - available
  const gapPercentage = (gap / required) * 100

  if (gapPercentage >= 75) return "Critical"
  if (gapPercentage >= 50) return "High"
  if (gapPercentage >= 25) return "Medium"
  if (gapPercentage > 0) return "Low"
  return "None"
}
