import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createSupabaseServerComponentClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = createSupabaseServerComponentClient()

  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !sessionData.session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Spec: "List all `scenarios` rows, ordered `created_at DESC`."
    // Response shape: `[ { "id": uuid, "prompt": string | null, "created_at": string, "impact_amount": number }, … ]`
    const { data, error } = await supabase
      .from('scenarios')
      .select('id, prompt, created_at, impact_amount, type') // Added 'type' as it seems useful context
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching scenarios:', error)
      return NextResponse.json({ error: 'Failed to fetch scenarios', details: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])

  } catch (e: any) {
    console.error('Error in GET /api/revenue/scenarios:', e)
    return NextResponse.json({ error: 'An unexpected error occurred', details: e.message }, { status: 500 })
  }
} 