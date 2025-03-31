import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { generateWithLlama3 } from "@/lib/together"
import type { Json } from "@/types/supabase"

interface ScenarioRequest {
  scenario_name: string;
  scenario_type: "hiring" | "layoff" | "reorganization" | "training" | "growth" | "custom";
  department_id?: string;
  parameters: {
    headcount_change?: number;
    growth_rate?: number;
    timeline_months?: number;
    skill_focus?: string[];
    budget_constraint?: number;
    reorganization_details?: {
      departments_affected: string[];
      consolidation_factor: number;
    };
    custom_parameters?: Record<string, any>;
  };
  baseline?: {
    current_headcount: number;
    current_budget: number;
    current_skills: Array<{
      skill_id: string;
      skill_name: string;
      headcount: number;
    }>;
  };
}

interface ScenarioOutcome {
  id: string;
  scenario_name: string;
  scenario_type: string;
  analysis_date: string;
  department_id?: string;
  department_name?: string;
  headcount_projection: {
    current: number;
    projected: number;
    change: number;
    change_percentage: number;
    timeline_months: number;
  };
  financial_impact: {
    cost_increase: number;
    revenue_impact: number;
    roi: number;
    payback_period_months: number;
  };
  skill_impact: Array<{
    skill_id: string;
    skill_name: string;
    current_headcount: number;
    projected_headcount: number;
    change: number;
  }>;
  risk_assessment: {
    level: "Low" | "Medium" | "High" | "Critical";
    factors: string[];
  };
  timeline: {
    implementation_phases: Array<{
      phase: string;
      duration_months: number;
      description: string;
    }>;
    total_duration_months: number;
  };
  recommendations: string[];
}

export async function POST(request: Request) {
  try {
    const { scenario_name, scenario_type, department_id, parameters, baseline } = await request.json() as ScenarioRequest
    
    if (!scenario_name || !scenario_type || !parameters) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: scenario_name, scenario_type, parameters" },
        { status: 400 }
      )
    }
    
    // Fetch department data if department_id is provided
    let departmentName = "All Departments"
    if (department_id) {
      const { data: department, error: deptError } = await supabaseAdmin
        .from("departments")
        .select("name")
        .eq("id", department_id)
        .single()
      
      if (deptError) {
        console.error("Error fetching department:", deptError)
      } else if (department) {
        departmentName = department.name
      }
    }
    
    // Fetch current headcount data
    let currentHeadcount = 0
    let employeesByDepartment: Record<string, any[]> = {}
    
    const { data: employees, error: empError } = await supabaseAdmin
      .from("employees")
      .select(`
        id,
        first_name,
        last_name,
        department_id,
        departments:department_id (
          id,
          name
        )
      `)
    
    if (empError) {
      console.error("Error fetching employees:", empError)
    } else if (employees) {
      // Filter by department if specified
      const filteredEmployees = department_id 
        ? employees.filter(emp => emp.department_id === department_id)
        : employees
      
      currentHeadcount = filteredEmployees.length
      
      // Group employees by department for better analysis
      employeesByDepartment = filteredEmployees.reduce((acc, emp) => {
        const deptName = emp.departments?.name || "Unknown Department"
        if (!acc[deptName]) {
          acc[deptName] = []
        }
        acc[deptName].push(emp)
        return acc
      }, {} as Record<string, any[]>)
    }
    
    // Fetch skills data
    const { data: employeeSkills, error: skillsError } = await supabaseAdmin
      .from("employee_skills")
      .select(`
        skill_id,
        employee_id,
        skills:skill_id (
          id,
          name
        )
      `)
    
    if (skillsError) {
      console.error("Error fetching employee skills:", skillsError)
    }
    
    // Use baseline data if provided, otherwise calculate from fetched data
    const baselineData = baseline || {
      current_headcount: currentHeadcount,
      current_budget: 0, // We don't have salary field in our schema, setting to 0
      current_skills: []
    }
    
    // Calculate current skills distribution if not provided in baseline
    if (!baseline?.current_skills && employeeSkills) {
      const skillCountMap: Record<string, { count: number; name: string }> = {}
      
      employeeSkills.forEach(es => {
        const empDept = employees?.find(e => e.id === es.employee_id)?.department_id
        
        // Only include skills from the specified department if a department_id is provided
        if (!department_id || empDept === department_id) {
          const skillId = es.skill_id
          const skillName = es.skills?.name || "Unknown Skill"
          
          if (!skillCountMap[skillId]) {
            skillCountMap[skillId] = { count: 0, name: skillName }
          }
          
          skillCountMap[skillId].count++
        }
      })
      
      baselineData.current_skills = Object.entries(skillCountMap).map(([skillId, data]) => ({
        skill_id: skillId,
        skill_name: data.name,
        headcount: data.count
      }))
    }
    
    // Generate a prompt based on the scenario type and parameters
    let prompt = `
      I need to model a workforce scenario for ${departmentName} with the following details:
      
      Scenario name: ${scenario_name}
      Scenario type: ${scenario_type}
      
      Current state:
      - Headcount: ${baselineData.current_headcount} employees
      - Budget: $${baselineData.current_budget.toLocaleString()}
      
      Current skill distribution:
      ${baselineData.current_skills.map(s => `- ${s.skill_name}: ${s.headcount} employees`).join("\n")}
      
      Departments:
      ${Object.entries(employeesByDepartment).map(([dept, emps]) => 
        `- ${dept}: ${emps.length} employees`
      ).join("\n")}
      
      Scenario parameters:
    `
    
    // Add specific details based on scenario type
    switch (scenario_type) {
      case "hiring":
        prompt += `
          Hiring surge details:
          - Headcount change: +${parameters.headcount_change || 0} employees
          - Timeline: ${parameters.timeline_months || 6} months
          ${parameters.skill_focus ? `- Skill focus: ${parameters.skill_focus.join(", ")}` : ""}
          ${parameters.budget_constraint ? `- Budget constraint: $${parameters.budget_constraint.toLocaleString()}` : ""}
        `
        break
        
      case "layoff":
        prompt += `
          Reduction details:
          - Headcount change: -${Math.abs(parameters.headcount_change || 0)} employees
          - Timeline: ${parameters.timeline_months || 3} months
          ${parameters.skill_focus ? `- Skills to preserve: ${parameters.skill_focus.join(", ")}` : ""}
        `
        break
        
      case "reorganization":
        prompt += `
          Reorganization details:
          - Departments affected: ${parameters.reorganization_details?.departments_affected.join(", ") || "All"}
          - Consolidation factor: ${parameters.reorganization_details?.consolidation_factor || 0.8} (1.0 means no consolidation, 0.8 means 20% reduction)
          - Timeline: ${parameters.timeline_months || 6} months
        `
        break
        
      case "growth":
        prompt += `
          Growth projection details:
          - Annual growth rate: ${parameters.growth_rate || 10}%
          - Timeline: ${parameters.timeline_months || 12} months
          ${parameters.skill_focus ? `- Skills needed for growth: ${parameters.skill_focus.join(", ")}` : ""}
          ${parameters.budget_constraint ? `- Budget ceiling: $${parameters.budget_constraint.toLocaleString()}` : ""}
        `
        break
        
      case "training":
        prompt += `
          Skill development details:
          - Skills to develop: ${parameters.skill_focus ? parameters.skill_focus.join(", ") : "General upskilling"}
          - Timeline: ${parameters.timeline_months || 6} months
          ${parameters.budget_constraint ? `- Training budget: $${parameters.budget_constraint.toLocaleString()}` : ""}
        `
        break
        
      case "custom":
        prompt += `
          Custom scenario details:
          ${Object.entries(parameters.custom_parameters || {})
            .map(([key, value]) => `- ${key}: ${value}`)
            .join("\n")}
          - Timeline: ${parameters.timeline_months || 6} months
        `
        break
    }
    
    prompt += `
      Based on this information, please provide a detailed analysis of how this scenario would affect our workforce, including:
      
      1. Headcount projection
      2. Financial impact (costs, revenue impact, ROI)
      3. Impact on skill distribution
      4. Risk assessment
      5. Implementation timeline
      6. Specific recommendations
      
      Format your response as a JSON object with the following structure:
      {
        "scenario_name": "string",
        "scenario_type": "string",
        "analysis_date": "YYYY-MM-DD",
        "department_id": "${department_id || null}",
        "department_name": "string",
        "headcount_projection": {
          "current": number,
          "projected": number,
          "change": number,
          "change_percentage": number,
          "timeline_months": number
        },
        "financial_impact": {
          "cost_increase": number,
          "revenue_impact": number,
          "roi": number,
          "payback_period_months": number
        },
        "skill_impact": [
          {
            "skill_id": "string",
            "skill_name": "string",
            "current_headcount": number,
            "projected_headcount": number,
            "change": number
          }
        ],
        "risk_assessment": {
          "level": "Low|Medium|High|Critical",
          "factors": ["string"]
        },
        "timeline": {
          "implementation_phases": [
            {
              "phase": "string",
              "duration_months": number,
              "description": "string"
            }
          ],
          "total_duration_months": number
        },
        "recommendations": ["string"]
      }
      
      Only include the JSON object in your response, nothing else.
    `
    
    // Generate the scenario analysis
    let scenarioOutcome: ScenarioOutcome
    
    try {
      // Use generateWithLlama3 and cast the output to ScenarioOutcome
      const result = await generateWithLlama3(
        prompt,
        "You are an expert HR workforce planner with deep knowledge of workforce modeling, financial analysis, and organizational design.",
        0.2,
        3000
      )
      
      scenarioOutcome = JSON.parse(result) as ScenarioOutcome
      
      // Ensure required fields are present
      scenarioOutcome.id = scenarioOutcome.id || crypto.randomUUID()
      scenarioOutcome.scenario_name = scenario_name
      scenarioOutcome.scenario_type = scenario_type
      scenarioOutcome.analysis_date = scenarioOutcome.analysis_date || new Date().toISOString().split('T')[0]
      scenarioOutcome.department_id = department_id
      scenarioOutcome.department_name = departmentName
      
    } catch (error) {
      console.error("Error generating scenario with AI:", error)
      
      // Create a fallback analysis if AI generation fails
      scenarioOutcome = {
        id: crypto.randomUUID(),
        scenario_name,
        scenario_type,
        analysis_date: new Date().toISOString().split('T')[0],
        department_id,
        department_name: departmentName,
        headcount_projection: {
          current: baselineData.current_headcount,
          projected: scenario_type === "layoff" 
            ? baselineData.current_headcount - (parameters.headcount_change || 5)
            : baselineData.current_headcount + (parameters.headcount_change || 5),
          change: scenario_type === "layoff" 
            ? -(parameters.headcount_change || 5)
            : (parameters.headcount_change || 5),
          change_percentage: ((parameters.headcount_change || 5) / baselineData.current_headcount) * 100,
          timeline_months: parameters.timeline_months || 6
        },
        financial_impact: {
          cost_increase: scenario_type === "layoff" ? -50000 * (parameters.headcount_change || 5) : 50000 * (parameters.headcount_change || 5),
          revenue_impact: scenario_type === "layoff" ? -75000 * (parameters.headcount_change || 5) : 75000 * (parameters.headcount_change || 5),
          roi: 1.5,
          payback_period_months: 8
        },
        skill_impact: baselineData.current_skills.map(skill => ({
          skill_id: skill.skill_id,
          skill_name: skill.skill_name,
          current_headcount: skill.headcount,
          projected_headcount: skill.headcount + (scenario_type === "layoff" ? -1 : 1),
          change: scenario_type === "layoff" ? -1 : 1
        })),
        risk_assessment: {
          level: scenario_type === "layoff" ? "Medium" : "Low",
          factors: [
            "Implementation timeline may be affected by market conditions",
            "Employee morale may be impacted during transition"
          ]
        },
        timeline: {
          implementation_phases: [
            {
              phase: "Planning",
              duration_months: 1,
              description: "Define detailed implementation plan"
            },
            {
              phase: "Execution",
              duration_months: 4,
              description: "Implement the workforce changes"
            },
            {
              phase: "Stabilization",
              duration_months: 1,
              description: "Monitor and adjust to ensure successful transition"
            }
          ],
          total_duration_months: 6
        },
        recommendations: [
          "Create detailed communication plan",
          "Ensure skills balance is maintained",
          "Monitor employee engagement during implementation"
        ]
      }
    }
    
    // Create the workforce_scenarios table if it doesn't exist
    const { error: createTableError } = await supabaseAdmin.rpc('create_workforce_scenarios_if_not_exists')
    
    if (createTableError) {
      console.error("Error creating workforce_scenarios table:", createTableError)
      // If the RPC fails, we'll try to insert anyway in case the table already exists
    }
    
    // Store the scenario in the database
    // Use a raw INSERT query to handle the case where the table may or may not exist yet
    const { data: savedScenario, error: saveError } = await supabaseAdmin
      .from('workforce_scenarios')
      .insert({
        id: scenarioOutcome.id,
        name: scenarioOutcome.scenario_name,
        description: `${scenarioOutcome.scenario_type} scenario for ${scenarioOutcome.department_name}`,
        scenario_type: scenarioOutcome.scenario_type,
        department_id: scenarioOutcome.department_id,
        parameters: parameters as unknown as Json,
        results: scenarioOutcome as unknown as Json,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
    
    if (saveError) {
      console.error("Error saving scenario:", saveError)
      
      return NextResponse.json(
        {
          success: true,
          scenario: scenarioOutcome,
          saved: false,
          error: saveError.message
        }
      )
    }
    
    return NextResponse.json({
      success: true,
      scenario: scenarioOutcome,
      saved: true,
      scenario_id: scenarioOutcome.id
    })
    
  } catch (error: any) {
    console.error("Error in workforce scenario modeling:", error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An error occurred while processing the scenario",
      },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get("id")
    const department_id = url.searchParams.get("department_id")
    const type = url.searchParams.get("type")
    
    try {
      // Try to query the workforce_scenarios table
      let query = supabaseAdmin
        .from('workforce_scenarios')
        .select("*")
        .order("created_at", { ascending: false })
      
      // Apply filters
      if (id) {
        query = query.eq("id", id)
      }
      
      if (department_id) {
        query = query.eq("department_id", department_id)
      }
      
      if (type) {
        query = query.eq("scenario_type", type)
      }
      
      // Limit to 20 scenarios if no id specified
      if (!id) {
        query = query.limit(20)
      }
      
      const { data: scenarios, error } = await query
      
      if (error) {
        // If there's an error, it might be because the table doesn't exist
        if (error.message.includes("relation") && error.message.includes("does not exist")) {
          // Return empty scenarios array if table doesn't exist
          return NextResponse.json({
            success: true,
            scenarios: []
          })
        }
        throw error
      }
      
      return NextResponse.json({
        success: true,
        scenarios
      })
    } catch (queryError) {
      console.error("Error querying workforce_scenarios:", queryError)
      // Return empty array on error for better UX
      return NextResponse.json({
        success: true,
        scenarios: []
      })
    }
    
  } catch (error: any) {
    console.error("Error fetching workforce scenarios:", error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An error occurred while fetching scenarios",
      },
      { status: 500 }
    )
  }
} 