import { NextResponse } from 'next/server'
import { withErrorHandler, withAuth, supabase } from '../../../middleware'

export const GET = withErrorHandler(async (request: Request, { params }: { params: { id: string } }) => {
  const { tenantId } = await withAuth(request)

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select(`
      id,
      name,
      description,
      start_date,
      end_date,
      revenue:revenue_data(
        amount,
        period_date,
        period_type,
        is_projected,
        growth_rate
      )
    `)
    .eq('tenant_id', tenantId)
    .eq('id', params.id)
    .single()

  if (projectError) throw projectError

  return NextResponse.json({
    id: project.id,
    name: project.name,
    description: project.description,
    startDate: project.start_date,
    endDate: project.end_date,
    revenue: project.revenue.map(r => ({
      amount: r.amount,
      date: r.period_date,
      periodType: r.period_type,
      isProjected: r.is_projected,
      growthRate: r.growth_rate
    }))
  })
})
