import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's tenant context
    const { data: tenantUser, error: tenantError } = await supabase
      .from('tenant_users')
      .select('tenant_id, role')
      .eq('user_id', session.user.id)
      .single();

    if (tenantError) {
      console.error('Error fetching tenant context:', tenantError);
      return NextResponse.json({ error: 'Failed to get tenant context' }, { status: 500 });
    }

    // Parse request body
    const { months = 12 } = await request.json();

    // Get department revenue data from Supabase with tenant context
    // RLS will automatically filter by tenant_id
    const { data: revenueData, error: revenueError } = await supabase
      .from('department_revenue')
      .select(`
        amount,
        date,
        department_id,
        tenant_id
      `)
      .order('date', { ascending: false })
      .limit(months);

    if (revenueError) {
      console.error('Error fetching revenue data:', revenueError);
      return NextResponse.json({ error: 'Failed to fetch revenue data' }, { status: 500 });
    }

    if (!revenueData || revenueData.length === 0) {
      // Return mock data for now
      const mockForecasts = Array.from({ length: months }, (_, i) => ({
        amount: Math.floor(Math.random() * 1000000) + 500000,
        date: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        periodType: 'monthly',
        departmentId: 'sales',
        department_revenue: { 'sales': Math.floor(Math.random() * 1000000) + 500000 }
      }));

      return NextResponse.json({ 
        forecasts: mockForecasts,
        success: true
      });
    }

    // Transform the data into the expected format
    const forecasts = revenueData.map(revenue => ({
      amount: Number(revenue.amount),
      date: revenue.date,
      periodType: 'monthly',
      departmentId: revenue.department_id,
      department_revenue: { [revenue.department_id]: Number(revenue.amount) }
    }));

    return NextResponse.json({ 
      forecasts,
      success: true
    });

  } catch (error) {
    console.error('Error in revenue forecast API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
