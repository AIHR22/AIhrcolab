import { NextResponse } from 'next/server'
import { withErrorHandler, withAuth, supabase } from '../../middleware'

export const GET = withErrorHandler(async (request: Request) => {
  const { tenantId } = await withAuth(request)

  const { data, error } = await supabase
    .from('projects')
    .select(`
      id,
      name,
      revenue:revenue_data(
        amount,
        period_date,
        is_projected
      )
    `)
    .eq('tenant_id', tenantId)

  if (error) throw error

  return NextResponse.json({
    projects: data.map(p => ({
      id: p.id,
      name: p.name,
      currentRevenue: p.revenue?.find(r => !r.is_projected)?.amount || 0,
      projectedRevenue: p.revenue?.find(r => r.is_projected)?.amount || 0
    }))
  })
})
