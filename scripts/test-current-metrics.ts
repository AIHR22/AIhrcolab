import { supabaseAdmin } from '@/lib/supabase';

async function testCurrentMetrics() {
  try {
    // 1. Insert test model parameters
    const { data: modelParams, error: modelError } = await supabaseAdmin
      .from('revenue_model_params')
      .insert({
        employee_count: 100,
        avg_salary: 75000,
        growth_rate: 0.05,
      })
      .select()
      .single();

    if (modelError) {
      throw new Error(`Failed to insert model params: ${modelError.message}`);
    }

    console.log('✓ Inserted test model parameters');

    // 2. Insert test revenue data for the last 12 months
    const now = new Date();
    const testData = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      return {
        period_date: date.toISOString().split('T')[0],
        amount: 1000000 + (Math.random() * 100000), // Random revenue around $1M
        is_projected: false,
      };
    });

    const { data: revenueData, error: revenueError } = await supabaseAdmin
      .from('revenue_data')
      .insert(testData)
      .select();

    if (revenueError) {
      throw new Error(`Failed to insert revenue data: ${revenueError.message}`);
    }

    console.log('✓ Inserted test revenue data');

    // 3. Test the API endpoint
    const response = await fetch('http://localhost:3000/api/revenue/company/current');
    const data = await response.json();

    console.log('\nAPI Response:', JSON.stringify(data, null, 2));

    // 4. Clean up test data
    await supabaseAdmin.from('revenue_data').delete().in('id', revenueData.map(d => d.id));
    await supabaseAdmin.from('revenue_model_params').delete().eq('id', modelParams.id);

    console.log('✓ Cleaned up test data');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testCurrentMetrics(); 