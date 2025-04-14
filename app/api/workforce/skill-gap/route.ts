import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    // Extract parameters
    const { departmentId } = body;
    
    if (!departmentId) {
      return NextResponse.json(
        { error: "Department ID is required" },
        { status: 400 }
      );
    }
    
    // Get department info
    const { data: department, error: deptError } = await supabase
      .from('departments')
      .select('name')
      .eq('id', departmentId)
      .single();
      
    if (deptError) {
      console.error("Error fetching department:", deptError);
      // Continue with mock data instead of failing
    }
    
    // In a real application, we would analyze current employee skills vs. future needs
    // For the demo, we'll generate mock skill gap data
    const skillGaps = [
      {
        skill: "Machine Learning",
        level: "High",
        current_count: 2,
        required_count: 5,
        recommendation: "Hire 2 ML Engineers and train 1 existing employee"
      },
      {
        skill: "Cloud Architecture",
        level: "Medium",
        current_count: 4,
        required_count: 6,
        recommendation: "Provide AWS certification training to 2 existing engineers"
      },
      {
        skill: "DevOps",
        level: "Low",
        current_count: 3,
        required_count: 4,
        recommendation: "Contract temporarily while upskilling 1 engineer"
      },
      {
        skill: "UI/UX Design",
        level: "Medium",
        current_count: 2,
        required_count: 4,
        recommendation: "Hire 1 senior designer and 1 junior designer"
      }
    ];
    
    // Generate training recommendations
    const trainingRecommendations = [
      "Implement a cloud certification program for engineering team",
      "Provide advanced ML training for 3 software engineers",
      "Cross-train UI developers in UX design principles",
      "Establish DevOps workshop series for the engineering team"
    ];
    
    // Generate hiring recommendations
    const hiringRecommendations = [
      "Prioritize hiring 2 ML engineers in Q3",
      "Add 1 senior UI/UX designer",
      "Hire 1 DevOps engineer on contract basis for 6 months",
      "Consider remote-only options for hard-to-fill roles"
    ];
    
    return NextResponse.json({
      department_id: departmentId,
      department_name: department?.name,
      analysis_date: new Date().toISOString(),
      gaps: skillGaps,
      training_recommendations: trainingRecommendations,
      hiring_recommendations: hiringRecommendations
    });
    
  } catch (error) {
    console.error("Server error in skill gap API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

