import { NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'
import { generateWithLlama3 } from "@/lib/together"

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

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

export async function POST(request: Request) {
  try {
    const { months = 12 } = await request.json()

    // Get historical revenue data
    const { data: historicalData, error: histError } = await supabaseAdmin
      .from("revenue_data")
      .select("*")
      .eq('is_projected', false)
      .order("period_date", { ascending: true })

    if (histError) {
      throw histError
    }

    // Get department revenue data for correlation analysis
    const { data: deptRevenueData, error: deptError } = await supabaseAdmin
      .from("department_revenue")
      .select("*")
      .eq('is_projected', false)
      .order("period_date", { ascending: true })

    if (deptError) {
      throw deptError
    }

    // Get historical payroll data
    const { data: payrollData, error: payrollError } = await supabaseAdmin
      .from("payroll")
      .select("*")
      .order("payment_date", { ascending: true })

    if (payrollError) {
      throw payrollError
    }

    // Calculate monthly totals
    const monthlyTotals = historicalData.reduce((acc: any, curr) => {
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
    const monthlyData = Object.values(monthlyTotals).sort((a: any, b: any) => {
      if (a.year === b.year) {
        return a.month - b.month
      }
      return a.year - b.year
    })

    // Use Llama 3 to generate revenue forecasts
    const prompt = `
      I need to forecast revenue for the next ${months} months based on the following historical data:
      
      Monthly Revenue and Payroll Data:
      ${monthlyData
        .map(
          (d: any) =>
            `${d.year}-${d.month}: Revenue: $${d.total_revenue.toFixed(2)}, Growth Rate: ${d.growth_rate}%`
        )
        .join("\n")}
      
      Based on this information, please provide:
      1. Revenue predictions for the next ${months} months
      2. Confidence score for each prediction (0-100%)
      3. Key factors influencing the forecast
      4. A JSON array with the following structure for each month:
      [
        {
          "year": number,
          "month": number,
          "predicted_amount": number,
          "confidence_score": number,
          "factors": {
            "historical_trend": number,
            "seasonal_factors": number,
            "market_conditions": number,
            "other_factors": string
          }
        },
        ...
      ]
      
      Only return the JSON array, nothing else.
    `

    const systemPrompt = "You are a financial analyst AI specializing in revenue forecasting. You provide accurate predictions based on historical data. Your response should ONLY be valid JSON without any explanation or markdown.";

    // Generate forecasts using Llama 3
    let forecasts: ForecastData[];
    try {
      const aiResponse = await generateWithLlama3(
        prompt,
        systemPrompt,
        0.2,
        2000
      );
      forecasts = JSON.parse(aiResponse) as ForecastData[];
    } catch (e) {
      console.error("Error parsing AI response:", e)
      forecasts = [
        {
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
          predicted_amount: 0,
          confidence_score: 0,
          factors: {
            historical_trend: 0,
            seasonal_factors: 0,
            market_conditions: 0,
            other_factors: "Error generating forecast. Please try again.",
          },
        },
      ]
    }

    // Store the forecasts in revenue_data table
    const { data: savedForecasts, error: saveError } = await supabaseAdmin
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
} 