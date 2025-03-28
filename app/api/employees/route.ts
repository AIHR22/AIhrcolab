import { NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Debug environment variables
console.log("[API] Supabase URL:", supabaseUrl)
console.log("[API] Supabase Key exists:", !!supabaseKey)

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables")
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

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

    const headersList = headers()
    console.log("[API] Request headers:", Object.fromEntries(headersList.entries()))
    
    // Test database connection
    console.log("[API] Testing database connection...")
    const { data: testData, error: testError } = await supabaseAdmin
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
    const { data, error } = await supabaseAdmin
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

    // Validate required fields
    const requiredFields = ['first_name', 'last_name', 'email', 'position', 'department_id', 'hire_date', 'salary']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      console.error("[API] Missing required fields:", missingFields)
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Validate UUID format for department_id and manager_id
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    
    if (!uuidRegex.test(body.department_id)) {
      console.error("[API] Invalid department_id format:", body.department_id)
      return NextResponse.json(
        { error: "Invalid department_id format. Must be a valid UUID." },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (body.manager_id && !uuidRegex.test(body.manager_id)) {
      console.error("[API] Invalid manager_id format:", body.manager_id)
      return NextResponse.json(
        { error: "Invalid manager_id format. Must be a valid UUID." },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create employee data with required and optional fields
    const employeeData = {
      ...body,
      status: "active"
    }

    // Check if department exists
    console.log("[API] Checking if department exists:", body.department_id)
    const { data: departmentExists, error: departmentError } = await supabaseAdmin
      .from("departments")
      .select("id")
      .eq("id", body.department_id)
      .maybeSingle()

    if (departmentError) {
      console.error("[API] Error checking department:", departmentError)
      throw departmentError
    }

    if (!departmentExists) {
      console.error("[API] Invalid department ID:", body.department_id)
      return NextResponse.json(
        { error: "Invalid department ID" }, 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Check if manager exists if provided
    if (body.manager_id) {
      console.log("[API] Checking if manager exists:", body.manager_id)
      const { data: managerExists, error: managerError } = await supabaseAdmin
        .from("employees")
        .select("id")
        .eq("id", body.manager_id)
        .maybeSingle()

      if (managerError) {
        console.error("[API] Error checking manager:", managerError)
        throw managerError
      }

      if (!managerExists) {
        console.error("[API] Invalid manager ID:", body.manager_id)
        return NextResponse.json(
          { error: "Invalid manager ID" },
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    console.log("[API] Creating employee with data:", employeeData)
    const { data, error } = await supabaseAdmin
      .from("employees")
      .insert([employeeData])
      .select("*")
      .single()

    if (error) {
      // Check for unique constraint violation
      if (error.code === '23505') {
        console.error("[API] Email already exists:", body.email)
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }
      console.error("[API] Error creating employee:", error)
      throw error
    }

    console.log("[API] Successfully created employee:", data)
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
