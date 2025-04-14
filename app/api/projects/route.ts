import { NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from("projects").select("*").order("start_date", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Basic validation
    if (!body.name) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      )
    }

    // Create project with minimal required fields
    const projectData = {
      name: body.name,
      status: body.status || 'planning',
      // Add other fields conditionally
      ...(body.description ? { description: body.description } : {}),
      ...(body.start_date ? { start_date: body.start_date } : { start_date: new Date().toISOString().split('T')[0] }),
      ...(body.end_date ? { end_date: body.end_date } : {}),
      ...(body.budget ? { budget: body.budget } : {}),
      ...(body.department_id ? { department_id: body.department_id } : {}),
      ...(body.manager_id ? { manager_id: body.manager_id } : {})
    };

    const { data, error } = await supabaseAdmin
      .from("projects")
      .insert(projectData)
      .select()

    if (error) {
      throw error
    }

    return NextResponse.json(data[0])
  } catch (error: any) {
    console.error("Error creating project:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

