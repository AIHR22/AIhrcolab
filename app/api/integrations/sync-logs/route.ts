import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET handler - Get sync logs
 */
export async function GET(request: Request) {
  try {
    console.log("[API] GET /api/integrations/sync-logs: Starting request");
    
    // Get URL
    const url = new URL(request.url);
    const params = url.searchParams;
    
    // Get integration ID from query params
    const integrationId = params.get('integration_id');
    const limit = parseInt(params.get('limit') || '10', 10);
    
    let query = supabaseAdmin
      .from('integration_sync_logs')
      .select('*')
      .order('start_time', { ascending: false })
      .limit(limit);
    
    // Filter by integration if provided
    if (integrationId) {
      query = query.eq('integration_config_id', integrationId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[API] Error in GET /api/integrations/sync-logs:", error);
    return NextResponse.json({ 
      error: error.message,
      details: error.details || error.hint || null,
      code: error.code || null
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
