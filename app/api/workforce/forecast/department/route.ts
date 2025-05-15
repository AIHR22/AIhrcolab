import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import type { Json } from "@/types/supabase";

interface DepartmentForecastRequest {
  department_id?: string; // Optional: If provided, forecast for this department
  months?: number;        // Optional: Number of months to forecast (default 12)
}

// Define a type for the expected department data structure
interface DepartmentData {
    name: string;
    growth_rate: number | null;
    attrition_rate: number | null;
}

export async function POST(request: Request) {
  try {
    // Check if Supabase admin client is available
    if (!supabaseAdmin) {
      console.error("[API] Supabase admin client not available - check environment variables");
      return NextResponse.json(
        { 
          error: "Database connection error: Supabase client not initialized correctly",
          message: "Please check your Supabase environment variables in .env.local"
        }, 
        { status: 500 }
      );
    }
    
    // Add more robust JSON parsing with error handling
    let body: DepartmentForecastRequest;
    try {
      // Check if the request body is empty
      const text = await request.text();
      if (!text) {
        // Handle empty request body case
        body = {}; // Use default empty object
      } else {
        body = JSON.parse(text);
      }
    } catch (e) {
      console.error("[API] JSON parsing error:", e);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { department_id, months = 12 } = body;

    // Fetch actual department data and headcount
    let departmentName = "Overall Company";
    let currentHeadcount = 0;
    let growthRate = 0.05; // Default if not set
    let attritionRate = 0.03; // Default if not set

    if (department_id) {
      // Get department details including name and rates
      const { data: deptData, error: deptError } = await supabaseAdmin
        .from('departments')
        .select('name, growth_rate, attrition_rate')
        .eq('id', department_id)
        .single();

      if (deptError) throw deptError;
      
      if (deptData) {
        departmentName = deptData.name;
        growthRate = deptData.growth_rate || growthRate;
        attritionRate = deptData.attrition_rate || attritionRate;
      }

      // Get current headcount for department
      const { count, error: countError } = await supabaseAdmin
        .from('employees')
        .select('id', { count: 'exact', head: true })
        .eq('department_id', department_id)
        .eq('status', 'active');

      if (countError) throw countError;
      currentHeadcount = count || 0;
    } else {
      // Get total company headcount
      const { count, error: countError } = await supabaseAdmin
        .from('employees')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active');

      if (countError) throw countError;
      currentHeadcount = count || 0;
    }

    // Generate monthly projections
    const projections = [];
    let projectedHeadcount = currentHeadcount;

    for (let i = 0; i < months; i++) {
        const loopMonth = new Date();
        loopMonth.setMonth(new Date().getMonth() + i + 1);

        // Improved growth model calculation:
        // Convert percentage rates to decimals (5% → 0.05) and adjust monthly
        const monthlyGrowthRate = growthRate / 100 / 12; // Convert annual rate to monthly
        const monthlyAttritionRate = attritionRate / 100 / 12; // Convert annual rate to monthly
        
        // Calculate net change rate (can be positive or negative)
        const netMonthlyChangeRate = monthlyGrowthRate - monthlyAttritionRate;
        
        // Apply the rate to current headcount
        const headcountChange = projectedHeadcount * netMonthlyChangeRate;
        
        // Update the projected headcount
        projectedHeadcount = Math.max(0, Math.round(projectedHeadcount + headcountChange));

        projections.push({
            month: loopMonth.toISOString().substring(0, 7), // YYYY-MM format
            headcount: projectedHeadcount
        });
    }

    // Generate key findings based on the projections
    const netChange = projections.length > 0 ? projections[projections.length - 1].headcount - currentHeadcount : 0;
    const percentChange = currentHeadcount > 0 ? ((netChange / currentHeadcount) * 100).toFixed(1) : '0.0';

    const keyFindings = [
        `Projected ${netChange >= 0 ? 'growth' : 'reduction'} of ${Math.abs(netChange)} employees (${percentChange}%) over the next ${months} months for ${departmentName}.`,
        projections.length > 0 ? `Expected to reach ${projections[projections.length - 1].headcount} employees by ${projections[projections.length - 1].month}.` : `Current headcount is ${currentHeadcount}.`,
        `Based on average quarterly growth rate of ${(growthRate * 100).toFixed(1)}% and attrition rate of ${(attritionRate * 100).toFixed(1)}%.`
    ];

    if (netChange > currentHeadcount * 0.1 && currentHeadcount > 0) {
      keyFindings.push("Significant hiring efforts may be required to meet projected growth.");
    } else if (netChange < 0) {
      keyFindings.push("Potential need for workforce reduction strategies if trends continue.");
    }

    const result = {
      department_id: department_id || null,
      department_name: departmentName,
      current_headcount: currentHeadcount,
      projections,
      growth_rate: growthRate * 100,
      attrition_rate: attritionRate * 100,
      confidence: 75,
      key_findings: keyFindings
    };

    return NextResponse.json(result);
      
  } catch (error: any) {
    console.error("[API] Error in department forecast API:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}