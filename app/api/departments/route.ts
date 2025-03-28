import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    if (!supabaseAdmin) {
      throw new Error("Supabase client not initialized")
    }

    const { data, error } = await supabaseAdmin
      .from("departments")
      .select("id, name, description")
      .order("name")

    if (error) {
      console.error("[API] Error fetching departments:", error)
      throw error
    }

    // Log departments for debugging
    if (Array.isArray(data)) {
      console.log(`[API] Found ${data.length} departments`)
      // Log the raw data for debugging without type assumptions
      console.log("[API] Departments raw data:", JSON.stringify(data))
    }

    return NextResponse.json(data || [], {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error: any) {
    console.error("[API] Error in GET /api/departments:", error)
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

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      throw new Error("Supabase client not initialized")
    }

    const body = await request.json()

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: "Department name is required" },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create department
    const { data, error } = await supabaseAdmin
      .from("departments")
      .insert([{
        name: body.name,
        description: body.description
      }])
      .select("id, name, description, created_at, updated_at")
      .single()

    if (error) {
      console.error("[API] Error creating department:", error)
      throw error
    }

    return NextResponse.json(data, {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error: any) {
    console.error("[API] Error in POST /api/departments:", error)
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

export async function PUT(request: Request) {
  try {
    if (!supabaseAdmin) {
      throw new Error("Supabase client not initialized")
    }

    const body = await request.json()
    
    // Validate required fields
    if (!body.id) {
      return NextResponse.json(
        { error: "Department ID is required" },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!body.name) {
      return NextResponse.json(
        { error: "Department name is required" },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Update department
    const { data, error } = await supabaseAdmin
      .from("departments")
      .update({
        name: body.name,
        description: body.description,
        updated_at: new Date().toISOString()
      })
      .eq("id", body.id)
      .select("id, name, description, updated_at")
      .single()

    if (error) {
      console.error("[API] Error updating department:", error)
      throw error
    }

    return NextResponse.json(data, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error: any) {
    console.error("[API] Error in PUT /api/departments:", error)
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

export async function DELETE(request: Request) {
  try {
    if (!supabaseAdmin) {
      throw new Error("Supabase client not initialized")
    }

    const url = new URL(request.url)
    const id = url.searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Department ID is required" },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Check if department is used by any employees
    const { data: employees, error: employeeError } = await supabaseAdmin
      .from("employees")
      .select("id")
      .eq("department_id", id)
      .limit(1)

    if (employeeError) {
      console.error("[API] Error checking employees for department:", employeeError)
      throw employeeError
    }

    if (employees && employees.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete department that is assigned to employees" },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Check if department is used by any positions
    const { data: positions, error: positionError } = await supabaseAdmin
      .from("positions")
      .select("id")
      .eq("department_id", id)
      .limit(1)

    if (positionError) {
      console.error("[API] Error checking positions for department:", positionError)
      throw positionError
    }

    if (positions && positions.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete department that is assigned to positions" },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Delete department
    const { error } = await supabaseAdmin
      .from("departments")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("[API] Error deleting department:", error)
      throw error
    }

    return NextResponse.json(
      { success: true, message: "Department deleted successfully" },
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error("[API] Error in DELETE /api/departments:", error)
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
