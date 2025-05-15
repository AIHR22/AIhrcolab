import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createSupabaseServerComponentClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const supabase = createSupabaseServerComponentClient()
  const { projectId } = params

  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !sessionData.session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // --- Processing as per spec ---
    // Fetch saved scenarios for this project_id.
    // Assuming a table like `project_scenarios` with columns: `id`, `type`, `created_at`, `impact_amount`, `project_id`
    // The spec mentions: `[ { "id": uuid, "type": "builder"|"custom", "created_at": string, "impact_amount": number }, … ]`

    const { data, error } = await supabase
      .from('project_scenarios') // Assuming this table exists for project-specific scenarios
      .select('id, type, created_at, impact_amount')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(`Error fetching scenario history for project ${projectId}:`, error)
      return NextResponse.json({ error: 'Failed to fetch scenario history', details: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])

  } catch (e: any) {
    console.error(`Error in GET /api/revenue/projects/${projectId}/history:`, e)
    return NextResponse.json({ error: 'An unexpected error occurred', details: e.message }, { status: 500 })
  }
} 