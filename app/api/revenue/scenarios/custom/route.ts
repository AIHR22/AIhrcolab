import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createSupabaseServerComponentClient } from '@/lib/supabase/server'
// import { deepseekChat } from '@/lib/openrouterFetch' // Assuming this is where deepseekChat lives

// Placeholder for deepseekChat - replace with actual import and implementation
async function deepseekChat(messages: Array<{role: string, content: string}>): Promise<any> {
  console.log('Mock deepseekChat called for custom scenario:', messages)
  await new Promise(resolve => setTimeout(resolve, 500)) // Simulate AI delay
  // Spec: "Parse response as [{ period_date, amount }, …]"
  // Also need to compute total impact vs baseline. The AI might return this or it might need separate calculation.
  const forecast = [
    { period_date: '2024-08', amount: Math.random() * 25000 },
    { period_date: '2024-09', amount: Math.random() * 26000 },
    { period_date: '2024-10', amount: Math.random() * 27000 },
  ];
  // Simulate impact calculation. This would normally compare AI forecast to a baseline forecast.
  const impact = (forecast.reduce((sum, item) => sum + item.amount, 0) % 10000) - 5000;
  return { forecast, impact }; // Returning both as per spec response format
}

export async function POST(request: Request) {
  // const cookieStore = cookies() // Not needed to pass directly
  const supabase = createSupabaseServerComponentClient() // Corrected: No arguments

  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !sessionData.session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { params: sliderParams } = body // e.g., { marketingSpend, attritionRate, newHires, ... }

    if (!sliderParams || typeof sliderParams !== 'object') {
      return NextResponse.json({ error: 'Invalid input: "params" object is required.' }, { status: 400 })
    }

    // 1. Fetch last 6 months of `revenue_data` actuals (Placeholder)
    const { data: actuals, error: actualsError } = await supabase
      .from('revenue_data')
      .select('period_date, amount')
      .eq('is_projected', false)
      // Ideally, filter by tenant/user if not handled by RLS globally on revenue_data
      .order('period_date', { ascending: false })
      .limit(6)

    if (actualsError) {
      console.error('Error fetching actual revenue data:', actualsError)
      // Depending on AI, this might be a hard failure or it could proceed with defaults.
    }

    // 2. Build AI prompt
    const aiMessages = [
      {
        role: 'system',
        content: 'You are a revenue forecasting assistant. Given recent historical revenue actuals and a set of custom parameter adjustments (from sliders), project the next 12 months of revenue. Return the forecast as a JSON array of {period_date, amount} and the total impact compared to a baseline.'
      },
      {
        role: 'user',
        content: `Historical Actuals (last 6 months): ${JSON.stringify(actuals || [])}. Custom Parameter Adjustments: ${JSON.stringify(sliderParams)}`
      }
    ]

    // 3. Call `deepseekChat`
    const aiResponse = await deepseekChat(aiMessages)
    const { forecast, impact } = aiResponse; // AI mock returns both

    // 4. Parse AI response (already done by mock)
    // 5. Compute total impact vs baseline (mock does a simplified version)

    // 6. Insert into `scenarios`
    const { data: insertedScenario, error: insertError } = await supabase
      .from('scenarios')
      .insert({
        prompt: null, // No natural language prompt for custom scenarios
        params: sliderParams, // Storing the slider params
        impact_amount: impact,
        type: 'custom' // As per spec
        // forecast_data: forecast // Optionally store the full forecast series if needed
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting custom scenario:', insertError)
      return NextResponse.json({ error: 'Failed to save custom scenario', details: insertError.message }, { status: 500 })
    }

    return NextResponse.json({
      scenario: insertedScenario,
      forecast,
      impact
    })

  } catch (e: any) {
    console.error('Error in POST /api/revenue/scenarios/custom:', e)
    if (e instanceof SyntaxError) { 
        return NextResponse.json({ error: 'Invalid JSON in request body', details: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'An unexpected error occurred', details: e.message }, { status: 500 })
  }
} 