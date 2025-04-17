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
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
    const departmentId = searchParams.get('departmentId')

    // Get revenue data for the specified period
    let revenueQuery = supabaseAdmin
      .from("revenue_data")
      .select("*")
      .eq("period_type", periodType)
      .eq("period_date", date)
      .eq("is_projected", false)

    if (departmentId) {
      revenueQuery = revenueQuery.eq("department_id", departmentId)
    }

    const { data: revenueData, error: revenueError } = await revenueQuery

    if (revenueError) {
      throw revenueError
    }

    // Get department revenue data
    let deptQuery = supabaseAdmin
      .from("department_revenue")
      .select("*")
      .eq("period_type", periodType)
      .eq("period_date", date)
      .eq("is_projected", false)

    if (departmentId) {
      deptQuery = deptQuery.eq("department_id", departmentId)
    }

    const { data: deptRevenueData, error: deptError } = await deptQuery

    if (deptError) {
      throw deptError
    }

    // Calculate total revenue
    const totalRevenue = revenueData.reduce((sum, record) => sum + record.amount, 0)

    // Calculate average growth rate
    const avgGrowthRate = revenueData.reduce((sum, record) => sum + (record.growth_rate || 0), 0) / 
      (revenueData.length || 1)

    // Get previous period data for comparison
    const previousDate = getPreviousPeriodDate(date, periodType)
    const { data: previousData, error: prevError } = await supabaseAdmin
      .from("revenue_data")
      .select("*")
      .eq("period_type", periodType)
      .eq("period_date", previousDate)
      .eq("is_projected", false)

    if (prevError) {
      throw prevError
    }

    const previousRevenue = previousData?.reduce((sum, record) => sum + record.amount, 0) || 0

    // Store the metrics in revenue_comparisons
    const { data: savedMetrics, error: saveError } = await supabaseAdmin
      .from("revenue_comparisons")
      .upsert(
        {
          period_type: periodType,
          period_date: date,
          current_value: totalRevenue,
          previous_value: previousRevenue,
          percentage_change: previousRevenue > 0 ? 
            ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0,
          metric_type: 'revenue',
          department_id: departmentId || null
        },
        { onConflict: "period_type,period_date,metric_type,department_id" }
      )
      .select()

    if (saveError) {
      throw saveError
    }

    // Format department data for chart display
    const departmentData = deptRevenueData.reduce((acc: any, dept) => {
      acc[dept.department_id] = {
        current: {
          label: 'Current',
          value: dept.amount,
          color: '#4CAF50'
        },
        previous: {
          label: 'Previous',
          value: 0, // Will be populated below
          color: '#2196F3'
        }
      }
      return acc
    }, {})

    // Add previous period department data
    const { data: prevDeptData } = await supabaseAdmin
      .from("department_revenue")
      .select("*")
      .eq("period_type", periodType)
      .eq("period_date", previousDate)
      .eq("is_projected", false)

    prevDeptData?.forEach(dept => {
      if (departmentData[dept.department_id]) {
        departmentData[dept.department_id].previous.value = dept.amount
      }
    })

    return NextResponse.json({
      success: true,
      metrics: {
        period_type: periodType,
        period_date: date,
        total_revenue: totalRevenue,
        previous_revenue: previousRevenue,
        growth_rate: avgGrowthRate,
        percentage_change: previousRevenue > 0 ? 
          ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0,
        department_revenue: departmentData
      },
      saved_record: savedMetrics?.[0],
    })
  } catch (error: any) {
    console.error("Error calculating revenue metrics:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}

// Helper function to get previous period date
function getPreviousPeriodDate(date: string, periodType: string): string {
  const currentDate = new Date(date)
  let previousDate = new Date(currentDate)

  switch (periodType) {
    case 'monthly':
      previousDate.setMonth(previousDate.getMonth() - 1)
      break
    case 'quarterly':
      previousDate.setMonth(previousDate.getMonth() - 3)
      break
    case 'annual':
      previousDate.setFullYear(previousDate.getFullYear() - 1)
      break
  }

  return previousDate.toISOString().split('T')[0]
} 