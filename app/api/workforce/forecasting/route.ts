import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { generateJsonWithLlama3 } from "@/lib/together"
import { Database } from "@/types/supabase"

interface WorkforceForecast {
  department_id: string;
  department_name: string;
  forecast_date: string;
  forecast_type: string;
  headcount_prediction: number;
  confidence_score: number;
  factors: {
    historical_growth: number;
    project_demands: number;
    seasonal_factors: number;
    other_factors: string;
  };
}

export async function POST(request: Request) {
  try {
    const requestData = await request.json()
    const { department_id, time_frame = "6_months" } = requestData
    
    // Ensure department_id is a clean string without brackets if provided
    const cleanDepartmentId = department_id ? department_id.replace(/[\[\]"]/g, '') : null;

    // Get historical headcount data
    let employeeQuery = supabaseAdmin
      .from('employees')
      .select('id, department, hire_date, departments!inner(id, name)')
      .gte('hire_date', new Date(new Date().setMonth(new Date().getMonth() - 24)).toISOString())
      .order('hire_date', { ascending: false });
    
    // Only apply department filter if it's provided
    if (cleanDepartmentId) {
      employeeQuery = employeeQuery.eq('department', cleanDepartmentId);
    }
    
    const { data: historicalData, error: histError } = await employeeQuery;
    
    if (histError) throw histError
    
    // Process historical data to create month-by-month summary
    const monthlyData: any[] = []
    const startDate = new Date(new Date().setMonth(new Date().getMonth() - 12))
    const endDate = new Date()
    
    // Create month buckets
    const months: any[] = []
    let currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      months.push({
        month_date: new Date(currentDate).toISOString().split('T')[0].substring(0, 7),
        department_id: department_id || '',
        department_name: '',
        monthly_hires: 0
      })
      currentDate.setMonth(currentDate.getMonth() + 1)
    }
    
    // Count hires by month
    if (historicalData) {
      historicalData.forEach((employee: any) => {
        const hireMonth = employee.hire_date.substring(0, 7)
        const monthIndex = months.findIndex(m => m.month_date === hireMonth)
        if (monthIndex >= 0) {
          months[monthIndex].monthly_hires += 1
          months[monthIndex].department_name = employee.departments.name
          months[monthIndex].department_id = employee.department
        }
      })
    }

    // Get project pipeline data
    const { data: projectPipeline, error: projError } = await supabaseAdmin
      .from("projects")
      .select(`
        id,
        name,
        start_date,
        end_date,
        status,
        project_skills (
          skill_id,
          required_count
        )
      `)
      .or("status.eq.Planning,status.eq.In Progress")
      .gte("end_date", new Date().toISOString().split("T")[0])

    if (projError) throw projError

    // Get current department headcounts
    let deptQuery = supabaseAdmin.from('departments').select(`
        id,
        name,
        employees!inner(id)
      `);
      
    // Only apply department filter if it's provided  
    if (cleanDepartmentId) {
      deptQuery = deptQuery.eq('id', cleanDepartmentId);
    }
    
    const { data: deptHeadcounts, error: deptError } = await deptQuery;
    
    if (deptError) throw deptError
    
    // Format department headcounts
    const formattedDeptHeadcounts = deptHeadcounts.map((dept: any) => ({
      department_id: dept.id,
      department_name: dept.name,
      current_headcount: dept.employees ? dept.employees.length : 0
    }))

    // Use Llama 3 to generate workforce forecasts
    const prompt = `
      I need to forecast workforce needs for the next ${time_frame.replace("_", " ")} based on the following data:
      
      Historical hiring data by month:
      ${months.map((d: any) => `- ${d.department_name || "No department"} (${d.month_date}): ${d.monthly_hires} hires`).join("\n")}
      
      Current department headcounts:
      ${formattedDeptHeadcounts.map((d: any) => `- ${d.department_name}: ${d.current_headcount} employees`).join("\n")}
      
      Project pipeline:
      ${projectPipeline
        .map((p: any) => {
          const totalHeadcount = p.project_skills ? p.project_skills.reduce((sum: number, ps: any) => sum + ps.required_count, 0) : 0
          return `- ${p.name} (${p.status}): ${p.start_date} to ${p.end_date}, estimated headcount needed: ${totalHeadcount}`
        })
        .join("\n")}
      
      Based on this information, please provide:
      1. Headcount predictions for each department for the next ${time_frame.replace("_", " ")}
      2. Confidence score for each prediction (0-100%)
      3. Key factors influencing the forecast
      4. A JSON array with the following structure for each department:
      [
        {
          "department_id": "id",
          "department_name": "name",
          "forecast_date": "YYYY-MM-DD",
          "forecast_type": "${time_frame}",
          "headcount_prediction": number,
          "confidence_score": number,
          "factors": {
            "historical_growth": number,
            "project_demands": number,
            "seasonal_factors": number,
            "other_factors": string
          }
        },
        ...
      ]
      
      Only return the JSON array, nothing else.
    `

    const systemPrompt = "You are an HR analytics expert specializing in workforce planning and forecasting. Your response should ONLY be valid JSON without any explanation or markdown formatting.";

    // Generate forecasts using Llama 3
    let forecasts: WorkforceForecast[];
    try {
      forecasts = await generateJsonWithLlama3<WorkforceForecast[]>(
        prompt,
        systemPrompt,
        0.2,
        2000
      );
      
      // Validate forecasts to ensure they have valid department IDs
      forecasts = forecasts.map(forecast => {
        // Clean the department_id of any brackets or quotes
        forecast.department_id = forecast.department_id ? forecast.department_id.replace(/[\[\]"]/g, '') : forecast.department_id;
        
        // If department_id is "No department", replace with a valid UUID if we have department data
        if (forecast.department_id === "No department" && formattedDeptHeadcounts.length > 0) {
          forecast.department_id = formattedDeptHeadcounts[0].department_id;
          forecast.department_name = formattedDeptHeadcounts[0].department_name;
        }
        
        return forecast;
      });
    } catch (e) {
      console.error("Error parsing AI response:", e)
      
      // Fallback with default values if AI generation fails
      forecasts = formattedDeptHeadcounts.map((dept: any) => ({
        department_id: dept.department_id, // Use the actual department ID
        department_name: dept.department_name,
        forecast_date: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        forecast_type: time_frame,
        headcount_prediction: dept.current_headcount + 2, // Simple default prediction
        confidence_score: 50,
        factors: {
          historical_growth: 0.5,
          project_demands: 0.5,
          seasonal_factors: 0.5,
          other_factors: "Error generating forecast. Using default values."
        }
      }))
    }

    // Store the forecasts
    const insertData = forecasts.map((f) => {
      // Ensure department_id is a valid string
      let departmentId = f.department_id;
      if (typeof departmentId === 'string') {
        departmentId = departmentId.replace(/[\[\]"]/g, '');
      } else if (departmentId === null || departmentId === undefined) {
        // If department_id is null or undefined and we have department data, use the first one
        departmentId = formattedDeptHeadcounts.length > 0 ? formattedDeptHeadcounts[0].department_id : null;
      }
      
      return {
        id: crypto.randomUUID(),
        department_id: departmentId,
        forecast_date: f.forecast_date,
        forecast_type: f.forecast_type,
        headcount_prediction: f.headcount_prediction,
        confidence_score: f.confidence_score,
        factors: f.factors
      };
    });
    
    // Filter out any forecasts with invalid department_ids
    const validInsertData = insertData.filter(item => 
      item.department_id && typeof item.department_id === 'string' && item.department_id !== 'No department'
    );

    const { data: savedForecasts, error: saveError } = await supabaseAdmin
      .from("workforce_forecasts")
      .upsert(
        validInsertData,
        { onConflict: "department_id,forecast_date,forecast_type" }
      )
      .select()

    if (saveError) {
      throw saveError
    }

    return NextResponse.json({
      success: true,
      forecasts,
      saved_records: savedForecasts,
    })
  } catch (error: any) {
    console.error("Error generating workforce forecasts:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}

