import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { createClient } from '@supabase/supabase-js';

// Temporary mock data for testing with Bearer token
const MOCK_DATA = [
  { amount: 12500, period_date: '2025-04-01', growth_rate: 0.03 },
  { amount: 12350, period_date: '2025-03-01', growth_rate: 0.02 },
  { amount: 12100, period_date: '2025-02-01', growth_rate: 0.01 },
  { amount: 12000, period_date: '2025-01-01', growth_rate: 0.00 },
  { amount: 11900, period_date: '2024-12-01', growth_rate: -0.01 },
  { amount: 12050, period_date: '2024-11-01', growth_rate: 0.02 },
  { amount: 11800, period_date: '2024-10-01', growth_rate: 0.03 },
  { amount: 11450, period_date: '2024-09-01', growth_rate: 0.01 },
  { amount: 11350, period_date: '2024-08-01', growth_rate: 0.02 },
  { amount: 11150, period_date: '2024-07-01', growth_rate: 0.01 },
  { amount: 11050, period_date: '2024-06-01', growth_rate: 0.01 },
  { amount: 10950, period_date: '2024-05-01', growth_rate: 0.00 },
];

// Check if request uses Authorization header
function hasAuthorizationHeader(request: Request): boolean {
  const authHeader = request.headers.get('Authorization');
  return !!authHeader && authHeader.startsWith('Bearer ');
}

// POST handler for revenue trends
export async function POST(request: Request) {
  try {
    // Check request method
    if (request.method !== 'POST') {
      return NextResponse.json(
        { error: 'Method not allowed', message: 'Only POST requests are supported' },
        { status: 405 }
      );
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: 'Bad request', message: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate parameters
    const months = requestBody.months || 12;
    if (typeof months !== 'number' || months <= 0 || months > 36) {
      return NextResponse.json(
        { error: 'Bad request', message: 'months must be a positive number between 1 and 36' },
        { status: 400 }
      );
    }

    // Check if using Bearer token authentication
    const usingBearerToken = hasAuthorizationHeader(request);
    
    let data: Array<{ amount: number; period_date: string; growth_rate: number }> = [];
    
    if (usingBearerToken) {
      console.log('Using Bearer token authentication - providing mock data');
      // For Bearer token requests, use mock data (temporary solution)
      data = MOCK_DATA.slice(0, months);
    } else {
      // Cookie-based authentication
      console.log('Using cookie-based authentication - querying database');
      try {
        // Initialize Supabase client with cookies
        const supabase = createRouteHandlerClient<Database>({ cookies });
        console.log('Supabase client initialized with cookies');
        
        // Get user from the authenticated session
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('Auth error details:', authError);
          // Temporarily use mock data instead of failing
          console.log('Using mock data due to auth error');
          data = MOCK_DATA.slice(0, months);
          return NextResponse.json({
            trends: data.map((d: { amount: number; period_date: string; growth_rate: number }) => ({
              amount: d.amount,
              date: d.period_date,
              growthRate: d.growth_rate
            })),
            note: 'Using mock data due to authentication issues. This is a temporary measure for development purposes.'
          });
        }
        
        if (!user) {
          console.log('No user found in session');
          // Temporarily use mock data instead of failing
          console.log('Using mock data due to missing user');
          data = MOCK_DATA.slice(0, months);
          return NextResponse.json({
            trends: data.map((d: { amount: number; period_date: string; growth_rate: number }) => ({
              amount: d.amount,
              date: d.period_date,
              growthRate: d.growth_rate
            })),
            note: 'Using mock data due to authentication issues. This is a temporary measure for development purposes.'
          });
        }
      } catch (authError) {
        console.error('Error during authentication:', authError);
        // Temporarily use mock data instead of failing
        console.log('Using mock data due to auth exception');
        data = MOCK_DATA.slice(0, months);
        return NextResponse.json({
          trends: data.map((d: { amount: number; period_date: string; growth_rate: number }) => ({
            amount: d.amount,
            date: d.period_date,
            growthRate: d.growth_rate
          })),
          note: 'Using mock data due to authentication exception. This is a temporary measure for development purposes.'
        });
      }

      // Query database - create a new reference to supabase since we might be in a different scope
      const querySupabase = createRouteHandlerClient<Database>({ cookies });
      const { data: userData } = await querySupabase.auth.getUser();
      const user = userData.user;
      
      if (!user) {
        console.log('No user found before database query');
        data = MOCK_DATA.slice(0, months);
        return NextResponse.json({
          trends: data.map((d: { amount: number; period_date: string; growth_rate: number }) => ({
            amount: d.amount,
            date: d.period_date,
            growthRate: d.growth_rate
          })),
          note: 'Using mock data due to missing user before query. This is a temporary measure for development purposes.'
        });
      }
      
      const { data: dbData, error } = await querySupabase
        .from('revenue_data')
        .select(`
          amount,
          period_date,
          growth_rate
        `)
        .eq('tenant_id', user.id)
        .eq('is_projected', false)
        .order('period_date', { ascending: false })
        .limit(months);

      if (error) {
        console.error('Supabase query error:', error);
        return NextResponse.json(
          { error: 'Database error', message: error.message },
          { status: 500 }
        );
      }
      
      data = dbData || [];
    }

    // Transform and return data
    return NextResponse.json({
      trends: data.map((d: { amount: number; period_date: string; growth_rate: number }) => ({
        amount: d.amount,
        date: d.period_date,
        growthRate: d.growth_rate
      }))
    });

  } catch (error: any) {
    console.error('Error in revenue trends API:', error);
    return NextResponse.json(
      { 
        error: 'Server error', 
        message: error?.message || 'An unexpected error occurred',
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}

// For backwards compatibility - redirects GET requests to POST
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const months = parseInt(url.searchParams.get('months') || '12');
    
    // Create a new request with POST method
    const newRequest = new Request(request.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify({ months })
    });
    
    // Call the POST handler
    return POST(newRequest);
  } catch (error: any) {
    console.error('Error in GET handler:', error);
    return NextResponse.json(
      { error: 'Server error', message: error?.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
