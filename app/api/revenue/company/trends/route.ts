// /Users/aaydubs/Downloads/AIhrcolab-Worforceedit/app/api/revenue/company/trends/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
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

/**
 * @description Fetches company-wide actual and projected revenue trends for the last N months.
 * @param {NextRequest} request - The incoming request object, expecting a 'months' query parameter.
 * @returns {Promise<NextResponse>} NextResponse with trend data ({ actuals: [], projected: [] }) or error.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const monthsParam = searchParams.get('months');
  
  // Support both cookie and Bearer token auth in development
  let supabase;
  if (process.env.NODE_ENV === 'development') {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      // Use admin client for Bearer token in dev mode
      supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
    } else {
      // Default to cookie auth
      const cookieStore = cookies();
      supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    }
  } else {
    // Production always uses cookie auth
    const cookieStore = cookies();
    supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
  }

  // Validate 'months' parameter
  const months = parseInt(monthsParam ?? '', 10);
  if (isNaN(months) || months <= 0) {
    return NextResponse.json({ error: "Invalid or missing 'months' query parameter. Must be a positive integer." }, { status: 400 });
  }

  try {
    // Check session - RLS handles tenant access
    if (process.env.NODE_ENV === 'development' && request.headers.get('authorization')?.startsWith('Bearer test_token')) {
      // Skip session check in development mode with test token
      console.log('Development mode: Using test token');
    } else {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error('Unauthorized access attempt:', sessionError);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Calculate the date range for the query
    // We want the last 'months' number of months, including the current month's start date if appropriate.
    // Fetching data from the start of (months - 1) months ago up to the start of the current month.
    const endDate = getFirstDayOfRelativeMonth(0); // Start of current month
    const startDate = getFirstDayOfRelativeMonth(-(months -1)); // Start of the period 'months' ago

    // Fetch actual revenue data for the period
    // EXPLAIN: Select actual revenue data points (is_projected = false) within the calculated date range.
    const { data: actualsData, error: actualsError } = await supabase
      .from('revenue_data')
      .select('period_date, amount')
      .gte('period_date', startDate)
      .lte('period_date', endDate) // Inclusive of the start date of the current month
      .eq('is_projected', false)
      .order('period_date', { ascending: true });

    if (actualsError) {
      console.error('Error fetching actual revenue trends:', actualsError);
      throw new Error('Failed to fetch actual revenue data');
    }

    // Fetch projected revenue data for the period
    // EXPLAIN: Select projected revenue data points (is_projected = true) within the calculated date range.
    // The spec mentions calling another endpoint or inline math, but we first try fetching from revenue_data.
    // If revenue_data doesn't store future projections, this might need adjustment based on actual data structure/strategy.
    const { data: projectedData, error: projectedError } = await supabase
      .from('revenue_data')
      .select('period_date, amount')
      .gte('period_date', startDate)
      .lte('period_date', endDate) // Inclusive of the start date of the current month
      .eq('is_projected', true)
      .order('period_date', { ascending: true });

    if (projectedError) {
        console.error('Error fetching projected revenue trends:', projectedError);
        // Depending on requirements, maybe we don't fail the whole request if projections aren't found?
        // For now, treating it as an error.
        throw new Error('Failed to fetch projected revenue data');
    }

    // Format the response according to the spec
    const responsePayload = {
      actuals: actualsData ?? [],
      projected: projectedData ?? [], // Send empty array if null
    };

    return NextResponse.json(responsePayload);

  } catch (error: any) {
    console.error(`Error fetching revenue trends for last ${months} months:`, error);
    const message = error.message || 'Internal Server Error';
    // Ensure status code handling if error comes from Supabase or is thrown manually
    const status = typeof error.status === 'number' ? error.status : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
