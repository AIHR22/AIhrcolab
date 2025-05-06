import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { generateWithLlama3 } from "@/lib/together"
import type { Json } from "@/types/supabase"

interface ProjectWorkforceForecastRequest {
  project_id?: string
  project_name?: string
  department_id?: string
  start_date?: string
  end_date?: string
  months?: number
}

export async function POST(request: Request) {
  try {
    const body: ProjectWorkforceForecastRequest = await request.json()
    
    // Validate required parameters
    if (!body.project_id && !body.project_name && !body.department_id) {
      return NextResponse.json({
        error: "Missing required parameter: project_id, project_name, or department_id"
      }, { status: 400 })
    }
    
    // Default months to 12 if not provided
    const months = body.months || 12
    
    // Get project data
    let projectData: any = null
    if (body.project_id) {
      const { data, error } = await supabaseAdmin
        .from("projects")
        .select(`
          *,
          project_skills (
            skill_id,
            required_level,
            required_count,
            skills (
              name
            )
          )
        `)
        .eq("id", body.project_id)
        .single()
      
      if (error) {
        console.error("Error fetching project:", error)
        throw error
      }
      
      projectData = data
    }
    
    // Get department data if provided
    let departmentData: any = null
    if (body.department_id) {
      const { data, error } = await supabaseAdmin
        .from("departments")
        .select(`
          *,
          employees (
            id,
            name,
            position_id,
            status
          )
        `)
        .eq("id", body.department_id)
        .single()
      
      if (error) {
        console.error("Error fetching department:", error)
        throw error
      }
      
      departmentData = data
    }
    
    // Get current employee allocations for this project
    let currentAllocations: any[] = []
    if (body.project_id) {
      const { data, error } = await supabaseAdmin
        .from("project_allocations")
        .select(`
          *,
          employees (
            id,
            name,
            position_id,
            department_id
          )
        `)
        .eq("project_id", body.project_id)
      
      if (error) {
        console.error("Error fetching allocations:", error)
        throw error
      }
      
      currentAllocations = data || []
    }
    
    // Default attrition rate - no need to query a table that may not exist
    const attritionRate = 0.15 // Using industry average
    
    // Calculate current workforce metrics
    const currentHeadcount = currentAllocations.length
    const departmentHeadcount = departmentData?.employees?.length || 0
    
    // Calculate required skills and headcount
    const requiredSkills = projectData?.project_skills || []
    const totalRequiredHeadcount = requiredSkills.reduce((total: number, skill: any) => total + skill.required_count, 0)
    
    // Calculate the gap
    const headcountGap = totalRequiredHeadcount - currentHeadcount
    
    // Generate forecast projections
    let currentDate = new Date()
    let projectedHeadcount = currentHeadcount || 0
    
    const projections = []
    
    // Calculate available hiring capacity
    const growthRate = 0.05 // Default 5% growth rate
    
    for (let i = 0; i < months; i++) {
      currentDate = new Date(currentDate)
      currentDate.setMonth(currentDate.getMonth() + 1)
      
      // Simple growth model with attrition adjustment
      const monthlyChange = (growthRate / 12) - (attritionRate / 12)
      projectedHeadcount = Math.max(
        0, 
        Math.round(projectedHeadcount * (1 + monthlyChange))
      )
      
      // Project demand based on project timeline if available
      let demandHeadcount = totalRequiredHeadcount
      if (body.start_date && body.end_date) {
        const startDate = new Date(body.start_date)
        const endDate = new Date(body.end_date)
        const projectDuration = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30) // months
        
        if (projectDuration > 0) {
          // Demand curve: ramps up and then down based on project phase
          const currentPhase = i / months
          if (currentPhase < 0.25) {
            // Ramp-up phase
            demandHeadcount = Math.round(totalRequiredHeadcount * (currentPhase * 4))
          } else if (currentPhase > 0.75) {
            // Ramp-down phase
            demandHeadcount = Math.round(totalRequiredHeadcount * (1 - (currentPhase - 0.75) * 4))
          }
        }
      }
      
      projections.push({
        month: currentDate.toISOString().substring(0, 7), // YYYY-MM format
        projected_headcount: projectedHeadcount,
        demand_headcount: demandHeadcount,
        gap: demandHeadcount - projectedHeadcount
      })
    }
    
    // Generate key findings
    const netGap = projections[projections.length - 1].demand_headcount - projections[projections.length - 1].projected_headcount
    
    const keyFindings = [
      `Project requires a total of ${totalRequiredHeadcount} employees based on skill requirements.`,
      `Current allocation: ${currentHeadcount} employees (${headcountGap >= 0 ? 'Gap' : 'Surplus'} of ${Math.abs(headcountGap)}).`,
      `Projected ${netGap >= 0 ? 'shortage' : 'surplus'} of ${Math.abs(netGap)} employees by the end of the forecast period.`
    ]
    
    if (netGap > 0) {
      keyFindings.push(`Need to hire or reallocate at least ${netGap} employees to meet project demands.`)
    }
    
    // Apply the workforce demand forecasting formula
    // WorkforceProjected = CurrentWorkforce + HiringRate - AttritionRate
    const result = {
      project_id: projectData?.id,
      project_name: projectData?.name || body.project_name,
      department_id: departmentData?.id || body.department_id,
      department_name: departmentData?.name,
      current_headcount: currentHeadcount,
      required_headcount: totalRequiredHeadcount,
      headcount_gap: headcountGap,
      attrition_rate: attritionRate * 100,
      growth_rate: growthRate * 100,
      projections,
      key_findings: keyFindings,
      confidence: 80, // Confidence score
      factors: {
        historical_trend: growthRate,
        attrition_risk: attritionRate,
        market_conditions: 0.02,
        project_complexity: projectData?.complexity || "medium"
      }
    }
    
    // Save forecast to database
    const { data: savedForecast, error: saveError } = await supabaseAdmin
      .from("workforce_forecasts")
      .insert([{
        department_id: departmentData?.id || null,
        forecast_date: new Date().toISOString(),
        forecast_type: "project",
        headcount_prediction: totalRequiredHeadcount,
        confidence_score: 80,
        factors: {
          project_id: projectData?.id,
          project_name: projectData?.name || body.project_name,
          attrition_rate: attritionRate,
          growth_rate: growthRate,
          projections
        } as Json
      }])
      .select()
    
    if (saveError) {
      console.error("Error saving forecast:", saveError)
      // Continue without saving
    }
    
    return NextResponse.json(result, {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error: any) {
    console.error("Error in workforce project forecast API:", error)
    return NextResponse.json({
      error: error.message || "Internal server error",
      details: error.details || null
    }, { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 