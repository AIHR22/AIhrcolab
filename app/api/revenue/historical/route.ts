import { NextResponse } from 'next/server'
import { withErrorHandler, withAuth, supabase } from '../../middleware'

type Department = {
  name: string
}

type RevenueData = {
  amount: number
  period_date: string
  period_type: string
  growth_rate: number
  department: Department | null
}

export const GET = withErrorHandler(async (request: Request) => {
  const { tenantId } = await withAuth(request)
  const { searchParams } = new URL(request.url)
  const periodType = searchParams.get('periodType') || 'monthly'
  const limit = parseInt(searchParams.get('limit') || '24')

  const result = await supabase
    .from('revenue_data')
    .select(`
      amount,
      period_date,
      period_type,
      growth_rate,
      department:departments(name)
    `)
    .eq('tenant_id', tenantId)
    .eq('period_type', periodType)
    .eq('is_projected', false)
    .order('period_date', { ascending: false })
    .limit(limit)

  const { data, error } = result

  if (error) throw error

  const typedData = data as unknown as RevenueData[]

  return NextResponse.json({
    historical: typedData.map(d => ({
      amount: d.amount,
      date: d.period_date,
      periodType: d.period_type,
      growthRate: d.growth_rate,
      department: d.department ? d.department.name : null
    }))
  })
})
