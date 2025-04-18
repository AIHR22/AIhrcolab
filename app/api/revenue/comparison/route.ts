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
  is_projected: boolean
  department: Department | null
}

export const GET = withErrorHandler(async (request: Request) => {
  const { tenantId } = await withAuth(request)
  const { searchParams } = new URL(request.url)
  const timeFrame = searchParams.get('timeFrame') || 'monthly'
  const metric = searchParams.get('metric') || 'growth'

  const result = await supabase
    .from('revenue_data')
    .select(`
      amount,
      period_date,
      period_type,
      growth_rate,
      is_projected,
      department:departments(name)
    `)
    .eq('tenant_id', tenantId)
    .eq('period_type', timeFrame)
    .order('period_date', { ascending: false })

  const { data, error } = result

  if (error) throw error

  const typedData = data as unknown as RevenueData[]

  const comparisonData = typedData.reduce((acc: Record<string, Array<{
    date: string
    growthRate?: number
    amount?: number
    isProjected: boolean
  }>>, curr) => {
    const key = curr.department ? curr.department.name : 'Company Wide'
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push({
      date: curr.period_date,
      [metric === 'growth' ? 'growthRate' : 'amount']: 
        metric === 'growth' ? curr.growth_rate : curr.amount,
      isProjected: curr.is_projected
    })
    return acc
  }, {})

  return NextResponse.json({ comparison: comparisonData })
})
