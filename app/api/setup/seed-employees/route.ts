import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    })

    // Get department IDs
    const { data: departments, error: deptError } = await supabase.from("departments").select("id, name")

    if (deptError) {
      return NextResponse.json({ error: deptError.message }, { status: 500 })
    }

    if (!departments || departments.length === 0) {
      return NextResponse.json({ error: "No departments found. Please seed departments first." }, { status: 400 })
    }

    // Create a map of department names to IDs
    const departmentMap = departments.reduce(
      (acc, dept) => {
        acc[dept.name] = dept.id
        return acc
      },
      {} as Record<string, string>,
    )

    // Default department ID if Engineering doesn't exist
    const defaultDeptId = departments[0].id

    // Seed employees
    const { error } = await supabase.from("employees").upsert(
      [
        {
          first_name: "John",
          last_name: "Doe",
          email: "john.doe@example.com",
          phone: "+1 (555) 123-4567",
          position: "Software Engineer",
          department: departmentMap["Engineering"] || defaultDeptId,
          hire_date: "2022-01-15",
          status: "active",
          avatar_url: "/placeholder.svg?height=40&width=40",
          address: "123 Main St, San Francisco, CA 94105",
          bio: "Experienced software engineer with a focus on frontend technologies.",
          team: "Frontend",
          username: "john.doe",
          role: "employee",
        },
        {
          first_name: "Jane",
          last_name: "Smith",
          email: "jane.smith@example.com",
          phone: "+1 (555) 987-6543",
          position: "Product Manager",
          department: departmentMap["Product"] || defaultDeptId,
          hire_date: "2021-11-03",
          status: "active",
          avatar_url: "/placeholder.svg?height=40&width=40",
          address: "456 Market St, San Francisco, CA 94105",
          bio: "Strategic product manager with a background in user research.",
          team: "Product Management",
          username: "jane.smith",
          role: "manager",
        },
        {
          first_name: "Michael",
          last_name: "Johnson",
          email: "michael.johnson@example.com",
          phone: "+1 (555) 456-7890",
          position: "UX Designer",
          department: departmentMap["Design"] || defaultDeptId,
          hire_date: "2023-02-20",
          status: "onboarding",
          avatar_url: "/placeholder.svg?height=40&width=40",
          address: "789 Howard St, San Francisco, CA 94105",
          bio: "Creative UX designer with a passion for user-centered design.",
          team: "Design",
          username: "michael.johnson",
          role: "employee",
        },
        {
          first_name: "Emily",
          last_name: "Williams",
          email: "emily.williams@example.com",
          phone: "+1 (555) 789-0123",
          position: "Marketing Specialist",
          department: departmentMap["Marketing"] || defaultDeptId,
          hire_date: "2022-08-10",
          status: "active",
          avatar_url: "/placeholder.svg?height=40&width=40",
          address: "321 Mission St, San Francisco, CA 94105",
          bio: "Results-driven marketing specialist with expertise in digital marketing.",
          team: "Digital Marketing",
          username: "emily.williams",
          role: "employee",
        },
        {
          first_name: "David",
          last_name: "Brown",
          email: "david.brown@example.com",
          phone: "+1 (555) 234-5678",
          position: "Sales Representative",
          department: departmentMap["Sales"] || defaultDeptId,
          hire_date: "2021-05-15",
          status: "offboarding",
          avatar_url: "/placeholder.svg?height=40&width=40",
          address: "987 Folsom St, San Francisco, CA 94105",
          bio: "Experienced sales representative with a track record of exceeding targets.",
          team: "Enterprise Sales",
          username: "david.brown",
          role: "employee",
        },
      ],
      { onConflict: "email" },
    )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Employees seeded successfully" })
  } catch (error: any) {
    console.error("Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

