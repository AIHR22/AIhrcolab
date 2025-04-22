// /Users/aaydubs/Downloads/AIhrcolab-Worforceedit/app/api/revenue/company/comparison/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/types/supabase'; // Assuming types definition

// Helper function to get the first day of a month relative to the current month
const getFirstDayOfRelativeMonth = (monthOffset: number): string => {
  const now = new Date();
  // Set to the first day of the current month first
  const targetDate = new Date(now.getFullYear(), now.getMonth(), 1);
  // Adjust month
  targetDate.setMonth(targetDate.getMonth() + monthOffset);
  return targetDate.toISOString().split('T')[0];
};

// Helper function to calculate percentage change
const calculatePctChange = (current: number, previous: number): number => {
    if (previous === 0) {
        // Handle division by zero - return Infinity or 0, or a large number?
        // Returning 0 if previous is 0 and current is 0, otherwise Infinity (or null/specific indicator)
        return current === 0 ? 0 : Infinity; // Or handle as per specific requirements
    }
    const change = ((current - previous) / previous) * 100;
    // Round to one decimal place
    return Math.round(change * 10) / 10;
};


/**
 * @description Fetches company-wide revenue comparison data (current vs. previous period).
 * Supports 'monthly' and 'annual' comparison periods via query parameter.
 * @param {NextRequest} request - The incoming request object.
 * @returns {Promise<NextResponse>} NextResponse with comparison data or error.
 */
export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period'); // 'monthly' or 'annual'

  if (period !== 'monthly' && period !== 'annual') {
      return NextResponse.json({ error: "Invalid 'period' query parameter. Use 'monthly' or 'annual'." }, { status: 400 });
  }

  try {
    // Check session - RLS handles tenant access
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error('Unauthorized access attempt:', sessionError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let label = '';
    let currentPeriodStart: string;
    let currentPeriodEnd: string; // Exclusive for range end typically, but depends on query logic
    let previousPeriodStart: string;
    let previousPeriodEnd: string; // Exclusive

    // Define date ranges based on the period
    if (period === 'monthly') {
        label = 'Monthly Revenue';
        currentPeriodStart = getFirstDayOfRelativeMonth(0); // First day of current month
        previousPeriodStart = getFirstDayOfRelativeMonth(-1); // First day of last month
        // Assign values even if not used in query to satisfy linter
        currentPeriodEnd = currentPeriodStart; 
        previousPeriodEnd = previousPeriodStart;
        // For monthly, we typically fetch a single value for the specific start date
    } else { // period === 'annual'
        label = 'Annual Revenue';
        // Last 12 full months (ending last day of previous month)
        currentPeriodEnd = getFirstDayOfRelativeMonth(0); // Start of current month (exclusive end for range)
        currentPeriodStart = getFirstDayOfRelativeMonth(-12); // Start of 12 months ago

        // Previous 12 full months
        previousPeriodEnd = currentPeriodStart; // Start of the current 12-month period is end of previous
        previousPeriodStart = getFirstDayOfRelativeMonth(-24); // Start of 24 months ago
    }

    let currentRevenue = 0;
    let previousRevenue = 0;

    // Fetch revenue data based on the period
    if (period === 'monthly') {
        // Fetch current month actual
        // EXPLAIN: Fetching single record for the start date of the current month.
        const { data: currentData, error: currentErr } = await supabase
            .from('revenue_data')
            .select('amount')
            .eq('period_date', currentPeriodStart)
            .eq('is_projected', false)
            .maybeSingle();
        if (currentErr && currentErr.code !== 'PGRST116') throw currentErr;
        currentRevenue = currentData?.amount ?? 0;

        // Fetch previous month actual
        // EXPLAIN: Fetching single record for the start date of the previous month.
        const { data: previousData, error: previousErr } = await supabase
            .from('revenue_data')
            .select('amount')
            .eq('period_date', previousPeriodStart)
            .eq('is_projected', false)
            .maybeSingle();
        if (previousErr && previousErr.code !== 'PGRST116') throw previousErr;
        previousRevenue = previousData?.amount ?? 0;

    } else { // period === 'annual'
        // Fetch current 12 months actual sum
        // EXPLAIN: Summing 'amount' for records within the last 12 months (exclusive end).
        const { data: currentData, error: currentErr } = await supabase
            .from('revenue_data')
            .select('amount')
            .gte('period_date', currentPeriodStart)
            .lt('period_date', currentPeriodEnd) // Use lt for exclusive end date
            .eq('is_projected', false);
        if (currentErr) throw currentErr;
        currentRevenue = currentData?.reduce((sum, row) => sum + row.amount, 0) ?? 0;

        // Fetch previous 12 months actual sum
        // EXPLAIN: Summing 'amount' for records within the 12 months prior to the current 12-month period.
        const { data: previousData, error: previousErr } = await supabase
            .from('revenue_data')
            .select('amount')
            .gte('period_date', previousPeriodStart)
            .lt('period_date', previousPeriodEnd) // Use lt for exclusive end date
            .eq('is_projected', false);
        if (previousErr) throw previousErr;
        previousRevenue = previousData?.reduce((sum, row) => sum + row.amount, 0) ?? 0;
    }

    // Calculate percentage change
    const pctChange = calculatePctChange(currentRevenue, previousRevenue);

    // Return the comparison data
    return NextResponse.json([
      {
        label: label,
        current: currentRevenue,
        previous: previousRevenue,
        pctChange: pctChange,
      },
      // Potentially add other comparison metrics here if needed
    ]);

  } catch (error: any) {
    console.error(`Error fetching ${period} revenue comparison:`, error);
    // Check for specific Supabase errors if needed, e.g., RLS issues
    const message = error.message || 'Internal Server Error';
    const status = typeof error.status === 'number' ? error.status : 500; // Use Supabase error status if available
    return NextResponse.json({ error: message }, { status });
  }
}
