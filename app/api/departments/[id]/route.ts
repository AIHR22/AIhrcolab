import { NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: "Invalid department ID" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("departments")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: "Department not found" }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error(`Error fetching department ${params.id}:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: "Invalid department ID" }, { status: 400 })
    }

    // Check if department exists
    const { data: existingDept, error: checkError } = await supabaseAdmin
      .from("departments")
      .select("id")
      .eq("id", id)
      .single()

    if (checkError || !existingDept) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 })
    }

    // Update the department
    const { data, error } = await supabaseAdmin
      .from("departments")
      .update(body)
      .eq("id", id)
      .select()

    if (error) {
      throw error
    }

    return NextResponse.json(data[0])
  } catch (error: any) {
    console.error(`Error updating department ${params.id}:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: "Invalid department ID" }, { status: 400 })
    }

    // Check if department exists
    const { data: existingDept, error: checkError } = await supabaseAdmin
      .from("departments")
      .select("id")
      .eq("id", id)
      .single()

    if (checkError || !existingDept) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 })
    }

    // Delete the department
    const { error } = await supabaseAdmin
      .from("departments")
      .delete()
      .eq("id", id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, message: "Department deleted successfully" })
  } catch (error: any) {
    console.error(`Error deleting department ${params.id}:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 