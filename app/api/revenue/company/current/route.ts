/**
 * Revenue Metrics API Endpoint
 * 
 * This module provides a REST API endpoint for retrieving company-wide revenue metrics.
 * It calculates current monthly revenue, annual revenue, projected revenue, and profit margins
 * based on actual revenue data and growth model parameters stored in Supabase.
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Disable Next.js page caching to ensure metrics are always current
export const dynamic = 'force-dynamic';

/**
 * Returns the first day of the current month in YYYY-MM-DD format
 * Used for filtering current month's revenue data
 * @returns {string} Date string in YYYY-MM-DD format
 */
const getFirstDayOfCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
};

/**
 * Returns the first day of the month from 12 months ago
 * Used for calculating annual revenue totals
 * @returns {string} Date string in YYYY-MM-DD format
 */
const getFirstDayOf12MonthsAgo = () => {
  const now = new Date();
  now.setMonth(now.getMonth() - 12);
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
};

/**
 * Main request handler for the revenue metrics endpoint
 * 
 * Processing flow:
 * 1. Retrieves salary metrics from the salary endpoint
 * 2. Retrieves latest revenue model parameters (growth rate, employee data)
 * 3. Calculates relevant date ranges for metrics
 * 4. Fetches actual revenue data for the specified periods
 * 5. Computes key metrics:
 *    - Monthly revenue (current month)
 *    - Annual revenue (trailing 12 months)
 *    - Projected annual revenue (based on growth model)
 *    - Profit margin (revenue vs. employee costs)
 * 
 * @returns {Promise<NextResponse>} JSON response with metrics or error details
 */
export async function GET() {
  try {
    // 1. Get salary metrics from the salary endpoint
    const salaryRes = await fetch('http://localhost:3004/api/employees/salary');
    if (!salaryRes.ok) {
      throw new Error('Failed to fetch salary data');
    }
    const salaryData = await salaryRes.json();
    const { validCount: employeeCount, avgSalary, totalSalary } = salaryData;

    // 2. Get revenue data for calculations
    const { data: revenueData, error: revenueError } = await supabaseAdmin
      .from('revenue_data')
      .select('period_date, amount')
      .eq('is_projected', false)
      .gte('period_date', getFirstDayOf12MonthsAgo())
      .order('period_date', { ascending: true });

    if (revenueError) {
      console.error('Failed to fetch revenue data:', revenueError);
      return NextResponse.json(
        { error: 'Failed to fetch revenue data' },
        { status: 500 }
      );
    }

    if (!revenueData || revenueData.length === 0) {
      return NextResponse.json(
        { error: 'No revenue data found' },
        { status: 404 }
      );
    }

    // 3. Calculate current metrics
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Monthly revenue (current month)
    const monthlyRevenue = revenueData
      .filter(entry => {
        const entryDate = new Date(entry.period_date);
        return entryDate.getMonth() === currentMonth && 
               entryDate.getFullYear() === currentYear;
      })
      .reduce((sum, entry) => sum + entry.amount, 0);

    // Annual revenue
    const annualRevenue = revenueData.reduce((sum, entry) => sum + entry.amount, 0);

    // Calculate actual revenue per employee
    const avgMonthlyRevenue = annualRevenue / revenueData.length;
    const revenuePerEmployee = employeeCount > 0 ? avgMonthlyRevenue / employeeCount : 0;

    // 4. Get or create revenue model parameters
    const currentQuarter = Math.floor(currentMonth / 3) + 1;
    const modelName = `Q${currentQuarter} ${currentYear} Model`;

    // Calculate new model parameters using actual data
    const newModelParams = {
      name: modelName,
      employee_count: employeeCount,
      avg_salary: avgSalary,
      revenue_per_employee: revenuePerEmployee,
      growth_rate: 0.05, // Default 5% from UI, should be configurable
      created_at: new Date().toISOString()
    };

    // Update or insert new model parameters
    const { error: upsertError } = await supabaseAdmin
      .from('revenue_model_params')
      .upsert(newModelParams, {
        onConflict: 'name'
      });

    if (upsertError) {
      console.error('Failed to upsert model parameters:', upsertError);
    }

    // 5. Calculate projections using new parameters
    const projected = avgMonthlyRevenue * 12 * (1 + newModelParams.growth_rate);
    const annualSalaryCost = totalSalary;
    const profitMargin = ((annualRevenue - annualSalaryCost) / annualRevenue) * 100;

    // 6. Return metrics
    return NextResponse.json({
      monthly: monthlyRevenue,
      annual: annualRevenue,
      projected,
      profitMargin,
      _debug: process.env.NODE_ENV === 'development' ? {
        currentMonthStart: getFirstDayOfCurrentMonth(),
        yearAgoStart: getFirstDayOf12MonthsAgo(),
        dataPoints: revenueData.length,
        avgMonthlyRevenue,
        employeeMetrics: {
          count: employeeCount,
          avgSalary,
          totalSalary,
          revenuePerEmployee
        },
        modelParams: newModelParams
      } : undefined
    });
  } catch (error: any) {
    console.error('Unexpected error in revenue metrics endpoint:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
