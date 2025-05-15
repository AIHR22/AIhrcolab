import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Types for request body
interface ModelParameters {
  employee_count: number;
  avg_salary: number;
  revenue_per_employee: number;
  growth_rate: number;
  projection_timeframe: '6months' | '12months' | '24months';
}

// Helper function to calculate metrics based on parameters
function calculateMetrics(params: ModelParameters) {
  const monthlyRevenue = params.employee_count * params.revenue_per_employee;
  const annualRevenue = monthlyRevenue * 12;
  const projectedRevenue = annualRevenue * (1 + params.growth_rate / 100);
  const totalSalaryCost = params.employee_count * params.avg_salary * 12;
  const profitMargin = ((annualRevenue - totalSalaryCost) / annualRevenue) * 100;

  return {
    monthly: monthlyRevenue,
    annual: annualRevenue,
    projected: projectedRevenue,
    profitMargin: profitMargin
  };
}

// Helper function to generate trend data
function generateTrendData(params: ModelParameters, latestActual: number | null = null) {
  const trends = [];
  const now = new Date();
  const monthsToProject = parseInt(params.projection_timeframe) || 12;
  
  // Base monthly revenue for projections
  const baseRevenue = latestActual || (params.employee_count * params.revenue_per_employee);

  // Generate data points
  for (let i = -6; i <= monthsToProject; i++) {
    const date = new Date(now);
    date.setMonth(date.getMonth() + i);
    
    if (i <= 0) {
      // Past months (actual data or estimated)
      trends.push({
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        actual: baseRevenue * (1 + (i * 0.01)), // Small variation for realistic data
        projected: null
      });
    } else {
      // Future months (projected)
      trends.push({
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        actual: null,
        projected: baseRevenue * Math.pow(1 + (params.growth_rate / 100), i/12)
      });
    }
  }

  return trends;
}

// Preview endpoint - POST /api/revenue/company/model/preview
export async function POST(request: NextRequest) {
  try {
    const params = await request.json() as ModelParameters;

    // Validate parameters
    if (!params.employee_count || !params.revenue_per_employee || params.growth_rate === undefined) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get latest actual revenue data for trends
    const { data: latestRevenue } = await supabaseAdmin
      .from('revenue_data')
      .select('amount')
      .eq('is_projected', false)
      .order('period_date', { ascending: false })
      .limit(1)
      .single();

    // Calculate preview metrics and trends
    const metrics = calculateMetrics(params);
    const trends = generateTrendData(params, latestRevenue?.amount || null);

    return NextResponse.json({
      metrics,
      trends,
      parameters: params
    });

  } catch (error: any) {
    console.error('Error in revenue model preview:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Apply parameters endpoint - PUT /api/revenue/company/model
export async function PUT(request: NextRequest) {
  try {
    const params = await request.json() as ModelParameters;

    // Validate parameters
    if (!params.employee_count || !params.revenue_per_employee || params.growth_rate === undefined) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const now = new Date();
    const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
    const modelName = `Q${currentQuarter} ${now.getFullYear()} Model`;

    // Save new model parameters
    const { error: paramsError } = await supabaseAdmin
      .from('revenue_model_params')
      .upsert({
        name: modelName,
        employee_count: params.employee_count,
        avg_salary: params.avg_salary,
        revenue_per_employee: params.revenue_per_employee,
        growth_rate: params.growth_rate,
        created_at: now.toISOString()
      });

    if (paramsError) {
      throw paramsError;
    }

    // Calculate metrics and trends
    const metrics = calculateMetrics(params);
    const trends = generateTrendData(params);

    // Save projected revenue data
    const projectedData = trends
      .filter(t => t.projected !== null)
      .map(t => ({
        period_date: new Date(t.month).toISOString().split('T')[0],
        amount: t.projected,
        is_projected: true,
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      }));

    // Update projected revenue data
    const { error: projectionError } = await supabaseAdmin
      .from('revenue_data')
      .upsert(projectedData, {
        onConflict: 'period_date'
      });

    if (projectionError) {
      throw projectionError;
    }

    // Return updated metrics and trends
    return NextResponse.json({
      metrics,
      trends,
      parameters: params
    });

  } catch (error: any) {
    console.error('Error applying revenue model parameters:', error);
    return NextResponse.json(
      { error: 'Failed to apply parameters' },
      { status: 500 }
    );
  }
} 