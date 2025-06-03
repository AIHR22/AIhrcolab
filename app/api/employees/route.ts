import { NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET handler
export async function GET(request: Request) {
  try {
    console.log("[API] GET /api/employees: Starting request")
    
    // Get URL and clean it
    const url = new URL(request.url)
    const cleanPath = decodeURIComponent(url.pathname).replace(/\s+/g, '')
    console.log("[API] Clean path:", cleanPath)
    
    if (cleanPath !== '/api/employees') {
      console.log("[API] Invalid path:", cleanPath)
      return new NextResponse('Not Found', { status: 404 })
    }

    // Test database connection
    console.log("[API] Testing database connection...")
    const { data: testData, error: testError } = await supabase
      .from("employees")
      .select("count")
      .limit(1)
    
    if (testError) {
      console.error("[API] Database connection test failed:", testError)
      throw new Error(`Database connection failed: ${testError.message}`)
    }
    
    console.log("[API] Database connection successful")

    // Fetch employees without department join
    console.log("[API] Fetching employees data...")
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .order("first_name")

    if (error) {
      console.error("[API] Error fetching employees:", error)
      throw error
    }

    console.log("[API] Successfully fetched employees:", data?.length || 0)
    return NextResponse.json(data || [], {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error: any) {
    console.error("[API] Error in GET /api/employees:", error)
    return NextResponse.json({ 
      error: error.message,
      details: error.details || error.hint || null,
      code: error.code || null
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}

// POST handler
export async function POST(request: Request) {
  try {
    console.log("[API] POST /api/employees: Starting request")
    
    // Get URL and clean it
    const url = new URL(request.url)
    const cleanPath = decodeURIComponent(url.pathname).replace(/\s+/g, '')
    console.log("[API] Clean path:", cleanPath)
    
    if (cleanPath !== '/api/employees') {
      console.log("[API] Invalid path:", cleanPath)
      return new NextResponse('Not Found', { status: 404 })
    }

    const body = await request.json()
    console.log("[API] Request body:", body)

    // Extract skills array from the request if present
    const { skills = [], ...employeeData } = body

    // Validate required fields
    const requiredFields = ['first_name', 'last_name', 'email', 'position', 'department_id', 'hire_date', 'salary']
    const missingFields = requiredFields.filter(field => !employeeData[field])
    
    if (missingFields.length > 0) {
      console.error("[API] Missing required fields:", missingFields)
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Validate UUID format for department_id and manager_id
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    
    if (!uuidRegex.test(employeeData.department_id)) {
      console.error("[API] Invalid department_id format:", employeeData.department_id)
      return NextResponse.json(
        { error: "Invalid department_id format. Must be a valid UUID." },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (employeeData.manager_id && !uuidRegex.test(employeeData.manager_id)) {
      console.error("[API] Invalid manager_id format:", employeeData.manager_id)
      return NextResponse.json(
        { error: "Invalid manager_id format. Must be a valid UUID." },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create employee data with required and optional fields
    const newEmployeeData = {
      ...employeeData,
      status: "active"
    }

    // Check if department exists
    console.log("[API] Checking if department exists:", employeeData.department_id)
    const { data: departmentExists, error: departmentError } = await supabase
      .from("departments")
      .select("id")
      .eq("id", employeeData.department_id)
      .maybeSingle()

    if (departmentError) {
      console.error("[API] Error checking department:", departmentError)
      throw departmentError
    }

    if (!departmentExists) {
      console.error("[API] Invalid department ID:", employeeData.department_id)
      return NextResponse.json(
        { error: "Invalid department ID" }, 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Check if manager exists if provided
    if (employeeData.manager_id) {
      console.log("[API] Checking if manager exists:", employeeData.manager_id)
      const { data: managerExists, error: managerError } = await supabase
        .from("employees")
        .select("id")
        .eq("id", employeeData.manager_id)
        .maybeSingle()

      if (managerError) {
        console.error("[API] Error checking manager:", managerError)
        throw managerError
      }

      if (!managerExists) {
        console.error("[API] Invalid manager ID:", employeeData.manager_id)
        return NextResponse.json(
          { error: "Invalid manager ID" },
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    // Validate skills if provided
    if (skills && skills.length > 0) {
      // Validate that skills is an array
      if (!Array.isArray(skills)) {
        console.error("[API] Skills must be an array")
        return NextResponse.json(
          { error: "Skills must be an array" },
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }

      // Check if all skills exist in the database
      const { data: existingSkills, error: skillsError } = await supabase
        .from("skills")
        .select("id")
        .in("id", skills)

      if (skillsError) {
        console.error("[API] Error checking skills:", skillsError)
        throw skillsError
      }

      // Verify that all provided skill IDs exist
      if (existingSkills && existingSkills.length !== skills.length) {
        const foundSkillIds = existingSkills.map(s => s.id)
        const missingSkillIds = skills.filter(id => !foundSkillIds.includes(id))
        console.error("[API] Some skills do not exist:", missingSkillIds)
        return NextResponse.json(
          { error: "Some skills do not exist", details: missingSkillIds },
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    console.log("[API] Creating employee with data:", newEmployeeData)
    const { data, error } = await supabase
      .from("employees")
      .insert([newEmployeeData])
      .select("*")
      .single()

    if (error) {
      // Check for unique constraint violation
      if (error.code === '23505') {
        console.error("[API] Email already exists:", employeeData.email)
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }
      console.error("[API] Error creating employee:", error)
      throw error
    }

    console.log("[API] Successfully created employee:", data)

    // Add employee skills if provided
    if (skills && skills.length > 0 && data.id) {
      console.log("[API] Adding skills for employee:", data.id)
      
      const employeeSkills = skills.map((skillId: string) => ({
        employee_id: data.id,
        skill_id: skillId,
        proficiency_level: 1 // Default proficiency level for newly added skills
      }))

      const { error: skillsError } = await supabase
        .from("employee_skills")
        .insert(employeeSkills)

      if (skillsError) {
        console.error("[API] Error adding employee skills:", skillsError)
        // Note: We don't fail the request if adding skills fails
        // The employee is already created, so we return success
        // but include a warning in the response
        return NextResponse.json({
          ...data,
          warning: "Employee created but skills could not be added",
          details: skillsError.message
        }, { 
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }

    return NextResponse.json(data, { 
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error: any) {
    console.error("[API] Error in POST /api/employees:", error)
    return NextResponse.json({ 
      error: error.message,
      details: error.details || error.hint || null,
      code: error.code || null
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}
