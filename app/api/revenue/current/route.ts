import { NextResponse } from 'next/server'
import { withErrorHandler, withAuth, supabase } from '../../middleware'

type Department = {
  name: string
}

type RevenueData = {
  amount: number
  period_date: string
  period_type: string
  department: Department | null
}

export const GET = withErrorHandler(async (request: Request) => {
  const { tenantId } = await withAuth(request)
  
  const { data, error } = await supabase
    .from('revenue_data')
    .select(`
      amount,
      period_date,
      period_type,
      department:departments(name)
    `)
    .eq('tenant_id', tenantId)
    .eq('is_projected', false)
    .order('period_date', { ascending: false })
    .limit(1)
    .single()

  if (error) throw error

  const typedData = data as unknown as RevenueData

  return NextResponse.json({
    currentRevenue: typedData.amount,
    lastUpdated: typedData.period_date,
    periodType: typedData.period_type,
    department: typedData.department ? typedData.department.name : null
  })
})
