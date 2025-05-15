import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createSupabaseServerComponentClient } from '@/lib/supabase/server'
// Assuming deepseekChat is available, as per the specs
// import { deepseekChat } from '@/lib/openrouterFetch'

// Placeholder for deepseekChat - replace with actual import and implementation
async function deepseekChat(messages: Array<{role: string, content: string}>): Promise<any> {
  console.log('Mock deepseekChat called for scenario builder:', messages)
  await new Promise(resolve => setTimeout(resolve, 500)) // Simulate AI delay
  // Simulate AI response structure for scenario builder
  // Spec: "Parse AI JSON response, extract: { adjustments: { ... }, forecast: [ ... ], impact: number }"
  return {
    adjustments: {
      employee_count_delta: messages[1]?.content.includes('Add 5 engineers') ? 5 : 0,
      attrition_rate_change: messages[1]?.content.includes('reduce attrition by 2%') ? -0.02 : 0,
      // ... other potential adjustments parsed by AI
    },
    forecast: [
      { period_date: '2024-08', amount: Math.random() * 20000 },
      { period_date: '2024-09', amount: Math.random() * 21000 },
    ],
    impact: Math.random() * 10000 - 5000,
    parsed_text_summary: `Mock response for: ${messages[1]?.content}`
  };
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
    const { text } = body

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Invalid input: "text" is required and must be a string.' }, { status: 400 })
    }

    // 1. Fetch latest `revenue_model_params` (Placeholder)
    const { data: modelParams, error: modelParamsError } = await supabase
      .from('revenue_model_params')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (modelParamsError || !modelParams) {
      console.error('Error fetching model params:', modelParamsError)
      // Not returning 500 here, as AI might still work with a default model or the user text might be self-contained
      // Consider how critical these params are for the AI prompt.
    }

    // 2. Build AI prompt
    const aiMessages = [
      {
        role: 'system',
        content: 'You are a revenue forecasting assistant. Parse the user\'s natural language input to identify adjustments to a baseline revenue model. Return these adjustments, a new forecast, and the overall impact as a JSON object.'
      },
      {
        role: 'user',
        content: `Baseline Model Parameters: ${JSON.stringify(modelParams || {})}. User Request: "${text}"`
      }
    ]

    // 3. Call `deepseekChat`
    const aiResponse = await deepseekChat(aiMessages)

    // 4. Parse AI JSON response (already done by mock)
    const { adjustments, forecast, impact } = aiResponse;

    // 5. Insert into `scenarios` table
    const { data: insertedScenario, error: insertError } = await supabase
      .from('scenarios') // Assuming 'scenarios' table
      .insert({
        prompt: text,
        params: adjustments, // Storing AI-parsed adjustments
        impact_amount: impact,
        type: 'builder' // As per spec for this endpoint
        // tenant_id and user_id should be handled by RLS or policies
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting scenario:', insertError)
      return NextResponse.json({ error: 'Failed to save scenario', details: insertError.message }, { status: 500 })
    }

    return NextResponse.json({
      scenario: insertedScenario,
      forecast,
      impact,
    })

  } catch (e: any) {
    console.error('Error in POST /api/revenue/scenarios/builder:', e)
     if (e instanceof SyntaxError) { // JSON parsing error
        return NextResponse.json({ error: 'Invalid JSON in request body', details: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'An unexpected error occurred', details: e.message }, { status: 500 })
  }
} 