import { NextResponse } from "next/server"
import { withErrorHandler, withAuth, supabase } from '../../middleware'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!

interface ForecastData {
  year: number;
  month: number;
  predicted_amount: number;
  confidence_score: number;
  factors: {
    historical_trend: number;
    seasonal_factors: number;
    market_conditions: number;
    other_factors: string;
  };
}

export const GET = withErrorHandler(async (request: Request) => {
  const { tenantId } = await withAuth(request)
  const { searchParams } = new URL(request.url)
  const months = parseInt(searchParams.get('months') || '12')

  const { data, error } = await supabase
    .from('revenue_data')
    .select(`
      amount,
      period_date,
      period_type,
      factors
    `)
    .eq('tenant_id', tenantId)
    .eq('is_projected', true)
    .order('period_date', { ascending: true })
    .limit(months)

  if (error) throw error

  return NextResponse.json({
    forecasts: data.map(d => ({
      amount: d.amount,
      date: d.period_date,
      periodType: d.period_type,
      factors: d.factors
    }))
  })
})

export const POST = withErrorHandler(async (request: Request) => {
  try {
    const { months = 12 } = await request.json()

    // Get historical revenue data
    const { tenantId } = await withAuth(request)

    const { data: historicalData, error: histError } = await supabase
      .from("revenue_data")
      .select("*")
      .eq('is_projected', false)
      .order("period_date", { ascending: true })

    if (histError) {
      throw histError
    }

    // Get department revenue data for correlation analysis
    const { data: deptRevenueData, error: deptError } = await supabase
      .from("department_revenue")
      .select("*")
      .eq('is_projected', false)
      .order("period_date", { ascending: true })

    if (deptError) {
      throw deptError
    }

    // Get historical payroll data
    const { data: payrollData, error: payrollError } = await supabase
      .from("payroll")
      .select("*")
      .order("payment_date", { ascending: true })

    if (payrollError) {
      throw payrollError
    }

    // Calculate monthly totals
    type MonthlyTotal = {
      year: number
      month: number
      total_revenue: number
      department_revenue: Record<string, number>
      growth_rate: number
    }

    const monthlyTotals = historicalData.reduce<Record<string, MonthlyTotal>>((acc, curr) => {
      const date = new Date(curr.period_date)
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`
      if (!acc[key]) {
        acc[key] = {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          total_revenue: 0,
          department_revenue: {},
          growth_rate: curr.growth_rate || 0
        }
      }
      acc[key].total_revenue += curr.amount
      return acc
    }, {})

    // Add department revenue data
    deptRevenueData.forEach((dept) => {
      const date = new Date(dept.period_date)
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`
      if (!monthlyTotals[key]) {
        monthlyTotals[key] = {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          total_revenue: 0,
          department_revenue: {},
          growth_rate: dept.growth_rate || 0
        }
      }
      monthlyTotals[key].department_revenue[dept.department_id] = dept.amount
    })

    // Convert to array and sort
    const monthlyData = Object.values(monthlyTotals).sort((a, b) => {
      if (a.year === b.year) {
        return a.month - b.month
      }
      return a.year - b.year
    })

    // Generate forecasts using OpenRouter's DeepSeek-v3
    let forecasts: ForecastData[];
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-ai/deepseek-math-7b-base',
          messages: [
            {
              role: 'user',
              content: JSON.stringify({
                historical_data: monthlyData,
                forecast_parameters: {
                  growth_rate_trend: monthlyData.reduce((acc, curr) => acc + (curr.growth_rate || 0), 0) / monthlyData.length,
                  seasonality: monthlyData.map(d => ({ month: d.month, factor: d.total_revenue || 0 })),
                  market_conditions: 'stable'
                },
                prediction_months: months
              })
            }
          ]
        })
      });

      const aiResponse = await response.json();
      const predictions = JSON.parse(aiResponse.choices[0].message.content);
      
      forecasts = predictions.map((p: any) => ({
        year: p.year,
        month: p.month,
        predicted_amount: p.amount,
        confidence_score: p.confidence,
        factors: {
          historical_trend: p.factors.trend,
          seasonal_factors: p.factors.seasonal,
          market_conditions: p.factors.market,
          other_factors: p.factors.notes
        }
      }));
    } catch (e) {
      console.error("Error generating forecast:", e)
      forecasts = [{
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        predicted_amount: 0,
        confidence_score: 0,
        factors: {
          historical_trend: 0,
          seasonal_factors: 0,
          market_conditions: 0,
          other_factors: "Error generating forecast. Please try again."
        }
      }]
    }

    // Store the forecasts in revenue_data table
    const { data: savedForecasts, error: saveError } = await supabase
      .from("revenue_data")
      .upsert(
        forecasts.map((f: ForecastData) => {
          const periodDate = new Date(f.year, f.month - 1, 1)
          return {
            period_date: periodDate.toISOString().split('T')[0],
            period_type: 'monthly',
            amount: f.predicted_amount,
            is_projected: true,
            growth_rate: f.factors.historical_trend,
            company_wide: true,
            factors: f.factors
          }
        }),
        { onConflict: "period_date,period_type,is_projected" }
      )
      .select()

    if (saveError) {
      throw saveError
    }

    return NextResponse.json({
      success: true,
      forecasts,
      saved_records: savedForecasts,
    })
  } catch (error: any) {
    console.error("Error generating revenue forecasts:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
})