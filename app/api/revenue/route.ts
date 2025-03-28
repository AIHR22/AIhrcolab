import { NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

export async function GET(request: Request) {
  try {
    const { data, error } = await supabaseAdmin
      .from("revenue")
      .select("*")
      .order("date", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error fetching revenue data:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount, date, source, description, department_id } = body

    // Only require the essential fields
    if (!amount || !date || !source) {
      return NextResponse.json(
        {
          success: false,
          error: "Required fields: amount, date, source",
        },
        { status: 400 }
      )
    }

    // Create a new revenue entry
    const revenueData = {
      amount,
      date,
      source,
      description: description || '',
      department_id,
    }

    const { data, error } = await supabaseAdmin
      .from("revenue")
      .insert(revenueData)
      .select()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: data[0],
    })
  } catch (error: any) {
    console.error("Error creating revenue entry:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
} 