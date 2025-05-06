import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import type { Json } from "@/types/supabase"
// Keep original import but don't use these types directly in our response
import { CostOptimizationRequest, CostOptimizationResult, TimePeriod } from "@/lib/api/workforce"

// Remove the interface extensions that conflict with imported types

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
    
    let body: any; // Use any type to avoid type conflicts
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
    
    const { 
      time_period = "QUARTERLY",
      time_frame = "monthly", // Support both for backward compatibility
      department_id,
      include_outsourcing = false
    } = body
    
    // Use time_period if available, otherwise fall back to time_frame
    const usedTimePeriod = time_period || time_frame;
    
    // Using mock data instead of database queries
    // Mock department cost data
    const departmentAnalysis = [
      {
        department_id: "dept-1",
        department_name: "Engineering",
        current_cost: 350000,
        optimized_cost: 315000,
        potential_savings: 35000,
        optimization_strategies: [
          "Reduce contractor usage by 15%",
          "Implement skills-based allocation",
          "Optimize resource sharing with Product team"
        ]
      },
      {
        department_id: "dept-2",
        department_name: "Product",
        current_cost: 210000,
        optimized_cost: 198000,
        potential_savings: 12000,
        optimization_strategies: [
          "Consolidate project management tools",
          "Streamline approval processes"
        ]
      },
      {
        department_id: "dept-3",
        department_name: "Marketing",
        current_cost: 185000,
        optimized_cost: 167000,
        potential_savings: 18000,
        optimization_strategies: [
          "Reduce agency spend by 10%",
          "Focus on high-ROI channels"
        ]
      }
    ]
    
    // Filter to specific department if requested
    const filteredDepartments = department_id 
      ? departmentAnalysis.filter(d => d.department_id === department_id)
      : departmentAnalysis
    
    // Calculate totals
    const totalCurrentCost = filteredDepartments.reduce((sum, dept) => sum + dept.current_cost, 0)
    const totalOptimizedCost = filteredDepartments.reduce((sum, dept) => sum + dept.optimized_cost, 0)
    const totalSavings = totalCurrentCost - totalOptimizedCost
    
    // Mock outsourcing analysis if requested
    const outsourcingAnalysis = include_outsourcing ? {
      potential_outsourcing_savings: Math.round(totalCurrentCost * 0.08), // 8% savings via outsourcing
      recommended_functions: [
        "Quality Assurance Testing",
        "Technical Support",
        "Content Creation"
      ],
      risks: [
        "Knowledge transfer challenges",
        "Communication overhead",
        "Quality control issues"
      ]
    } : undefined
    
    // Create a result object with both new field names and fields expected by the type
    const result = {
      // Fields expected by the imported type
      summary: {
        current_cost: totalCurrentCost,
        optimized_cost: totalOptimizedCost,
        potential_savings: totalSavings,
        savings_percentage: parseFloat(((totalSavings / totalCurrentCost) * 100).toFixed(1))
      },
      recommendations: [
        "Consolidate vendor contracts for 12% savings",
        "Implement skill-based resource allocation",
        "Optimize contractor utilization",
        "Review and adjust team structures"
      ],
      department_analysis: filteredDepartments,
      
      // Additional fields that might be expected by frontend
      time_frame: usedTimePeriod,
      department_id: department_id || null,
      total_current_cost: totalCurrentCost,
      total_optimized_cost: totalOptimizedCost,
      total_savings: totalSavings,
      savings_percentage: parseFloat(((totalSavings / totalCurrentCost) * 100).toFixed(1)),
      outsourcing_analysis: outsourcingAnalysis,
      key_recommendations: [
        "Consolidate vendor contracts for 12% savings",
        "Implement skill-based resource allocation",
        "Optimize contractor utilization",
        "Review and adjust team structures"
      ]
    }
    
    return NextResponse.json(result)
  } catch (error: any) {
    console.error("[API] Error in workforce cost optimization:", error)
    return NextResponse.json({
      error: error.message || "Internal server error"
    }, { status: 500 })
  }
} 