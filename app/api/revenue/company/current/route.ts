/**
 * Revenue Metrics API Endpoint
 * 
 * This module provides a REST API endpoint for retrieving company-wide revenue metrics.
 * It calculates current monthly revenue, annual revenue, projected revenue, and profit margins
 * based on actual revenue data and growth model parameters stored in Supabase.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Initialize Supabase admin client with service role for unrestricted DB access
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Interface representing a revenue data entry from the database
 * period_date: ISO date string (YYYY-MM-DD)
 * amount: Revenue amount in base currency units (e.g., cents)
 */
type RevenueEntry = {
  period_date: string;
  amount: number;
};

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
 * Returns the first day of the previous month in YYYY-MM-DD format
 * Used for month-over-month revenue comparisons
 * @returns {string} Date string in YYYY-MM-DD format
 */
const getFirstDayOfLastMonth = () => {
  const now = new Date();
  now.setMonth(now.getMonth() - 1);
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
 * 1. Retrieves latest revenue model parameters (growth rate, employee data)
 * 2. Calculates relevant date ranges for metrics
 * 3. Fetches actual revenue data for the specified periods
 * 4. Computes key metrics:
 *    - Monthly revenue (current month)
 *    - Annual revenue (trailing 12 months)
 *    - Projected annual revenue (based on growth model)
 *    - Profit margin (revenue vs. employee costs)
 * 
 * @param {Request} request - Incoming HTTP request object
 * @returns {Promise<NextResponse>} JSON response with metrics or error details
 */
async function handler(request: Request) {
  // Retrieve latest revenue model parameters
  const { data: modelParams, error: modelError } = await supabaseAdmin
    .from('revenue_model_params')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // Validate model parameters exist
  if (!modelParams) {
    console.error('No revenue model parameters found');
    return NextResponse.json({ error: 'No revenue model parameters found' }, { status: 404 });
  }

  const params = modelParams;

  // Define time boundaries for revenue calculations
  const currentMonthStart = getFirstDayOfCurrentMonth();
  const lastMonthStart = getFirstDayOfLastMonth();
  const yearAgoStart = getFirstDayOf12MonthsAgo();

  // Fetch actual (non-projected) revenue data for the past 12 months
  const { data: revenueData, error: revenueError } = await supabaseAdmin
    .from('revenue_data')
    .select('period_date, amount')
    .eq('is_projected', false)  // Exclude projected/estimated entries
    .gte('period_date', yearAgoStart)  // Only include last 12 months
    .order('period_date', { ascending: true});  // Chronological order

  // Handle database query errors
  if (revenueError) {
    console.error('Failed to fetch revenue data:', revenueError);
    return NextResponse.json({ error: 'Failed to fetch revenue data', details: revenueError }, { status: 500 });
  }

  // Ensure we have revenue data to analyze
  if (!revenueData || revenueData.length === 0) {
    console.error('No revenue data found');
    return NextResponse.json({ error: 'No revenue data found' }, { status: 404 });
  }

  const data = revenueData;

  // Calculate current month's revenue
  const monthlyRevenue = data
    .filter((entry: RevenueEntry) => entry.period_date >= currentMonthStart)
    .reduce((sum: number, entry: RevenueEntry) => sum + entry.amount, 0);

  // Calculate trailing 12-month revenue
  const annualRevenue = data
    .filter((entry: RevenueEntry) => entry.period_date >= yearAgoStart)
    .reduce((sum: number, entry: RevenueEntry) => sum + entry.amount, 0);

  // Project annual revenue based on current month and growth rate
  // Formula: (Current Monthly Revenue * 12) * (1 + Growth Rate)
  const projected = monthlyRevenue * 12 * (1 + params.growth_rate);

  // Calculate total employee costs
  const totalSalary = params.employee_count * params.avg_salary;

  // Calculate profit margin as percentage
  // Formula: ((Annual Revenue - Total Salary Costs) / Annual Revenue) * 100
  const profitMargin = annualRevenue > 0 ? ((annualRevenue - totalSalary) / annualRevenue) * 100 : 0;

  // Return calculated metrics
  return NextResponse.json({
    monthly: monthlyRevenue,     // Current month's total revenue
    annual: annualRevenue,      // Trailing 12-month total revenue
    projected,                  // Projected annual revenue with growth
    profitMargin                // Profit margin as percentage
  });
}

/**
 * Higher-order function that wraps the main handler with error handling
 * Catches any unhandled exceptions and returns appropriate error responses
 * 
 * @param {typeof handler} handlerFn - The main request handler function
 * @returns {Function} Wrapped handler with error handling
 */
const withErrorHandler = (handlerFn: typeof handler) => {
  return async (request: Request) => {
    try {
      return await handlerFn(request);
    } catch (error: any) {
      console.error('API Route Error:', error);
      return NextResponse.json(
        {
          error: 'Internal Server Error',
          message: error.message,
          // Stack traces only included in development environment
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        },
        { status: 500 }
      );
    }
  };
}

// Export the wrapped handler
export const GET = handler;
