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
      .from("positions")
      .select("*")
      .order("title")

    if (error) {
      console.error("[API] Error fetching positions:", error)
      throw error
    }

    return NextResponse.json(data || [], {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error: any) {
    console.error("[API] Error in GET /api/positions:", error)
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
    if (!body.title) {
      return NextResponse.json(
        { error: "Position title is required" },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create position
    const { data, error } = await supabaseAdmin
      .from("positions")
      .insert([{
        title: body.title,
        department_id: body.department_id,
        level: body.level,
        description: body.description,
        is_manager: body.is_manager || false
      }])
      .select("*")
      .single()

    if (error) {
      console.error("[API] Error creating position:", error)
      throw error
    }

    return NextResponse.json(data, {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error: any) {
    console.error("[API] Error in POST /api/positions:", error)
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
        { error: "Position ID is required" },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!body.title) {
      return NextResponse.json(
        { error: "Position title is required" },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Update position
    const { data, error } = await supabaseAdmin
      .from("positions")
      .update({
        title: body.title,
        department_id: body.department_id,
        level: body.level,
        description: body.description,
        is_manager: body.is_manager || false,
        updated_at: new Date().toISOString()
      })
      .eq("id", body.id)
      .select("*")
      .single()

    if (error) {
      console.error("[API] Error updating position:", error)
      throw error
    }

    return NextResponse.json(data, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error: any) {
    console.error("[API] Error in PUT /api/positions:", error)
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
        { error: "Position ID is required" },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Check if position is used by any employees
    const { data: employees, error: employeeError } = await supabaseAdmin
      .from("employees")
      .select("id")
      .eq("position", id)
      .limit(1)

    if (employeeError) {
      console.error("[API] Error checking employees for position:", employeeError)
      throw employeeError
    }

    if (employees && employees.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete position that is assigned to employees" },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Delete position
    const { error } = await supabaseAdmin
      .from("positions")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("[API] Error deleting position:", error)
      throw error
    }

    return NextResponse.json(
      { success: true, message: "Position deleted successfully" },
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error("[API] Error in DELETE /api/positions:", error)
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
