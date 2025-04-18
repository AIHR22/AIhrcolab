import { NextResponse } from 'next/server'
import { withErrorHandler, withAuth, supabase } from '../../middleware'

export const GET = withErrorHandler(async (request: Request) => {
  const { tenantId } = await withAuth(request)
  
  const { data, error } = await supabase
    .from('revenue_model_params')
    .select('*')
    .eq('tenant_id', tenantId)
    .single()

  if (error) throw error

  return NextResponse.json({
    employeeCount: data.employee_count,
    avgSalary: data.avg_salary,
    revenuePerEmployee: data.revenue_per_employee,
    growthRate: data.growth_rate
  })
})
