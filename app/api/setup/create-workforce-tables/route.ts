import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import type { Json } from "@/types/supabase"

export async function POST() {
  try {
    // Check if the shared admin client is available
    if (!supabaseAdmin) {
      console.error("Database setup error: Supabase admin client is not available.");
      return NextResponse.json({ error: "Server configuration error: Supabase client not initialized" }, { status: 500 });
    }

    // Ensure we have the create_table_if_not_exists function
    const { error: functionError } = await supabaseAdmin.rpc("create_function_if_not_exists", {
      function_name: "create_table_if_not_exists",
      function_definition: `
        CREATE OR REPLACE FUNCTION create_table_if_not_exists(
          table_name text,
          columns text
        ) RETURNS void AS $$
        BEGIN
          EXECUTE format('
            CREATE TABLE IF NOT EXISTS %I (
              %s
            );
          ', table_name, columns);
        END;
        $$ LANGUAGE plpgsql;
      `,
    })

    if (functionError) {
      console.error("Function creation error:", functionError);
      // Try a direct SQL approach if RPC method fails
      const { error: directFunctionError } = await supabaseAdmin.query(`
        CREATE OR REPLACE FUNCTION create_table_if_not_exists(
          table_name text,
          columns text
        ) RETURNS void AS $$
        BEGIN
          EXECUTE format('
            CREATE TABLE IF NOT EXISTS %I (
              %s
            );
          ', table_name, columns);
        END;
        $$ LANGUAGE plpgsql;
      `);
      
      if (directFunctionError) {
        console.error("Direct function creation error:", directFunctionError);
        throw directFunctionError;
      }
    }

    // Now create all the required tables for workforce planning
    
    // 1. Add missing columns to departments table if it exists
    try {
      const { error: departmentsUpdateError } = await supabaseAdmin.query(`
        ALTER TABLE IF EXISTS departments 
        ADD COLUMN IF NOT EXISTS growth_rate DECIMAL DEFAULT 0.05,
        ADD COLUMN IF NOT EXISTS attrition_rate DECIMAL DEFAULT 0.03,
        ADD COLUMN IF NOT EXISTS avg_salary DECIMAL DEFAULT 85000;
      `);
      
      if (departmentsUpdateError) {
        console.error("Error updating departments table:", departmentsUpdateError);
      }
    } catch (e) {
      console.warn("Error updating departments table:", e);
    }
    
    // 2. Create project_skills table if it doesn't exist
    const { error: projectSkillsError } = await supabaseAdmin.rpc("create_table_if_not_exists", {
      table_name: "project_skills",
      columns: `
        id uuid primary key default uuid_generate_v4(),
        project_id uuid references projects(id) on delete cascade,
        skill_id uuid references skills(id) on delete cascade,
        required_level integer default 1,
        required_count integer default 1,
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now(),
        UNIQUE(project_id, skill_id)
      `,
    })

    if (projectSkillsError) {
      console.error("Error creating project_skills table:", projectSkillsError);
    }
    
    // 3. Create employee_skills table if it doesn't exist
    const { error: employeeSkillsError } = await supabaseAdmin.rpc("create_table_if_not_exists", {
      table_name: "employee_skills",
      columns: `
        id uuid primary key default uuid_generate_v4(),
        employee_id uuid references employees(id) on delete cascade,
        skill_id uuid references skills(id) on delete cascade,
        proficiency_level integer default 1,
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now(),
        UNIQUE(employee_id, skill_id)
      `,
    })

    if (employeeSkillsError) {
      console.error("Error creating employee_skills table:", employeeSkillsError);
    }
    
    // 4. Create project_allocations table if it doesn't exist
    const { error: projectAllocationsError } = await supabaseAdmin.rpc("create_table_if_not_exists", {
      table_name: "project_allocations",
      columns: `
        id uuid primary key default uuid_generate_v4(),
        project_id uuid references projects(id) on delete cascade,
        employee_id uuid references employees(id) on delete cascade,
        allocation_percentage integer default 25,
        role text,
        start_date date not null,
        end_date date not null,
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now()
      `,
    })

    if (projectAllocationsError) {
      console.error("Error creating project_allocations table:", projectAllocationsError);
    }
    
    // 5. Create workforce_forecasts table if it doesn't exist
    const { error: forecastsError } = await supabaseAdmin.rpc("create_table_if_not_exists", {
      table_name: "workforce_forecasts",
      columns: `
        id uuid primary key default uuid_generate_v4(),
        department_id uuid references departments(id) on delete set null,
        forecast_date timestamp with time zone default now(),
        forecast_type text not null,
        headcount_prediction integer not null,
        confidence_score integer default 75,
        factors jsonb default '{}'::jsonb,
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now()
      `,
    })

    if (forecastsError) {
      console.error("Error creating workforce_forecasts table:", forecastsError);
    }
    
    // 6. Create project_feasibility table if it doesn't exist
    const { error: feasibilityError } = await supabaseAdmin.rpc("create_table_if_not_exists", {
      table_name: "project_feasibility",
      columns: `
        id uuid primary key default uuid_generate_v4(),
        project_name text not null,
        analysis_date timestamp with time zone default now(),
        start_date date,
        end_date date,
        feasibility_score integer,
        resource_gap jsonb,
        skill_gap jsonb,
        recommendation text,
        ai_recommendations jsonb,
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now()
      `,
    })

    if (feasibilityError) {
      console.error("Error creating project_feasibility table:", feasibilityError);
    }
    
    // 7. Create employee_performance table if it doesn't exist
    const { error: performanceError } = await supabaseAdmin.rpc("create_table_if_not_exists", {
      table_name: "employee_performance",
      columns: `
        id uuid primary key default uuid_generate_v4(),
        employee_id uuid references employees(id) on delete cascade,
        review_date date not null,
        score integer not null,
        strengths text[],
        areas_for_improvement text[],
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now()
      `,
    })

    if (performanceError) {
      console.error("Error creating employee_performance table:", performanceError);
    }
    
    // 8. Create workforce_plans table if it doesn't exist
    const { error: plansError } = await supabaseAdmin.rpc("create_table_if_not_exists", {
      table_name: "workforce_plans",
      columns: `
        id uuid primary key default uuid_generate_v4(),
        name text not null,
        department_id uuid references departments(id) on delete set null,
        start_date date not null,
        end_date date not null,
        headcount_target integer,
        budget decimal,
        status text default 'draft',
        hiring_targets jsonb default '{}'::jsonb,
        attrition_projections jsonb default '{}'::jsonb,
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now()
      `,
    })

    if (plansError) {
      console.error("Error creating workforce_plans table:", plansError);
    }

    return NextResponse.json({
      success: true,
      message: "Workforce planning tables created or updated successfully",
    })
  } catch (error) {
    console.error("Workforce tables setup error:", error);
    return NextResponse.json({ error: "Failed to set up workforce planning tables" }, { status: 500 });
  }
} 