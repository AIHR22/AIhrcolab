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

export const GET = async (request: Request) => {
  try {
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
  } catch (error: any) {
    console.error("Error fetching forecasts:", error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error occurred',
      details: {
        name: error.name,
        cause: error.cause
      }
    }, { status: 500 })
  }
}

export const POST = async (request: Request) => {
  try {
    console.log('Environment:', process.env.NODE_ENV);
    console.log('OpenRouter API Key:', process.env.OPENROUTER_API_KEY ? 'Set' : 'Not set');
    console.log('Starting revenue forecast request...');
    const { months = 12 } = await request.json()
    console.log('Months:', months);

    // Get historical revenue data
    console.log('Authenticating request...');
    const { tenantId } = await withAuth(request)
    console.log('Tenant ID:', tenantId);

    let historicalData, deptRevenueData, payrollData;

    // Use test data in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Using test data...');
      historicalData = Array.from({ length: 12 }, (_, i) => ({
        period_date: new Date(2024, i, 1).toISOString(),
        amount: 100000 + (i * 5000),
        is_projected: false,
        growth_rate: 5 + (Math.random() * 2 - 1),
        period_type: 'monthly'
      }));

      deptRevenueData = ['Engineering', 'Sales', 'Marketing', 'Product'].flatMap(dept => 
        Array.from({ length: 12 }, (_, i) => ({
          period_date: new Date(2024, i, 1).toISOString(),
          amount: 25000 + (i * 1000),
          department_id: dept.toLowerCase(),
          department_name: dept,
          is_projected: false
        }))
      );

      payrollData = Array.from({ length: 12 }, (_, i) => ({
        payment_date: new Date(2024, i, 1).toISOString(),
        total_amount: 50000 + (i * 2000)
      }));
    } else {
      // Get real data from Supabase
      const { data: histData, error: histError } = await supabase
        .from("revenue_data")
        .select("*")
        .eq('is_projected', false)
        .order("period_date", { ascending: true })

      if (histError) {
        throw histError
      }
      historicalData = histData;

      // Get department revenue data for correlation analysis
      const { data: deptData, error: deptError } = await supabase
        .from("department_revenue")
        .select("*")
        .eq('is_projected', false)
        .order("period_date", { ascending: true })

      if (deptError) {
        throw deptError
      }
      deptRevenueData = deptData;

      // Get historical payroll data
      const { data: payData, error: payrollError } = await supabase
        .from("payroll")
        .select("*")
        .order("payment_date", { ascending: true })

      if (payrollError) {
        throw payrollError
      }
      payrollData = payData;
    }

    // Calculate monthly totals
    type MonthlyTotal = {
      year: number
      month: number
      total_revenue: number
      department_revenue: Record<string, number>
      growth_rate: number
    }

    console.log('Historical data:', historicalData);
    const monthlyTotals = historicalData.reduce<Record<string, MonthlyTotal>>((acc, curr) => {
      const date = new Date(curr.period_date)
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`
      
      if (!acc[key]) {
        acc[key] = {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          total_revenue: 0,
          department_revenue: {},
          growth_rate: 0
        }
      }
      
      acc[key].total_revenue += curr.amount
      acc[key].growth_rate = curr.growth_rate || 0

      // For test data, create department revenue from the test departments
      if (process.env.NODE_ENV !== 'production') {
        const testDepts = ['engineering', 'sales', 'marketing', 'product']
        testDepts.forEach(dept => {
          acc[key].department_revenue[dept] = curr.amount / testDepts.length
        })
      } else {
        // Add department revenue from real data
        const deptRevenue = deptRevenueData
          .filter(d => d.period_date === curr.period_date)
          .reduce((deptAcc, d) => {
            deptAcc[d.department_id] = d.amount
            return deptAcc
          }, {} as Record<string, number>)

        acc[key].department_revenue = {
          ...acc[key].department_revenue,
          ...deptRevenue
        }
      }

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
    console.log('Monthly totals:', monthlyTotals);
    const monthlyData = Object.values(monthlyTotals).sort((a, b) => {
      if (a.year === b.year) {
        return a.month - b.month
      }
      return a.year - b.year
    })

    // Generate forecasts
    let forecasts: ForecastData[];
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('Using mock forecast data...');
      const currentDate = new Date();
      const baseAmount = 100000;
      const growthRate = 1.05;
      
      forecasts = Array.from({ length: months }, (_, i) => {
        const forecastDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
        const amount = baseAmount * Math.pow(growthRate, i);
        
        return {
          year: forecastDate.getFullYear(),
          month: forecastDate.getMonth() + 1,
          predicted_amount: amount,
          confidence_score: 0.8,
          factors: {
            historical_trend: 5,
            seasonal_factors: 2,
            market_conditions: 3,
            other_factors: 'Mock forecast data'
          }
        };
      });
    } else {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://aihrcolab.com',
            'X-Title': 'AIHRColab'
          },
          body: JSON.stringify({
            model: 'meta-llama/llama-4-scout',
            messages: [
              {
                role: 'system',
                content: `You are an expert financial analyst and revenue forecasting specialist. Analyze historical revenue data and generate accurate revenue forecasts with detailed factors influencing the predictions.`
              },
              {
                role: 'user',
                content: `Based on this historical revenue data and parameters, generate revenue forecasts for the next ${months} months. Consider growth trends, seasonality, and market conditions.

Historical Data:
${JSON.stringify({
  monthly_revenue: monthlyData.map(d => ({
    year: d.year,
    month: d.month,
    revenue: d.total_revenue,
    growth_rate: d.growth_rate,
    department_breakdown: d.department_revenue
  })),
  avg_growth_rate: monthlyData.reduce((acc, curr) => acc + (curr.growth_rate || 0), 0) / monthlyData.length,
  recent_trend: monthlyData.slice(-3).map(d => ({ month: d.month, revenue: d.total_revenue })),
  department_trends: Object.keys(monthlyData[0]?.department_revenue || {}).map(deptId => ({
    department_id: deptId,
    recent_revenue: monthlyData.slice(-3).map(d => d.department_revenue[deptId])
  }))
})}`
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
    }

    // For development/test, skip saving to database
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({
        success: true,
        forecasts,
        saved_records: [],
        message: 'Development mode - forecasts generated but not saved'
      })
    }

    // Store the forecasts in revenue_data table for production
    const savedForecasts: any[] = [];
    for (const forecast of forecasts) {
      const { data, error } = await supabase
        .from("revenue_data")
        .insert({
          period_date: new Date(forecast.year, forecast.month - 1, 1).toISOString(),
          amount: forecast.predicted_amount,
          is_projected: true,
          confidence_score: forecast.confidence_score,
          factors: forecast.factors,
          tenant_id: tenantId
        })
        .select()
        .single()

      if (error) {
        console.error("Error saving forecast:", error)
      } else if (data) {
        savedForecasts.push(data)
      }
    }

    const response = {
      success: true,
      forecasts,
      saved_records: savedForecasts
    };
    console.log('Sending response:', response);
    return NextResponse.json(response)
  } catch (error: any) {
    console.error("Error generating revenue forecasts:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause
    })
    const errorResponse = {
      success: false,
      error: error.message || 'Unknown error occurred',
      details: {
        name: error.name,
        cause: error.cause
      }
    };
    console.log('Sending error response:', errorResponse);
    return NextResponse.json(errorResponse, { status: 500 })
  }
}