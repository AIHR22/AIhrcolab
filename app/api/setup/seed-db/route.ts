import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Missing Supabase environment variables" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if employees table exists and has data
    const { data: existingEmployees, error: checkError } = await supabase.from("employees").select("count").single()

    if (checkError && checkError.code !== "42P01") {
      return NextResponse.json({ error: `Error checking employees table: ${checkError.message}` }, { status: 500 })
    }

    if (existingEmployees && existingEmployees.count > 0) {
      return NextResponse.json({
        success: true,
        message: `Database already has data (${existingEmployees.count} employees). Skipping seed.`,
      })
    }

    // Sample employee data
    const employees = [
      {
        id: "11111111-1111-1111-1111-111111111111",
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        department: "Engineering",
        position: "CTO",
        hire_date: "2020-01-15",
        status: "active",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
      },
      {
        id: "22222222-2222-2222-2222-222222222222",
        first_name: "Jane",
        last_name: "Smith",
        email: "jane.smith@example.com",
        department: "HR",
        position: "HR Director",
        hire_date: "2020-02-20",
        status: "active",
        manager_id: "11111111-1111-1111-1111-111111111111",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
      },
      // Add more employees as needed
    ]

    // Insert employees
    const { error: employeesError } = await supabase.from("employees").insert(employees)

    if (employeesError) {
      return NextResponse.json({ error: `Error inserting employees: ${employeesError.message}` }, { status: 500 })
    }

    // Add more sample data for other tables

    return NextResponse.json({ success: true, message: "Database seeded successfully" })
  } catch (error: any) {
    return NextResponse.json({ error: `Error seeding database: ${error.message}` }, { status: 500 })
  }
}

