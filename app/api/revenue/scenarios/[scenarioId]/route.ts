import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createSupabaseServerComponentClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: { scenarioId: string } }
) {
  const supabase = createSupabaseServerComponentClient()
  const { scenarioId } = params

  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !sessionData.session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!scenarioId) {
      return NextResponse.json({ error: 'Scenario ID is required' }, { status: 400 })
    }

    // Spec: "Return full scenario with `params`, `impact_amount`, and optionally saved `forecast` series."
    // Assuming 'scenarios' table has `id`, `params`, `impact_amount`, and potentially `forecast_data` or similar.
    const { data: scenario, error } = await supabase
      .from('scenarios')
      .select('*, forecast_data:forecast_series') // Select all from scenario, and if forecast is stored in a different linked way, adjust here.
      // For now, assuming `params` (JSON), `impact_amount`, `prompt`, `type`, `created_at` are columns in `scenarios`.
      // If `forecast_series` is a JSON column in `scenarios` table itself:
      // .select('id, prompt, params, impact_amount, created_at, type, forecast_series')
      .eq('id', scenarioId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return NextResponse.json({ error: 'Scenario not found' }, { status: 404 })
      }
      console.error(`Error fetching scenario ${scenarioId}:`, error)
      return NextResponse.json({ error: 'Failed to fetch scenario', details: error.message }, { status: 500 })
    }
    if (!scenario) {
        return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
    }

    return NextResponse.json(scenario)

  } catch (e: any) {
    console.error(`Error in GET /api/revenue/scenarios/${scenarioId}:`, e)
    return NextResponse.json({ error: 'An unexpected error occurred', details: e.message }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { scenarioId: string } }
) {
  const supabase = createSupabaseServerComponentClient()
  const { scenarioId } = params

  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !sessionData.session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!scenarioId) {
      return NextResponse.json({ error: 'Scenario ID is required' }, { status: 400 })
    }

    // Spec: "Delete the scenario row and any associated `revenue_data` projections."
    // Deleting associated `revenue_data` projections would require knowing how they are linked (e.g., by scenario_id).
    // For now, just deleting the scenario row.
    // If projections are stored in `revenue_data` with a `scenario_id` foreign key, you'd add:
    // await supabase.from('revenue_data').delete().eq('scenario_id', scenarioId)

    const { error } = await supabase
      .from('scenarios')
      .delete()
      .eq('id', scenarioId)
      // .single() // if you want to ensure only one row was deleted or get data back

    if (error) {
      // Check if error is due to not found, though delete usually doesn't error on not found unless .single() or .throwOnError()
      console.error(`Error deleting scenario ${scenarioId}:`, error)
      return NextResponse.json({ error: 'Failed to delete scenario', details: error.message }, { status: 500 })
    }

    // No content to return on successful delete, typically 204 or 200 with a message.
    return NextResponse.json({ message: 'Scenario deleted successfully' }, { status: 200 })
    // return new NextResponse(null, { status: 204 }); // Alternative for 204 No Content

  } catch (e: any) {
    console.error(`Error in DELETE /api/revenue/scenarios/${scenarioId}:`, e)
    return NextResponse.json({ error: 'An unexpected error occurred', details: e.message }, { status: 500 })
  }
} 