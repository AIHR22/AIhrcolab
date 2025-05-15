import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// The mcp-supabase-talk-postgrestRequest function is available globally
declare function mcp_supabase_talk_postgrestRequest(params: { method: string; path: string; body?: any }): Promise<any>;

export async function GET() {
  try {
    // Get the authenticated user
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch settings for the authenticated user
    const result = await (global as any)['mcp-supabase-talk_postgrestRequest']({
      method: 'GET',
      path: `revenue_model_settings?user_id=eq.${user.id}&select=*`
    });

    if (!result || result.length === 0) {
      return NextResponse.json({})
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    // Get the authenticated user
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const {
      employeeCount,
      avgSalary,
      revPerEmp,
      growthRate,
      timeframe
    } = body

    // Validate required fields
    if (!employeeCount || !avgSalary || !revPerEmp || !growthRate || !timeframe) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Prepare the data for upsert
    const updateData = {
      user_id: user.id,
      employee_count: employeeCount,
      avg_salary: avgSalary,
      rev_per_employee: revPerEmp,
      growth_rate: growthRate,
      timeframe_months: timeframe,
      updated_at: new Date().toISOString()
    }

    // Upsert the settings
    const result = await (global as any)['mcp-supabase-talk_postgrestRequest']({
      method: 'POST',
      path: 'revenue_model_settings',
      body: {
        ...updateData,
        on_conflict: 'user_id',
        resolution: 'merge-duplicates'
      }
    });

    if (!result) {
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 