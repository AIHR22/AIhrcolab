import { NextResponse } from 'next/server'
import { withErrorHandler, withAuth, supabase } from '../../../middleware'

export const POST = withErrorHandler(async (request: Request) => {
  const { tenantId } = await withAuth(request)
  const { project_id, parameters } = await request.json() as { 
    project_id: string
    parameters: Record<string, number> 
  }

  if (!project_id) {
    return NextResponse.json({ error: 'project_id is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .rpc('calculate_scenario_impact', {
      tenant_id: tenantId,
      project_id,
      parameters
    })

  if (error) throw error

  return NextResponse.json({ impact: data })
})
