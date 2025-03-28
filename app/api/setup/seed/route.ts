import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST() {
  try {
    console.log("Starting database seeding...")

    // Step 1: Insert Departments
    console.log("Seeding departments...")
    const { data: departments, error: deptError } = await supabaseAdmin
      .from("departments")
      .insert([
        { name: "Engineering", description: "Software Development and Infrastructure" },
        { name: "Human Resources", description: "HR Management and Employee Relations" },
        { name: "Sales", description: "Sales and Business Development" },
      ])
      .select()

    if (deptError) {
      console.error("Department insertion error:", deptError)
      throw new Error(`Department insertion failed: ${deptError.message}`)
    }

    // Step 2: Insert Positions
    console.log("Seeding positions...")
    const { data: positions, error: posError } = await supabaseAdmin
      .from("positions")
      .insert([
        {
          title: "Software Engineer",
          description: "Develops software applications",
          department_id: departments?.[0]?.id, // Engineering
        },
        {
          title: "HR Manager",
          description: "Manages HR operations",
          department_id: departments?.[1]?.id, // HR
        },
        {
          title: "Sales Representative",
          description: "Handles sales and client relations",
          department_id: departments?.[2]?.id, // Sales
        },
      ])
      .select()

    if (posError) {
      console.error("Position insertion error:", posError)
      throw new Error(`Position insertion failed: ${posError.message}`)
    }

    // Step 3: Insert Employees
    console.log("Seeding employees...")
    const { data: employees, error: empError } = await supabaseAdmin
      .from("employees")
      .insert([
        {
          name: "John Doe",
          email: "john.doe@example.com",
          position_id: positions?.[0]?.id,
          department_id: departments?.[0]?.id,
          hire_date: "2023-01-15",
          status: "active",
          skills: ["JavaScript", "React", "Node.js"],
          salary: 85000,
        },
        {
          name: "Jane Smith",
          email: "jane.smith@example.com",
          position_id: positions?.[1]?.id,
          department_id: departments?.[1]?.id,
          hire_date: "2023-06-10",
          status: "active",
          skills: ["HR Management", "Recruitment", "Training"],
          salary: 75000,
        },
      ])
      .select()

    if (empError) {
      console.error("Employee insertion error:", empError)
      throw new Error(`Employee insertion failed: ${empError.message}`)
    }

    // Step 4: Update Department Managers
    console.log("Updating department managers...")
    const { error: updateDeptError } = await supabaseAdmin
      .from("departments")
      .update({ manager_id: employees?.[0]?.id })
      .eq("name", "Engineering")

    if (updateDeptError) {
      console.error("Department manager update error:", updateDeptError)
      throw new Error(`Department manager update failed: ${updateDeptError.message}`)
    }

    // Step 5: Insert Skills
    console.log("Seeding skills...")
    const { error: skillsError } = await supabaseAdmin.from("skills").insert([
      { name: "JavaScript", category: "Technical" },
      { name: "React", category: "Technical" },
      { name: "HR Management", category: "Management" },
    ])

    if (skillsError) {
      console.error("Skills insertion error:", skillsError)
      throw new Error(`Skills insertion failed: ${skillsError.message}`)
    }

    console.log("Database seeding completed successfully")

    return NextResponse.json({
      success: true,
      message: "Sample data seeded successfully",
      details: {
        departments: departments?.length || 0,
        positions: positions?.length || 0,
        employees: employees?.length || 0,
      },
    })
  } catch (error: any) {
    console.error("Error seeding data:", error)
    return NextResponse.json(
      {
        error: "Failed to seed sample data",
        message: error.message,
        details: error,
      },
      { status: 500 },
    )
  }
}

