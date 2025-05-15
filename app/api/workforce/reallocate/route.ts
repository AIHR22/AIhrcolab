import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { ReallocationRequest, ReallocationResult } from "@/lib/api/workforce"

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
    
    // Parse request body with error handling
    let body: ReallocationRequest;
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
    
    // Create mock reallocation recommendations
    const mockRecommendations = [
      {
        employee_id: "emp-1",
        employee_name: "Jane Smith",
        current_allocation: 65,
        recommended_allocation: 20,
        skill_match_score: 92,
        relevant_skills: ["React", "TypeScript", "UI Design"]
      },
      {
        employee_id: "emp-2",
        employee_name: "David Johnson",
        current_allocation: 70,
        recommended_allocation: 15,
        skill_match_score: 88,
        relevant_skills: ["Node.js", "API Design", "Database Modeling"]
      },
      {
        employee_id: "emp-3",
        employee_name: "Alex Chen",
        current_allocation: 60,
        recommended_allocation: 25,
        skill_match_score: 85,
        relevant_skills: ["Project Management", "Agile", "Requirements Analysis"]
      },
      {
        employee_id: "emp-4",
        employee_name: "Sarah Williams",
        current_allocation: 72,
        recommended_allocation: 13,
        skill_match_score: 80,
        relevant_skills: ["DevOps", "Cloud Architecture", "CI/CD"]
      }
    ];
    
    // Construct the result that matches the interface in lib/api/workforce.ts
    const result: ReallocationResult = {
      summary: {
        total_underutilized: 14,
        total_matching: 8,
        total_high_matches: 4,
        total_recommended: 4,
        total_implemented: 0,
        average_skill_match: 86,
        additional_capacity: 73
      },
      recommendations: mockRecommendations,
      implemented_allocations: [] // None implemented yet
    };

    return NextResponse.json(result)

  } catch (error: any) {
    console.error("[API] Error in workforce reallocation:", error)
    return NextResponse.json({
      error: error.message || "Internal server error"
    }, { status: 500 })
  }
} 