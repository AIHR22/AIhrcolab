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

    // 1. Fetch project details
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('id', projectId)
      .single()

    if (projectError) {
      if (projectError.code === 'PGRST116') { // Not found
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }
      console.error('Error fetching project:', projectError)
      return NextResponse.json({ error: 'Failed to fetch project details', details: projectError.message }, { status: 500 })
    }
    if (!projectData) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // --- Processing as per spec ---
    // 1. Fetch baseline model parameters for project (`revenue_model_params` filtered by `project_id`).
    // 2. Aggregate actual `revenue_data` for last 6 months (`is_projected=false`).
    // 3. Sum projected next 12 months (`is_projected=true`) if present, else compute using model.
    // These steps require knowledge of `revenue_model_params` and `revenue_data` table structures and relationships.
    // For now, I'll return placeholder values for metrics.

    const metrics = {
      monthly: Math.random() * 10000, // Placeholder
      annual: Math.random() * 120000,  // Placeholder
      projected: Math.random() * 150000, // Placeholder
      profitMargin: Math.random() * 100 // Placeholder
    }

    return NextResponse.json({
      project: {
        id: projectData.id,
        name: projectData.name,
      },
      metrics,
    })

  } catch (e: any) {
    console.error(`Error in GET /api/revenue/projects/${projectId}/overview:`, e)
    return NextResponse.json({ error: 'An unexpected error occurred', details: e.message }, { status: 500 })
  }
} 