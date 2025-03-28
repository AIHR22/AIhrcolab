import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { generateJsonWithLlama3 } from "@/lib/together"

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
      .from("revenue")
      .select("*")
      .order("year", { ascending: true })
      .order("month", { ascending: true })

    if (histError) {
      throw histError
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
      const key = `${curr.year}-${curr.month}`
      if (!acc[key]) {
        acc[key] = {
          year: curr.year,
          month: curr.month,
          total_revenue: 0,
          total_payroll: 0,
        }
      }
      acc[key].total_revenue += curr.amount
      return acc
    }, {})

    // Add payroll data to monthly totals
    payrollData.forEach((payroll) => {
      const date = new Date(payroll.payment_date)
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`
      if (!monthlyTotals[key]) {
        monthlyTotals[key] = {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          total_revenue: 0,
          total_payroll: 0,
        }
      }
      monthlyTotals[key].total_payroll += payroll.net_salary
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
            `${d.year}-${d.month}: Revenue: $${d.total_revenue.toFixed(2)}, Payroll: $${d.total_payroll.toFixed(2)}`
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
      forecasts = await generateJsonWithLlama3<ForecastData[]>(
        prompt,
        systemPrompt,
        0.2,
        2000
      );
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

    // Store the forecasts
    const { data: savedForecasts, error: saveError } = await supabaseAdmin
      .from("revenue_forecasts")
      .upsert(
        forecasts.map((f: ForecastData) => ({
          year: f.year,
          month: f.month,
          predicted_amount: f.predicted_amount,
          confidence_score: f.confidence_score,
          factors: f.factors,
        })),
        { onConflict: "year,month" }
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