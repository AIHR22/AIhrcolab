import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables")
}

// Create admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST() {
  try {
    console.log("Starting database seeding...")

    // Insert test tenant
    console.log("Inserting test tenant...")
    const { error: tenantError } = await supabaseAdmin.from("tenants").upsert([
      { id: '00000000-0000-0000-0000-000000000001', name: 'Test Company', domain: 'test.com' }
    ])

    if (tenantError) {
      console.error("Error inserting tenant:", tenantError)
      throw tenantError
    }

    // Insert departments
    console.log("Inserting departments...")
    const { error: deptError } = await supabaseAdmin.from("departments").upsert([
      { id: 'd1b23c45-6789-0abc-def1-234567890123', tenant_id: '00000000-0000-0000-0000-000000000001', name: 'Engineering', description: 'Software Development and Infrastructure' },
      { id: 'd2c34d56-789a-bcde-f012-345678901234', tenant_id: '00000000-0000-0000-0000-000000000001', name: 'Product', description: 'Product Management and Design' },
      { id: 'd3d45e67-89ab-cdef-0123-456789012345', tenant_id: '00000000-0000-0000-0000-000000000001', name: 'Design', description: 'UI/UX and Visual Design' }
    ], { onConflict: 'id' })

    if (deptError) {
      console.error("Error inserting departments:", deptError)
      throw deptError
    }

    // Insert some test revenue data
    console.log("Inserting test revenue data...")
    const { error: revenueError } = await supabaseAdmin.from("revenue_data").upsert([
      {
        tenant_id: '00000000-0000-0000-0000-000000000001',
        period_type: 'monthly',
        period_date: '2025-01-01',
        amount: 100000,
        is_projected: false,
        growth_rate: 5,
        company_wide: true
      },
      {
        tenant_id: '00000000-0000-0000-0000-000000000001',
        period_type: 'monthly',
        period_date: '2025-02-01',
        amount: 110000,
        is_projected: false,
        growth_rate: 10,
        company_wide: true
      },
      {
        tenant_id: '00000000-0000-0000-0000-000000000001',
        period_type: 'monthly',
        period_date: '2025-03-01',
        amount: 120000,
        is_projected: false,
        growth_rate: 9,
        company_wide: true
      }
    ], { onConflict: 'tenant_id,period_type,period_date' })

    if (revenueError) {
      console.error("Error inserting revenue data:", revenueError)
      throw revenueError
    }

    if (deptError) {
      console.error("Error inserting departments:", deptError)
      throw deptError
    }

    // Insert skills
    console.log("Inserting skills...")
    const { error: skillsError } = await supabaseAdmin.from("skills").upsert([
      { id: 's1b23c45-6789-0abc-def1-234567890123', name: 'React', category: 'Frontend' },
      { id: 's2c34d56-789a-bcde-f012-345678901234', name: 'Node.js', category: 'Backend' },
      { id: 's3d45e67-89ab-cdef-0123-456789012345', name: 'UI/UX Design', category: 'Design' },
      { id: 's4e56f78-9abc-def0-1234-567890123456', name: 'Project Management', category: 'Management' },
      { id: 's5f67g89-abcd-ef01-2345-678901234567', name: 'DevOps', category: 'Infrastructure' }
    ])

    if (skillsError) {
      console.error("Error inserting skills:", skillsError)
      throw skillsError
    }

    // Insert positions
    console.log("Inserting positions...")
    const { error: posError } = await supabaseAdmin.from("positions").upsert([
      { id: 'p1b23c45-6789-0abc-def1-234567890123', title: 'Senior Software Engineer', department_id: 'd1b23c45-6789-0abc-def1-234567890123' },
      { id: 'p2c34d56-789a-bcde-f012-345678901234', title: 'Product Manager', department_id: 'd2c34d56-789a-bcde-f012-345678901234' },
      { id: 'p3d45e67-89ab-cdef-0123-456789012345', title: 'UI/UX Designer', department_id: 'd3d45e67-89ab-cdef-0123-456789012345' }
    ])

    if (posError) {
      console.error("Error inserting positions:", posError)
      throw posError
    }

    // Insert employees
    console.log("Inserting employees...")
    const { error: empError } = await supabaseAdmin.from("employees").upsert([
      { id: 'e1b23c45-6789-0abc-def1-234567890123', first_name: 'John', last_name: 'Doe', email: 'john.doe@example.com', position_id: 'p1b23c45-6789-0abc-def1-234567890123', department_id: 'd1b23c45-6789-0abc-def1-234567890123', hire_date: '2023-01-15', salary: 125000, performance_score: 4.5 },
      { id: 'e2c34d56-789a-bcde-f012-345678901234', first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@example.com', position_id: 'p2c34d56-789a-bcde-f012-345678901234', department_id: 'd2c34d56-789a-bcde-f012-345678901234', hire_date: '2023-02-01', salary: 135000, performance_score: 4.8 },
      { id: 'e3d45e67-89ab-cdef-0123-456789012345', first_name: 'Mike', last_name: 'Johnson', email: 'mike.j@example.com', position_id: 'p3d45e67-89ab-cdef-0123-456789012345', department_id: 'd3d45e67-89ab-cdef-0123-456789012345', hire_date: '2023-03-15', salary: 95000, performance_score: 4.2 }
    ])

    if (empError) {
      console.error("Error inserting employees:", empError)
      throw empError
    }

    // Insert employee skills
    console.log("Inserting employee skills...")
    const { error: empSkillsError } = await supabaseAdmin.from("employee_skills").upsert([
      { employee_id: 'e1b23c45-6789-0abc-def1-234567890123', skill_id: 's1b23c45-6789-0abc-def1-234567890123', proficiency_level: 5 },
      { employee_id: 'e1b23c45-6789-0abc-def1-234567890123', skill_id: 's2c34d56-789a-bcde-f012-345678901234', proficiency_level: 4 },
      { employee_id: 'e2c34d56-789a-bcde-f012-345678901234', skill_id: 's4e56f78-9abc-def0-1234-567890123456', proficiency_level: 5 },
      { employee_id: 'e3d45e67-89ab-cdef-0123-456789012345', skill_id: 's3d45e67-89ab-cdef-0123-456789012345', proficiency_level: 4 }
    ])

    if (empSkillsError) {
      console.error("Error inserting employee skills:", empSkillsError)
      throw empSkillsError
    }

    // Insert projects
    console.log("Inserting projects...")
    const { error: projError } = await supabaseAdmin.from("projects").upsert([
      { id: '123e4567-e89b-12d3-a456-426614174000', name: 'Next-Gen Platform', description: 'Platform modernization project', start_date: '2024-04-01', end_date: '2024-12-31', budget: 1000000, status: 'planned', priority: 'high', complexity: 'medium', department_id: 'd1b23c45-6789-0abc-def1-234567890123' }
    ])

    if (projError) {
      console.error("Error inserting projects:", projError)
      throw projError
    }

    // Insert project skills
    console.log("Inserting project skills...")
    const { error: projSkillsError } = await supabaseAdmin.from("project_skills").upsert([
      { project_id: '123e4567-e89b-12d3-a456-426614174000', skill_id: 's1b23c45-6789-0abc-def1-234567890123', required_level: 4, required_count: 3 },
      { project_id: '123e4567-e89b-12d3-a456-426614174000', skill_id: 's2c34d56-789a-bcde-f012-345678901234', required_level: 4, required_count: 2 },
      { project_id: '123e4567-e89b-12d3-a456-426614174000', skill_id: 's5f67g89-abcd-ef01-2345-678901234567', required_level: 3, required_count: 1 }
    ])

    if (projSkillsError) {
      console.error("Error inserting project skills:", projSkillsError)
      throw projSkillsError
    }

    // Insert project allocations
    console.log("Inserting project allocations...")
    const { error: allocError } = await supabaseAdmin.from("project_allocations").upsert([
      { project_id: '123e4567-e89b-12d3-a456-426614174000', employee_id: 'e1b23c45-6789-0abc-def1-234567890123', allocation_percentage: 80, start_date: '2024-04-01', end_date: '2024-12-31', role: 'Tech Lead' }
    ])

    if (allocError) {
      console.error("Error inserting project allocations:", allocError)
      throw allocError
    }

    // Insert employee performance records
    console.log("Inserting employee performance records...")
    const { error: perfError } = await supabaseAdmin.from("employee_performance").upsert([
      { employee_id: 'e1b23c45-6789-0abc-def1-234567890123', review_date: '2024-03-01', performance_score: 4.5, satisfaction_score: 4.2, workload_score: 3.8 },
      { employee_id: 'e2c34d56-789a-bcde-f012-345678901234', review_date: '2024-03-01', performance_score: 4.8, satisfaction_score: 4.5, workload_score: 4.0 },
      { employee_id: 'e3d45e67-89ab-cdef-0123-456789012345', review_date: '2024-03-01', performance_score: 4.2, satisfaction_score: 4.0, workload_score: 3.5 }
    ])

    if (perfError) {
      console.error("Error inserting employee performance records:", perfError)
      throw perfError
    }

    // Insert workforce plans
    console.log("Inserting workforce plans...")
    const { error: planError } = await supabaseAdmin.from("workforce_plans").upsert([
      { project_id: '123e4567-e89b-12d3-a456-426614174000', department_id: 'd1b23c45-6789-0abc-def1-234567890123', plan_date: '2024-04-01', required_headcount: 6, current_headcount: 1, forecasted_headcount: 4, attrition_rate: 0.15, growth_rate: 0.25 }
    ])

    if (planError) {
      console.error("Error inserting workforce plans:", planError)
      throw planError
    }

    console.log("Database seeding completed successfully!")
    return NextResponse.json({ success: true, message: "Database seeded successfully" })
  } catch (error) {
    console.error("Database seeding error:", error)
    return NextResponse.json({ error: "Failed to seed database", details: error }, { status: 500 })
  }
} 