import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { generateWithLlama3 } from "@/lib/together"
import type { ProjectFeasibilityRequest, ProjectFeasibilityResult, AIRecommendations } from "@/types/workforce-planning"
import type { Json } from "@/types/supabase"

// Helper function to calculate severity (assuming it exists or define it here)
function calculateSeverity(required: number, available: number): "Critical" | "High" | "Medium" | "Low" | "None" {
  const gap = required - available
  if (required <= 0) return "None" // Avoid division by zero
  const gapPercentage = Math.max(0, (gap / required) * 100)

  if (gapPercentage >= 75) return "Critical"
  if (gapPercentage >= 50) return "High"
  if (gapPercentage >= 25) return "Medium"
  if (gapPercentage > 0) return "Low"
  return "None"
}

// Helper function to create a more detailed AI prompt
function createEnhancedAIPrompt({
  projectName,
  startDate,
  endDate,
  skillAvailability,
  feasibilityScore,
  budget,
  totalRequired,
  totalAvailable,
  totalGap,
  resourceUtilization,
  timeframe
}: {
  projectName: string,
  startDate: string,
  endDate: string,
  skillAvailability: any[],
  feasibilityScore: number,
  budget?: number,
  totalRequired: number,
  totalAvailable: number,
  totalGap: number,
  resourceUtilization: number,
  timeframe: number
}) {
  // Calculate project duration in days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const projectDuration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  // Format critical skills information
  const criticalSkills = skillAvailability
    .filter(s => s.severity === "Critical" || s.severity === "High")
    .map(s => `${s.skill_name}: Required ${s.required_count}, Available ${s.available_count}, Gap ${s.gap}`)
    .join("\n");
  
  // Format skills with sufficient coverage
  const coveredSkills = skillAvailability
    .filter(s => s.severity === "None" || s.severity === "Low")
    .map(s => s.skill_name)
    .join(", ");

  return `
    ## Project Feasibility Analysis for "${projectName}"
    
    ### Project Details
    - Timeline: ${startDate} to ${endDate} (${projectDuration} days)
    - Overall Resource Requirement: ${totalRequired} skilled resources needed
    - Current Available Resources: ${totalAvailable} matching employees
    - Resource Gap: ${totalGap}
    - Budget${budget ? `: $${budget.toLocaleString()}` : ": Not specified"}
    - Resource Utilization: ${Math.round(resourceUtilization * 100)}%
    
    ### Critical Skill Gaps
    ${criticalSkills || "No critical skill gaps identified."}
    
    ### Well-Covered Skills
    ${coveredSkills || "No skills have sufficient coverage."}
    
    ### Overall Feasibility Score
    ${feasibilityScore.toFixed(1)}%
    
    Based on the above analysis, provide a JSON response with the following structure:
    {
      "assessment": "A comprehensive assessment of the project feasibility (2-3 sentences)",
      "recommendations": [
        "Actionable recommendation 1",
        "Actionable recommendation 2",
        ... (5-7 specific recommendations)]
      ],
      "risk_factors": [
        "Risk factor 1",
        "Risk factor 2",
        ... (4-5 specific risks based on skill gaps and resource constraints)
      ],
      "cost_analysis": {
        "hiring_costs": estimated_cost_for_filling_skill_gaps,
        "training_costs": estimated_cost_for_upskilling_existing_staff,
        "timeline_impact_days": estimated_additional_days_needed_due_to_resource_constraints
      },
      "mitigation_strategies": [
        "Strategy 1 to address top risks",
        "Strategy 2 to address top risks",
        ... (3-4 specific strategies)
      ],
      "department_impact": {
        "most_affected": ["Department name likely to be most affected"],
        "impact_description": "Brief description of how departments will be affected"
      }
    }
  `;
}

// Helper function to parse and validate AI response
function parseAIResponse(responseText: string): AIRecommendations {
  // Default values in case of parsing failure
  const defaultResponse: AIRecommendations = {
    assessment: "Feasibility analysis requires review. AI generation failed.",
    recommendations: ["Manual review recommended."],
    risk_factors: ["Potential inaccuracies due to AI failure."],
    cost_analysis: { hiring_costs: 0, training_costs: 0, timeline_impact_days: 0 },
    mitigation_strategies: ["Conduct manual review of resource allocation."],
    department_impact: { most_affected: [], impact_description: "Impact assessment unavailable." }
  };

  try {
    // Find JSON content within the response (in case AI adds markdown or other text)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return defaultResponse;
    
    const parsedResponse = JSON.parse(jsonMatch[0]);
    
    // Validate required fields
    if (!parsedResponse.assessment || 
        !Array.isArray(parsedResponse.recommendations) || 
        !Array.isArray(parsedResponse.risk_factors) || 
        !parsedResponse.cost_analysis) {
      console.warn("AI response missing required fields", parsedResponse);
      return {
        ...defaultResponse,
        ...parsedResponse,  // Keep any valid parts
      };
    }
    
    // Ensure cost_analysis has all required fields
    if (parsedResponse.cost_analysis) {
      parsedResponse.cost_analysis = {
        hiring_costs: parsedResponse.cost_analysis.hiring_costs || 0,
        training_costs: parsedResponse.cost_analysis.training_costs || 0,
        timeline_impact_days: parsedResponse.cost_analysis.timeline_impact_days || 0
      };
    }
    
    // Add default mitigation strategies if missing
    if (!parsedResponse.mitigation_strategies || !Array.isArray(parsedResponse.mitigation_strategies)) {
      parsedResponse.mitigation_strategies = defaultResponse.mitigation_strategies;
    }
    
    // Add default department impact if missing
    if (!parsedResponse.department_impact) {
      parsedResponse.department_impact = defaultResponse.department_impact;
    }
    
    return parsedResponse;
  } catch (error) {
    console.error("Error parsing AI response:", error);
    console.debug("AI response text:", responseText);
    return defaultResponse;
  }
}

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      throw new Error("Supabase admin client not available")
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

    // Calculate timeframe in days
    const startDate = new Date(body.start_date);
    const endDate = new Date(body.end_date);
    const timeframeInDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Get current employees with their skills
    const { data: employees, error: empError } = await supabaseAdmin
      .from("employees")
      .select(`
        id,
        first_name,
        last_name,
        position_id,
        department_id,
        departments(id, name),
        employee_skills (
          skill_id,
          proficiency_level,
          skills (id, name)
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
      .select('employee_id, project_id, role, allocation_percentage, start_date, end_date')
      .or(`and(start_date.lte.${body.end_date},end_date.gte.${body.start_date})`);

    if (allocError) {
      console.error("[API] Error fetching allocations:", allocError);
      throw allocError;
    }

    // Calculate employee availability
    const employeeAllocations: Record<string, number> = {};
    // Explicitly cast to array and use a more specific type for alloc
    ((allocations as { employee_id: string; allocation_percentage: number | null }[] | null) || []).forEach((alloc) => {
      if (!employeeAllocations[alloc.employee_id]) {
        employeeAllocations[alloc.employee_id] = 0;
      }
      // Use nullish coalescing for default percentage
      employeeAllocations[alloc.employee_id] += alloc.allocation_percentage ?? 25; 
    });

    // Get department structure
    const { data: departments, error: deptError } = await supabaseAdmin
      .from("departments")
      .select("id, name, description");

    if (deptError) {
      console.error("[API] Error fetching departments:", deptError);
    }

    // Map departments by ID for easy lookup
    const departmentMap = new Map();
    (departments || []).forEach((dept: any) => {
      departmentMap.set(dept.id, dept);
    });

    // Calculate department impact
    const departmentImpact: Record<string, {name: string, count: number, skills: string[]}> = {};

    // Calculate skill availability and department impact
    const skillAvailability = body.required_skills.map(req => {
      const availableEmployees = (employees || []).filter((emp: any) => {
        // Check if employee has the required skill at or above the required level
        const hasSkill = emp.employee_skills?.some((skill: any) => 
          skill.skill_id === req.skill_id && 
          skill.proficiency_level >= req.required_level
        )
        
        // Check if employee has enough availability
        const currentAllocation = employeeAllocations[emp.id] || 0
        const hasAvailability = currentAllocation <= 80 // Allow up to 80% allocation

        // If employee matches, track department impact
        if (hasSkill && hasAvailability && emp.department_id) {
          if (!departmentImpact[emp.department_id]) {
            const deptName = departmentMap.get(emp.department_id)?.name || "Unknown";
            departmentImpact[emp.department_id] = {
              name: deptName,
              count: 0,
              skills: []
            };
          }
          departmentImpact[emp.department_id].count++;
          if (req.skill_name && !departmentImpact[emp.department_id].skills.includes(req.skill_name)) {
            departmentImpact[emp.department_id].skills.push(req.skill_name);
          }
        }

        return hasSkill && hasAvailability
      })

      return {
        skill_id: req.skill_id,
        skill_name: req.skill_name || "Unknown Skill",
        required_count: req.required_count,
        available_count: availableEmployees?.length || 0,
        gap: req.required_count - (availableEmployees?.length || 0),
        severity: calculateSeverity(req.required_count, availableEmployees?.length || 0)
      }
    })

    // Calculate overall feasibility score
    const totalRequired = body.required_skills.reduce((sum, skill) => sum + skill.required_count, 0)
    const totalAvailable = skillAvailability.reduce((sum, skill) => sum + skill.available_count, 0)
    const feasibilityScore = totalRequired > 0 ? Math.max(0, Math.min(100, (totalAvailable / totalRequired) * 100)) : 100
    const totalGap = totalRequired - totalAvailable
    
    // Calculate resource utilization
    const resourceUtilization = totalRequired > 0 ? totalAvailable / totalRequired : 1;

    // Sort departments by impact and convert to array
    const sortedDepartmentImpact = Object.values(departmentImpact)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3); // Get top 3 impacted departments

    // Generate AI recommendations with enhanced prompt
    const aiPrompt = createEnhancedAIPrompt({
      projectName: body.project_name,
      startDate: body.start_date,
      endDate: body.end_date,
      skillAvailability,
      feasibilityScore,
      budget: body.budget,
      totalRequired,
      totalAvailable,
      totalGap,
      resourceUtilization,
      timeframe: timeframeInDays
    });

    // Default AI response in case generation fails
    let aiAnalysis: AIRecommendations = {
        assessment: "Feasibility analysis requires review. AI generation failed.",
        recommendations: [
          "Review resource allocation strategy.",
          "Consider hiring for critical skill gaps.",
          "Evaluate timeline feasibility based on resource constraints.",
          "Explore cross-training opportunities for existing staff.",
          "Consider phased implementation to manage resource constraints."
        ],
        risk_factors: [
          "Resource constraints may impact project timeline.",
          "Skill gaps in critical areas could affect deliverable quality.",
          "Budget implications from potential hiring needs.",
          "Potential overallocation of existing resources."
        ],
        cost_analysis: { 
          hiring_costs: totalGap > 0 ? totalGap * 85000 : 0, // Rough estimate of hiring costs
          training_costs: Math.round(totalGap * 0.5 * 5000), // Rough estimate for training
          timeline_impact_days: Math.round(totalGap > 0 ? totalGap * 15 : 0) // Rough estimate of timeline impact
        },
        mitigation_strategies: [
          "Develop a targeted recruitment plan for critical skill gaps.",
          "Create training programs to upskill existing employees.",
          "Consider contractors for short-term skill needs."
        ],
        department_impact: {
          most_affected: sortedDepartmentImpact.map(d => d.name),
          impact_description: `The project will primarily impact ${sortedDepartmentImpact.map(d => d.name).join(", ")} departments based on skill requirements.`
        }
    }

    try {
       const aiResponseString = await generateWithLlama3(aiPrompt);
       const parsedResponse = parseAIResponse(aiResponseString);
       
       // Merge with default values for any missing fields
       aiAnalysis = {
         ...aiAnalysis, // Keep default values as fallback
         ...parsedResponse, // Override with AI generated values
         // Ensure cost analysis has sensible values
         cost_analysis: {
           hiring_costs: parsedResponse.cost_analysis?.hiring_costs || aiAnalysis.cost_analysis.hiring_costs,
           training_costs: parsedResponse.cost_analysis?.training_costs || aiAnalysis.cost_analysis.training_costs,
           timeline_impact_days: parsedResponse.cost_analysis?.timeline_impact_days || aiAnalysis.cost_analysis.timeline_impact_days
         }
       };
    } catch (aiError) {
        console.error("[API] Error generating AI recommendations:", aiError);
        // Keep the default aiAnalysis if generation fails
    }
   
    // Save the analysis
    const { data: savedAnalysis, error: saveError } = await supabaseAdmin
      .from("project_feasibility")
      .insert([{
        project_name: body.project_name,
        analysis_date: new Date().toISOString(),
        start_date: body.start_date,
        end_date: body.end_date,
        feasibility_score: Math.round(feasibilityScore),
        resource_gap: { 
          total_employees_needed: totalRequired, 
          available_employees: totalAvailable, 
          gap: totalGap,
          utilization_percentage: Math.round(resourceUtilization * 100)
        } as Json,
        skill_gap: skillAvailability as Json,
        recommendation: aiAnalysis.assessment,
        ai_recommendations: aiAnalysis as Json,
        department_impact: sortedDepartmentImpact as Json
      }])
      .select()
      .single()

    if (saveError) {
      console.error("[API] Error saving analysis:", saveError)
      throw saveError
    }

    const result: ProjectFeasibilityResult = {
      id: savedAnalysis.id,
      feasibility_score: savedAnalysis.feasibility_score,
      resource_gap: savedAnalysis.resource_gap as any,
      skill_gaps: savedAnalysis.skill_gap as any,
      recommendations: aiAnalysis.recommendations,
      risk_factors: aiAnalysis.risk_factors,
      cost_analysis: aiAnalysis.cost_analysis,
      mitigation_strategies: aiAnalysis.mitigation_strategies || [],
      department_impact: aiAnalysis.department_impact || { most_affected: [], impact_description: "" },
      created_at: savedAnalysis.created_at
    }

    return NextResponse.json(result, {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error: any) {
    console.error("[API] Error in POST /api/workforce/project-feasibility:", error)
    const errorMessage = error.message.includes("relation") || error.message.includes("does not exist") 
                         ? "Database schema error: Required table not found."
                         : error.message || "Internal server error"
    return NextResponse.json({
      error: errorMessage,
      details: error.details || error.hint || null,
      code: error.code || null
    }, {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}
