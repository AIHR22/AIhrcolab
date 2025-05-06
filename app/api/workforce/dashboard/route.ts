import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
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
    
    // Get total department count
    const { count: departmentCount, error: departmentError } = await supabaseAdmin
      .from('departments')
      .select('id', { count: 'exact', head: true });

    console.log("[API] Department count query result:", { departmentCount, departmentError });

    if (departmentError) {
      console.error("[API] Error fetching department count:", departmentError);
      return NextResponse.json(
        { error: departmentError.message || "Failed to fetch department count" },
        { status: 500 }
      );
    }

    // Ensure departmentCount is properly handled
    const totalDepartments = typeof departmentCount === 'number' ? departmentCount : 0;
    console.log("[API] Final department count:", totalDepartments);

    // Get total employee count
    const { count: employeeCount, error: employeeError } = await supabaseAdmin
      .from('employees')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active');

    if (employeeError) {
      console.error("[API] Error fetching employee count:", employeeError);
      return NextResponse.json(
        { error: employeeError.message || "Failed to fetch employee count" },
        { status: 500 }
      );
    }

    // Get real attrition and growth rates from the most recent workforce plan
    const { data: workforcePlans, error: plansError } = await supabaseAdmin
      .from('workforce_plans')
      .select('attrition_rate, growth_rate, department_id')
      .order('plan_date', { ascending: false })
      .limit(1);

    if (plansError) {
      console.error("[API] Error fetching workforce plans:", plansError);
      return NextResponse.json(
        { error: plansError.message || "Failed to fetch workforce plans" },
        { status: 500 }
      );
    }

    // Use rates from the most recent active workforce plan
    const latestPlan = workforcePlans?.[0] || { attrition_rate: 0, growth_rate: 0 };
    
    // Return dashboard data with latest metrics
    return NextResponse.json({
      total_departments: totalDepartments,
      total_employees: employeeCount || 0,
      attrition_rate: latestPlan.attrition_rate,
      growth_rate: latestPlan.growth_rate,
      has_active_plan: workforcePlans && workforcePlans.length > 0
    });
      
  } catch (error: any) {
    console.error("[API] Error in workforce dashboard API:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}