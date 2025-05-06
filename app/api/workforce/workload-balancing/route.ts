import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { generateJsonWithLlama3 } from "@/lib/together"
import type { WorkloadBalancingRequest } from "@/types/workforce-planning"
import { Database, Json } from "@/types/supabase"

interface WorkloadAnalysisResult {
  employee_id: string;
  employee_name: string;
  utilization_percentage: number;
  overallocated: boolean;
  underallocated: boolean;
  recommendation: string;
}

export async function POST(request: Request) {
  try {
    const body: WorkloadBalancingRequest = await request.json()

    // Get employee allocations
    let query = supabaseAdmin.from("project_allocations").select(`
        id,
        project_id,
        employee_id,
        role,
        start_date,
        end_date,
        projects (
          id,
          name,
          status
        ),
        employees (
          id,
          name,
          position_id,
          department_id
        )
      `)

    // Apply filters
    if (body.department_id) {
      query = query.eq("employees.department_id", body.department_id)
    }

    if (body.project_id) {
      query = query.eq("project_id", body.project_id)
    }

    if (body.date_range) {
      query = query.lte("start_date", body.date_range.end_date).gte("end_date", body.date_range.start_date)
    } else {
      // Default to current allocations
      const today = new Date().toISOString().split("T")[0]
      query = query.gte("end_date", today)
    }

    const { data: allocations, error: allocError } = await query

    if (allocError) throw allocError

    // For department names
    const { data: departments, error: deptError } = await supabaseAdmin
      .from("departments")
      .select("id, name")

    if (deptError) throw deptError

    // Calculate current utilization by employee
    const employeeUtilization: Record<
      string,
      {
        employee_id: string
        name: string
        position: string
        department: string
        total_allocation: number
        allocations: any[]
      }
    > = {}

    const DEFAULT_ALLOCATION = 50; // Default allocation percentage if not specified
    
    allocations.forEach((alloc: any) => {
      const empId = alloc.employee_id

      // Find department name
      const deptName = alloc.employees.department_id 
        ? departments.find(d => d.id === alloc.employees.department_id)?.name || "Unknown Department"
        : "No Department";

      if (!employeeUtilization[empId]) {
        employeeUtilization[empId] = {
          employee_id: empId,
          name: alloc.employees.name,
          position: alloc.employees.position_id || "No position",
          department: deptName,
          total_allocation: 0,
          allocations: [],
        }
      }

      // If allocation_percentage doesn't exist, use a default value
      const allocationPct = alloc.allocation_percentage || DEFAULT_ALLOCATION;
      
      employeeUtilization[empId].total_allocation += allocationPct
      employeeUtilization[empId].allocations.push({
        project_name: alloc.projects.name,
        project_id: alloc.project_id,
        allocation_percentage: allocationPct,
        start_date: alloc.start_date,
        end_date: alloc.end_date,
      })
    })

    // Use Llama 3 to analyze workload balance and make recommendations
    const prompt = `
      I need to analyze employee workload balance based on project allocations.
      
      Employee utilization:
      ${Object.values(employeeUtilization)
        .map(
          (emp) =>
            `- ${emp.name} (${emp.position}, ${emp.department}): ${emp.total_allocation}% allocated
         Projects: ${emp.allocations.map((a) => `${a.project_name} (${a.allocation_percentage}%)`).join(", ")}`,
        )
        .join("\n")}
      
      Based on this information, please provide:
      1. Identification of overallocated employees (>100% allocation)
      2. Identification of underallocated employees (<70% allocation)
      3. Recommendations for balancing workload
      4. A JSON array with the following structure for each employee:
      [
        {
          "employee_id": "id",
          "employee_name": "name",
          "utilization_percentage": number,
          "overallocated": boolean,
          "underallocated": boolean,
          "recommendation": "detailed recommendation"
        },
        ...
      ]
      
      Only return the JSON array, nothing else.
    `

    const systemPrompt = "You are an HR analytics expert specializing in workload balancing and resource allocation. Your response should ONLY be valid JSON without any explanation or markdown formatting.";

    // Generate analysis using Llama 3
    let analysisResults: WorkloadAnalysisResult[];
    try {
      analysisResults = await generateJsonWithLlama3<WorkloadAnalysisResult[]>(
        prompt,
        systemPrompt,
        0.2,
        2000
      );
    } catch (e) {
      console.error("Error parsing AI response:", e)
      
      // Fallback with calculated values if AI generation fails
      analysisResults = Object.values(employeeUtilization).map((emp) => ({
        employee_id: emp.employee_id,
        employee_name: emp.name,
        utilization_percentage: emp.total_allocation,
        overallocated: emp.total_allocation > 100,
        underallocated: emp.total_allocation < 70,
        recommendation: emp.total_allocation > 100 
          ? "This employee is overallocated. Consider redistributing some of their work." 
          : emp.total_allocation < 70 
            ? "This employee is underallocated. Consider assigning more tasks to them."
            : "This employee's workload is well-balanced."
      }))
    }

    // Store the analysis results
    const insertData = analysisResults.map((result) => ({
      id: crypto.randomUUID(),
      employee_id: result.employee_id,
      analysis_date: new Date().toISOString().split("T")[0],
      utilization_percentage: result.utilization_percentage,
      overallocated: result.overallocated,
      underallocated: result.underallocated,
      recommendation: result.recommendation
    }));
    
    const { data: savedAnalysis, error: saveError } = await supabaseAdmin
      .from("workload_analysis")
      .upsert(
        insertData,
        { onConflict: "employee_id,analysis_date" }
      )
      .select()

    if (saveError) {
      throw saveError
    }

    return NextResponse.json({
      success: true,
      analysis: analysisResults,
      saved_records: savedAnalysis,
    })
  } catch (error: any) {
    console.error("Error analyzing workload balance:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}

