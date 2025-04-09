import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import type { AttritionPredictionRequest, AttritionPredictionResult } from "@/lib/api/workforce"

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
    
    let body: AttritionPredictionRequest;
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
    
    const { months = 12, department_id, include_factors = false } = body
    
    // Return mock data instead of querying the database
    const baseAttritionRate = 12.5 // Example: 12.5% annual attrition rate
    const mockHeadcount = 42 // Match the value in forecast endpoint for consistency
    
    // Generate monthly predictions with slight variations
    const monthlyPredictions = []
    for (let i = 0; i < months; i++) {
      const month = new Date()
      month.setMonth(month.getMonth() + i + 1)
      
      // Create slight variations in the attrition rate for realism
      const variation = (Math.random() * 3) - 1.5 // -1.5% to +1.5% variation
      const monthRate = baseAttritionRate + variation
      
      // Calculate predicted departures
      const predictedAttrition = Math.round((monthRate / 100) * mockHeadcount)
      
      monthlyPredictions.push({
        month: month.toISOString().substring(0, 7), // YYYY-MM format
        rate: parseFloat(monthRate.toFixed(1)),
        predicted_attrition_count: predictedAttrition
      })
    }
    
    // Calculate high risk employees (mock data)
    const highRiskEmployees = [
      { id: "emp-1", name: "Jane Smith", risk_score: 85, risk_level: "high", key_factors: ["long commute", "overdue promotion", "competitive industry"] },
      { id: "emp-2", name: "John Doe", risk_score: 78, risk_level: "high", key_factors: ["limited growth opportunity", "market demand for skills"] },
      { id: "emp-3", name: "Alex Chen", risk_score: 72, risk_level: "medium", key_factors: ["compensation below market rate", "high workload"] }
    ]
    
    // Create result object matching the expected structure
    const result: AttritionPredictionResult = {
      department_id: department_id || null,
      department_name: department_id ? "Engineering" : "Overall Company",
      average_rate: baseAttritionRate,
      monthly_predictions: monthlyPredictions,
      high_risk_employees: include_factors ? highRiskEmployees : undefined,
      risk_factors: include_factors ? [
        { factor: "compensation", impact_score: 72 },
        { factor: "work-life balance", impact_score: 68 },
        { factor: "career growth", impact_score: 65 },
        { factor: "commute distance", impact_score: 52 }
      ] : undefined,
      predicted_annual_cost: 125000 // Example value in dollars
    }
    
    return NextResponse.json(result)
  } catch (error: any) {
    console.error("[API] Error in attrition prediction:", error)
    return NextResponse.json({
      error: error.message || "Internal server error"
    }, { status: 500 })
  }
} 