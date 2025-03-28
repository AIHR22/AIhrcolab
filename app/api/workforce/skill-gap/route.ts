import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { generateJsonWithLlama3 } from "@/lib/together"
import type { WorkforceOptimizationRequest } from "@/types/workforce-planning"
import { Database, Json } from "@/types/supabase"

interface SkillGapAnalysis {
  skill_id: string;
  skill_name: string;
  current_headcount: number;
  required_headcount: number;
  gap: number;
  gap_level: "Critical" | "High" | "Medium" | "Low" | "None";
  recommendation: string;
}

interface SkillGapResult {
  department_id?: string;
  department_name?: string;
  analysis_date: string;
  skill_gaps: SkillGapAnalysis[];
  summary: {
    total_gaps: number;
    critical_gaps: number;
    hiring_needed: number;
    training_needed: number;
    estimated_cost: number;
  };
  recommendation: string;
}

export async function POST(request: Request) {
  try {
    const body: WorkforceOptimizationRequest = await request.json()

    // Get all skills first
    const { data: allSkills, error: allSkillsError } = await supabaseAdmin
      .from("skills")
      .select("*")
      
    if (allSkillsError) throw allSkillsError

    // Fetch employees 
    const { data: employees, error: employeesError } = await supabaseAdmin
      .from("employees")
      .select("*")
    
    if (employeesError) throw employeesError

    // Get filtered employees if department is specified
    const filteredEmployees = body.department_id 
      ? employees.filter(emp => emp.department_id === body.department_id)
      : employees

    // Get employee skills
    const { data: employeeSkills, error: empSkillsError } = await supabaseAdmin
      .from("employee_skills")
      .select("*")
    
    if (empSkillsError) throw empSkillsError

    // Fetch projects and their required skills
    const { data: projects, error: projectsError } = await supabaseAdmin
      .from("projects")
      .select("*")
      .or("status.eq.Planning,status.eq.In Progress")

    if (projectsError) throw projectsError

    // Fetch required skills for projects
    const projectIds = projects.map((p) => p.id)
    const { data: projectSkills, error: projectSkillsError } = await supabaseAdmin
      .from("project_skills")
      .select("*")
      .in("project_id", projectIds)

    if (projectSkillsError) throw projectSkillsError

    // Calculate skill counts and required counts
    const skillCounts = allSkills.map(skill => {
      // Get employee skills for this skill
      const skillEmployees = employeeSkills.filter(es => es.skill_id === skill.id)
      
      // Filter by department if needed
      const departmentEmployeeIds = filteredEmployees.map(emp => emp.id)
      const filteredSkillEmployees = skillEmployees.filter(es => 
        departmentEmployeeIds.includes(es.employee_id)
      )
      
      // Calculate average proficiency
      const avgProficiency = filteredSkillEmployees.length > 0 
        ? filteredSkillEmployees.reduce((sum, es) => sum + (es.proficiency_level || 0), 0) / filteredSkillEmployees.length
        : 0
      
      // Calculate required count from projects
      const skillProjectRequirements = projectSkills.filter(ps => ps.skill_id === skill.id)
      const requiredCount = skillProjectRequirements.reduce((sum, ps) => sum + ps.required_count, 0)
      
      return {
        skill_id: skill.id,
        skill_name: skill.name,
        category: skill.description || 'General',
        current_headcount: filteredSkillEmployees.length,
        required_headcount: requiredCount,
        avg_proficiency: avgProficiency
      }
    })

    // Get department name if department_id is provided
    let departmentName = null
    if (body.department_id) {
      const { data: dept, error: deptError } = await supabaseAdmin
        .from("departments")
        .select("name")
        .eq("id", body.department_id)
        .single()

      if (deptError) throw deptError
      departmentName = dept?.name
    }

    // Prepare data for AI analysis
    const skillData = skillCounts.map(skill => ({
      skill_id: skill.skill_id,
      skill_name: skill.skill_name,
      category: skill.category,
      current_headcount: skill.current_headcount,
      required_headcount: skill.required_headcount,
      gap: Math.max(0, skill.required_headcount - skill.current_headcount),
      avg_proficiency: skill.avg_proficiency,
    }))

    // Format project requirements for the prompt
    const projectRequirements = projectSkills.map(ps => {
      const project = projects.find(p => p.id === ps.project_id);
      const skill = allSkills.find(s => s.id === ps.skill_id);
      return {
        project_id: ps.project_id,
        project_name: project?.name || 'Unknown Project',
        skill_id: ps.skill_id,
        skill_name: skill?.name || 'Unknown Skill',
        required_level: ps.required_level,
        required_count: ps.required_count,
      };
    });

    // Use Llama 3 to analyze skill gaps
    const prompt = `
      I need to analyze skill gaps in ${departmentName ? `the ${departmentName} department` : "our organization"} based on the following data:
      
      Current skill inventory:
      ${skillData.map((s) => `- ${s.skill_name} (${s.category}): ${s.current_headcount} employees, average proficiency: ${s.avg_proficiency.toFixed(1)}/5`).join("\n")}
      
      Required skills for upcoming and current projects:
      ${projectRequirements.map((r) => `- ${r.skill_name} for ${r.project_name}: ${r.required_count} employees needed at level ${r.required_level}/5`).join("\n")}
      
      Based on this information, please provide:
      1. Identification of skill gaps (where we don't have enough employees with the required skills)
      2. Analysis of the severity of each gap (Critical, High, Medium, Low, None)
      3. Recommendations for addressing each gap (hiring, training, etc.)
      4. A JSON object with the following structure:
      {
        "department_id": "${body.department_id || "all"}",
        "department_name": "${departmentName || "All Departments"}",
        "analysis_date": "${new Date().toISOString().split("T")[0]}",
        "skill_gaps": [
          {
            "skill_id": "id",
            "skill_name": "name",
            "current_headcount": number,
            "required_headcount": number,
            "gap": number,
            "gap_level": "Critical|High|Medium|Low|None",
            "recommendation": "detailed recommendation"
          }
        ],
        "summary": {
          "total_gaps": number,
          "critical_gaps": number,
          "hiring_needed": number,
          "training_needed": number,
          "estimated_cost": number
        },
        "recommendation": "overall recommendation"
      }
      
      Only return the JSON object, nothing else.
    `

    const systemPrompt = "You are an HR analytics expert specializing in skill gap analysis and workforce planning. Your response should ONLY be valid JSON without any explanation or markdown formatting.";

    // Generate analysis using Llama 3
    let analysis: SkillGapResult;
    try {
      analysis = await generateJsonWithLlama3<SkillGapResult>(
        prompt,
        systemPrompt,
        0.2,
        2000
      );
    } catch (e) {
      console.error("Error parsing AI response:", e)
      
      // Fallback with basic analysis if AI generation fails
      const basicGaps = skillData.map(skill => {
        const gap = Math.max(0, skill.required_headcount - skill.current_headcount);
        return {
          skill_id: skill.skill_id,
          skill_name: skill.skill_name,
          current_headcount: skill.current_headcount,
          required_headcount: skill.required_headcount,
          gap: gap,
          gap_level: gap > 5 ? "Critical" : gap > 3 ? "High" : gap > 0 ? "Medium" : "None",
          recommendation: gap > 0 ? `Consider hiring ${gap} more employees with this skill.` : "No action needed."
        } as SkillGapAnalysis;
      }).filter(gap => gap.gap > 0);
      
      analysis = {
        department_id: body.department_id,
        department_name: departmentName || "All Departments",
        analysis_date: new Date().toISOString().split("T")[0],
        skill_gaps: basicGaps,
        summary: {
          total_gaps: basicGaps.length,
          critical_gaps: basicGaps.filter(g => g.gap_level === "Critical").length,
          hiring_needed: basicGaps.reduce((sum, g) => sum + g.gap, 0),
          training_needed: Math.floor(basicGaps.reduce((sum, g) => sum + g.gap, 0) * 0.3),
          estimated_cost: basicGaps.reduce((sum, g) => sum + (g.gap * 50000), 0)
        },
        recommendation: "Error generating detailed analysis. This is a basic skill gap assessment based on current staff vs. project requirements."
      };
    }

    // Store the analysis results - first prepare individual skill gap records
    for (const gap of analysis.skill_gaps) {
      if (gap.gap > 0) {
        // Format date for analysis_date
        const today = new Date().toISOString().split('T')[0];
        
        const gapRecord = {
          id: crypto.randomUUID(),
          skill_id: gap.skill_id,
          department_id: body.department_id || null,
          current_headcount: gap.current_headcount,
          required_headcount: gap.required_headcount,
          gap: gap.gap,
          priority: gap.gap_level.toLowerCase(),
          recommendation: gap.recommendation,
          estimated_cost: gap.gap * 50000, // Simple estimation
          analysis_date: today,
          results: null as any // Will be replaced below
        };
        
        // Create results JSON to match the table structure
        gapRecord.results = {
          skill_name: gap.skill_name,
          gap_level: gap.gap_level,
          details: {
            current: gap.current_headcount,
            required: gap.required_headcount,
            recommendation: gap.recommendation
          }
        };
        
        // Insert gap analysis
        const { error: insertError } = await supabaseAdmin
          .from("skill_gap_analysis")
          .upsert(gapRecord)
          
        if (insertError) {
          console.error("Error inserting skill gap analysis:", insertError)
        }
      }
    }

    return NextResponse.json({
      success: true,
      analysis,
      saved: true
    })
  } catch (error: any) {
    console.error("Error analyzing skill gaps:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}

