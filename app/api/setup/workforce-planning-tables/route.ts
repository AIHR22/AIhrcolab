import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST() {
  try {
    // Create project_skills table to track skills needed for projects
    const createProjectSkillsTable = await supabaseAdmin.query(`
      CREATE TABLE IF NOT EXISTS project_skills (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
        required_level INT NOT NULL DEFAULT 1,
        required_count INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(project_id, skill_id)
      );
    `)

    // Create workforce_forecasts table
    const createWorkforceForecasts = await supabaseAdmin.query(`
      CREATE TABLE IF NOT EXISTS workforce_forecasts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
        forecast_date DATE NOT NULL,
        forecast_type VARCHAR(50) NOT NULL,
        headcount_prediction INT NOT NULL,
        confidence_score FLOAT,
        factors JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)

    // Create skill_gap_analysis table
    const createSkillGapAnalysis = await supabaseAdmin.query(`
      CREATE TABLE IF NOT EXISTS skill_gap_analysis (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
        department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
        current_headcount INT NOT NULL,
        required_headcount INT NOT NULL,
        gap INT NOT NULL,
        priority VARCHAR(20),
        recommendation TEXT,
        estimated_cost DECIMAL(10,2),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)

    // Create workload_analysis table
    const createWorkloadAnalysis = await supabaseAdmin.query(`
      CREATE TABLE IF NOT EXISTS workload_analysis (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
        analysis_date DATE NOT NULL,
        utilization_percentage FLOAT NOT NULL,
        overallocated BOOLEAN DEFAULT FALSE,
        underallocated BOOLEAN DEFAULT FALSE,
        recommendation TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)

    // Create hiring_recommendations table
    const createHiringRecommendations = await supabaseAdmin.query(`
      CREATE TABLE IF NOT EXISTS hiring_recommendations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
        department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
        position_title VARCHAR(100) NOT NULL,
        count INT NOT NULL DEFAULT 1,
        urgency VARCHAR(20),
        estimated_salary DECIMAL(10,2),
        estimated_cost DECIMAL(10,2),
        justification TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)

    // Create project_feasibility table
    const createProjectFeasibility = await supabaseAdmin.query(`
      CREATE TABLE IF NOT EXISTS project_feasibility (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        analysis_date DATE NOT NULL,
        feasibility_score FLOAT NOT NULL,
        resource_gap JSONB,
        skill_gap JSONB,
        recommendation TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)

    return NextResponse.json({
      success: true,
      message: "Workforce planning tables created successfully",
    })
  } catch (error: any) {
    console.error("Error creating workforce planning tables:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}

