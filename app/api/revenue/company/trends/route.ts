// /Users/aaydubs/Downloads/AIhrcolab-Worforceedit/app/api/revenue/company/trends/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * Returns the first day of the month from X months ago
 * @param {number} monthsAgo - Number of months to go back
 * @returns {string} Date string in YYYY-MM-DD format
 */
const getFirstDayOfMonthsAgo = (monthsAgo: number) => {
  const now = new Date();
  now.setMonth(now.getMonth() - monthsAgo);
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
};

/**
 * Returns the last day of the month for a given date
 * @param {Date} date - The date to get the last day for
 * @returns {string} Date string in YYYY-MM-DD format
 */
const getLastDayOfMonth = (date: Date) => {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;
};

export async function GET(request: NextRequest) {
  try {
    // Get salary metrics for employee-based calculations
    const salaryRes = await fetch('http://localhost:3000/api/employees/salary');
    if (!salaryRes.ok) {
      throw new Error('Failed to fetch salary data');
    }
    const salaryData = await salaryRes.json();
    const { validCount: employeeCount, avgSalary } = salaryData;

    if (!supabaseAdmin) {
      throw new Error('Supabase client not initialized');
    }

    // Get historical revenue data from Supabase for past 6 months
    const startDate = getFirstDayOfMonthsAgo(6);
    const { data: revenueData, error: revenueError } = await supabaseAdmin
      .from('revenue_data')
      .select('period_date, amount')
      .eq('is_projected', false)
      .gte('period_date', startDate)
      .order('period_date', { ascending: true });

    if (revenueError) {
      console.error('Failed to fetch revenue data:', revenueError);
      return NextResponse.json(
        { error: 'Failed to fetch revenue data' },
        { status: 500 }
      );
    }

    // Get latest model parameters
    const { data: modelParams, error: modelError } = await supabaseAdmin
      .from('revenue_model_params')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (modelError) {
      console.error('Failed to fetch model parameters:', modelError);
    }

    const growthRate = modelParams?.growth_rate ?? 0.05; // Default 5% if no params

    // Generate trend data points
    const trends = [];
    const now = new Date();
    
    // Past 6 months (actual)
    for (let i = -6; i <= 0; i++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() + i);
      const monthStart = getFirstDayOfMonthsAgo(-i); // Convert positive to negative
      const monthEnd = getLastDayOfMonth(date);
      
      // Get all revenue entries for this month
      const monthData = revenueData?.filter(entry => {
        const entryDate = entry.period_date;
        return entryDate >= monthStart && entryDate <= monthEnd;
      }) ?? [];

      let actualRevenue;
      if (monthData.length > 0) {
        // Sum all revenue for the month
        actualRevenue = monthData.reduce((sum, entry) => sum + entry.amount, 0);
      } else if (revenueData && revenueData.length > 0) {
        // Use average if no data for this month
        actualRevenue = revenueData.reduce((sum, entry) => sum + entry.amount, 0) / revenueData.length;
      } else {
        // Fallback to employee-based estimate
        actualRevenue = employeeCount * (avgSalary * 1.5);
      }

      trends.push({
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        actual: actualRevenue,
        projected: null
      });
    }

    // Get latest actual revenue for projections
    const latestActual = trends[trends.length - 1].actual;

    // Next 6 months (projected)
    for (let i = 1; i <= 6; i++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() + i);
      trends.push({
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        actual: null,
        projected: latestActual * (1 + (growthRate * i/12))
      });
    }

    return NextResponse.json({ 
      trends,
      metadata: {
        growthRate,
        latestActual,
        dataPoints: trends.length,
        modelParams: modelParams ?? undefined
      }
    });

  } catch (error: any) {
    console.error('Error in revenue trends:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
