import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString())
    const month = parseInt(searchParams.get("month") || (new Date().getMonth() + 1).toString())

    // Get revenue data for the specified month
    const { data: revenueData, error: revenueError } = await supabaseAdmin
      .from("revenue")
      .select("*")
      .eq("year", year)
      .eq("month", month)

    if (revenueError) {
      throw revenueError
    }

    // Get payroll data for the specified month
    const { data: payrollData, error: payrollError } = await supabaseAdmin
      .from("payroll")
      .select("*")
      .gte("payment_period_start", `${year}-${month.toString().padStart(2, "0")}-01`)
      .lte("payment_period_end", `${year}-${month.toString().padStart(2, "0")}-31`)

    if (payrollError) {
      throw payrollError
    }

    // Calculate total revenue
    const totalRevenue = revenueData.reduce((sum, record) => sum + record.amount, 0)

    // Calculate total payroll
    const totalPayroll = payrollData.reduce((sum, record) => sum + record.net_salary, 0)

    // Calculate profit margin
    const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalPayroll) / totalRevenue) * 100 : 0

    // Store the metrics
    const { data: savedMetrics, error: saveError } = await supabaseAdmin
      .from("revenue_metrics")
      .upsert(
        {
          year,
          month,
          total_revenue: totalRevenue,
          total_payroll: totalPayroll,
          profit_margin: profitMargin,
        },
        { onConflict: "year,month" }
      )
      .select()

    if (saveError) {
      throw saveError
    }

    return NextResponse.json({
      success: true,
      metrics: {
        year,
        month,
        total_revenue: totalRevenue,
        total_payroll: totalPayroll,
        profit_margin: profitMargin,
        revenue_by_category: revenueData.reduce((acc: any, record) => {
          if (!acc[record.category]) {
            acc[record.category] = 0
          }
          acc[record.category] += record.amount
          return acc
        }, {}),
        revenue_by_source: revenueData.reduce((acc: any, record) => {
          if (!acc[record.source]) {
            acc[record.source] = 0
          }
          acc[record.source] += record.amount
          return acc
        }, {}),
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