// /Users/aaydubs/Downloads/AIhrcolab-Worforceedit/app/api/revenue/company/history/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Database } from '@/types/supabase'; // Assuming types definition

/**
 * @description Fetches the history of company-wide revenue model parameters.
 * Retrieves all past parameter sets stored in the database, ordered by creation date.
 * @returns {Promise<NextResponse>} NextResponse with model history array or error.
 */
export async function GET(request: Request) {
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

    // Fetch saved company revenue scenarios for the tenant
    // EXPLAIN: Only return scenarios that were explicitly saved/downloaded by users
    // This gives a history of actual reports and analyses rather than all model parameters
    const { data: historyData, error: historyError } = await supabase
      .from('company_scenarios')
      .select(`
        id,
        created_at,
        name,
        description,
        scenario_type,
        model_params:revenue_model_params!company_scenarios_model_params_id_fkey (
          employee_count,
          avg_salary,
          revenue_per_employee,
          growth_rate
        ),
        metrics:scenario_metrics (
          monthly_revenue,
          annual_revenue,
          projected_revenue,
          profit_margin
        )
      `)
      .eq('type', 'company')
      .order('created_at', { ascending: false });

    if (historyError) {
      console.error('Error fetching company scenario history:', historyError);
      return NextResponse.json({ error: 'Failed to fetch scenario history' }, { status: 500 });
    }

    // Format the response to match the spec
    const formattedHistory = historyData.map(item => ({
        scenarioId: item.id,
        name: item.name,
        description: item.description,
        created_at: item.created_at,
        type: item.scenario_type,
        parameters: {
          employee_count: item.model_params?.[0]?.employee_count,
          avg_salary: item.model_params?.[0]?.avg_salary,
          revenue_per_employee: item.model_params?.[0]?.revenue_per_employee,
          growth_rate: item.model_params?.[0]?.growth_rate
        },
        metrics: item.metrics?.[0] ?? null // Take first metrics entry if exists,
    }));

    // Return the history data
    return NextResponse.json(formattedHistory ?? []); // Return empty array if no history found

  } catch (error) {
    console.error('Unexpected error fetching revenue model history:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
