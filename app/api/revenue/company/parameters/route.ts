import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const params = await request.json();

    // Validate required parameters
    if (!params.employeeCount || !params.avgSalary || !params.revPerEmp || !params.growthRate || !params.timeframe) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      throw new Error('Supabase client not initialized');
    }

    const now = new Date();
    const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
    const modelName = `Q${currentQuarter} ${now.getFullYear()} Model`;

    // Save new model parameters
    const { error: paramsError } = await supabaseAdmin
      .from('revenue_model_params')
      .upsert({
        name: modelName,
        employee_count: params.employeeCount,
        avg_salary: params.avgSalary,
        revenue_per_employee: params.revPerEmp,
        growth_rate: params.growthRate,
        projection_timeframe: params.timeframe,
        created_at: now.toISOString()
      });

    if (paramsError) {
      throw paramsError;
    }

    return NextResponse.json({
      success: true,
      modelName,
      timestamp: now.toISOString()
    });

  } catch (error: any) {
    console.error('Error saving parameters:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 