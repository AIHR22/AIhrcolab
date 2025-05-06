import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Calculate revenue data for a specific month
async function calculateMonthlyRevenue(date: Date) {
  // Get employee data for the month
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  
  const { data: employees } = await supabaseAdmin
    .from('employees')
    .select('salary')
    .gte('created_at', startOfMonth.toISOString())
    .lte('created_at', endOfMonth.toISOString());

  // Calculate revenue based on employee salaries
  // Assuming revenue is 2x total salary cost as an example
  const totalSalary = employees?.reduce((sum, emp) => sum + (Number(emp.salary) || 0), 0) || 0;
  return totalSalary * 2; // Example revenue calculation
}

// GET: Fetch revenue data
export async function GET() {
  try {
    const { data: revenueData, error } = await supabaseAdmin
      .from('revenue_data')
      .select('*')
      .order('period_date', { ascending: true });

    if (error) throw error;

    return NextResponse.json(revenueData);
  } catch (error: any) {
    console.error('Error fetching revenue data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Calculate and store revenue data
export async function POST() {
  try {
    // Calculate revenue for the last 12 months
    const revenues = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const amount = await calculateMonthlyRevenue(date);
      
      revenues.push({
        period_date: date.toISOString().split('T')[0],
        amount,
        is_projected: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    // Store in revenue_data table
    const { error } = await supabaseAdmin
      .from('revenue_data')
      .upsert(revenues, {
        onConflict: 'period_date'
      });

    if (error) throw error;

    return NextResponse.json({ success: true, count: revenues.length });
  } catch (error: any) {
    console.error('Error calculating revenue data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 