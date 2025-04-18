import { NextResponse } from 'next/server'
import { withErrorHandler, withAuth, supabase } from '../../middleware'

export const GET = withErrorHandler(async (request: Request) => {
  const { tenantId } = await withAuth(request)
  const { searchParams } = new URL(request.url)
  const timeFrame = searchParams.get('timeFrame') || '6months'
  
  const periodMapping = {
    '6months': 6,
    '1year': 12,
    '2years': 24
  }[timeFrame] || 6

  const { data, error } = await supabase
    .from('revenue_data')
    .select(`
      amount,
      period_date,
      growth_rate
    `)
    .eq('tenant_id', tenantId)
    .eq('is_projected', false)
    .order('period_date', { ascending: false })
    .limit(periodMapping)

  if (error) throw error

  return NextResponse.json({
    trends: data.map(d => ({
      amount: d.amount,
      date: d.period_date,
      growthRate: d.growth_rate
    }))
  })
})
