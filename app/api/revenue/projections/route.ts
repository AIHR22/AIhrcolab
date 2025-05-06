import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface ProjectionParams {
  employee_count: number;
  avg_salary: number;
  revenue_per_employee: number;
  growth_rate: number;
  timeframe_months: number;
}

// Calculate projected revenue for future months
function calculateProjections(params: ProjectionParams, startDate: Date) {
  const projections = [];
  const monthlyRevenue = params.employee_count * params.revenue_per_employee;
  
  for (let i = 0; i < params.timeframe_months; i++) {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + i);
    
    // Apply compound growth
    const growthFactor = Math.pow(1 + params.growth_rate, i / 12);
    const projectedRevenue = monthlyRevenue * growthFactor;
    
    projections.push({
      period_date: date.toISOString().split('T')[0],
      amount: Math.round(projectedRevenue),
      is_projected: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  
  return projections;
}

// GET: Fetch current projections
export async function GET() {
  try {
    // Get latest model parameters
    const { data: modelParams, error: paramsError } = await supabaseAdmin
      .from('revenue_model_params')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (paramsError) throw paramsError;

    // Get actual revenue data
    const { data: actualRevenue, error: revenueError } = await supabaseAdmin
      .from('revenue_data')
      .select('*')
      .eq('is_projected', false)
      .order('period_date', { ascending: true });

    if (revenueError) throw revenueError;

    // Calculate projections
    const startDate = new Date();
    const projections = calculateProjections({
      employee_count: modelParams.employee_count,
      avg_salary: modelParams.avg_salary,
      revenue_per_employee: modelParams.revenue_per_employee,
      growth_rate: modelParams.growth_rate,
      timeframe_months: 12
    }, startDate);

    return NextResponse.json({
      actual: actualRevenue,
      projected: projections,
      modelParams
    });
  } catch (error: any) {
    console.error('Error fetching projections:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Update model parameters and recalculate projections
export async function POST(req: Request) {
  try {
    const params = await req.json();
    const modelName = `Q${Math.floor(new Date().getMonth() / 3) + 1} ${new Date().getFullYear()} Model`;

    // Store new parameters
    const { error: paramsError } = await supabaseAdmin
      .from('revenue_model_params')
      .upsert({
        name: modelName,
        employee_count: params.employee_count,
        avg_salary: params.avg_salary,
        revenue_per_employee: params.revenue_per_employee,
        growth_rate: params.growth_rate / 100, // Convert from percentage
        created_at: new Date().toISOString()
      }, {
        onConflict: 'name'
      });

    if (paramsError) throw paramsError;

    // Calculate new projections
    const startDate = new Date();
    const projections = calculateProjections({
      ...params,
      growth_rate: params.growth_rate / 100,
      timeframe_months: 12
    }, startDate);

    // Store projected revenue data
    const { error: projError } = await supabaseAdmin
      .from('revenue_data')
      .upsert(projections, {
        onConflict: 'period_date'
      });

    if (projError) throw projError;

    return NextResponse.json({
      success: true,
      projections,
      modelName
    });
  } catch (error: any) {
    console.error('Error updating projections:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 