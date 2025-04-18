import { NextResponse } from 'next/server'
import { withErrorHandler, withAuth, supabase } from '../../middleware'

export const GET = withErrorHandler(async (request: Request) => {
  const { tenantId } = await withAuth(request)

  const { data, error } = await supabase
    .from('departments')
    .select(`
      id,
      name,
      revenue:department_revenue(
        amount,
        period_date,
        is_projected
      )
    `)
    .eq('tenant_id', tenantId)

  if (error) throw error

  return NextResponse.json({
    departments: data.map(d => ({
      id: d.id,
      name: d.name,
      currentRevenue: d.revenue?.find(r => !r.is_projected)?.amount || 0,
      projectedRevenue: d.revenue?.find(r => r.is_projected)?.amount || 0
    }))
  })
})
