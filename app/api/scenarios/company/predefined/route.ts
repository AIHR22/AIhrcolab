import { NextResponse } from 'next/server'
import { withErrorHandler, withAuth, supabase } from '../../../middleware'
import { Scenario } from '../../types'

export const GET = withErrorHandler(async (request: Request) => {
  const { tenantId } = await withAuth(request)
  
  const { data, error } = await supabase
    .from('scenarios')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('scenario_type', 'company')
    .eq('is_predefined', true)

  if (error) throw error

  return NextResponse.json({ scenarios: data })
})
