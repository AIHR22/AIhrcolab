import { NextResponse } from 'next/server'
import { withErrorHandler, withAuth, supabase } from '../../../middleware'
import { Scenario } from '../../types'

export const GET = withErrorHandler(async (request: Request) => {
  const { tenantId } = await withAuth(request)
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('project_id')

  if (!projectId) {
    return NextResponse.json({ error: 'project_id is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('scenarios')
    .select('id, name, impact_amount')
    .eq('tenant_id', tenantId)
    .eq('scenario_type', 'project')
    .eq('is_predefined', true)
    .eq('project_id', projectId)

  if (error) throw error

  return NextResponse.json({ scenarios: data })
})
