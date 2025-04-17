import { NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const periodType = searchParams.get('periodType') || 'monthly'
    const departmentId = searchParams.get('departmentId')
    const projectId = searchParams.get('projectId')
    const isProjected = searchParams.get('projected') === 'true'

    let query = supabaseAdmin
      .from("revenue_data")
      .select("*")
      .eq('period_type', periodType)
      .eq('is_projected', isProjected)
      .order("period_date", { ascending: false })

    if (departmentId) {
      query = query.eq('department_id', departmentId)
    }

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error: any) {
    console.error("Error fetching revenue data:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      amount, 
      period_date, 
      period_type = 'monthly',
      is_projected = false,
      growth_rate,
      company_wide = true,
      department_id,
      project_id
    } = body

    // Validate required fields
    if (!amount || !period_date) {
      return NextResponse.json(
        {
          success: false,
          error: "Required fields: amount, period_date",
        },
        { status: 400 }
      )
    }

    // Create a new revenue entry
    const revenueData = {
      amount,
      period_date,
      period_type,
      is_projected,
      growth_rate,
      company_wide,
      department_id,
      project_id
    }

    const { data, error } = await supabaseAdmin
      .from("revenue_data")
      .insert(revenueData)
      .select()

    if (error) {
      throw error
    }

    // If this is department revenue, also create an entry in department_revenue
    if (department_id) {
      const departmentRevenueData = {
        department_id,
        period_type,
        period_date,
        amount,
        is_projected,
        growth_rate
      }

      const { error: deptError } = await supabaseAdmin
        .from("department_revenue")
        .insert(departmentRevenueData)

      if (deptError) {
        console.error("Error creating department revenue entry:", deptError)
      }
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