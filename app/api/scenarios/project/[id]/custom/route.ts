import { NextResponse } from 'next/server'
import { withErrorHandler, withAuth, supabase } from '../../../../middleware'
import { ScenarioImpactParameters } from '../../../types'

export const POST = withErrorHandler(async (request: Request, { params }: { params: { id: string } }) => {
  const { tenantId } = await withAuth(request)
  const { scenario_ids, parameters } = await request.json() as ScenarioImpactParameters
  
  const { data, error } = await supabase
    .rpc('calculate_scenario_impact', {
      p_scenario_ids: scenario_ids,
      p_tenant_id: tenantId,
      p_project_id: params.id,
      p_parameters: parameters
    })

  if (error) throw error

  return NextResponse.json({ impact: data })
})
