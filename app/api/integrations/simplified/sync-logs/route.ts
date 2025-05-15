import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET handler - Get simplified sync logs for integrations
 */
export async function GET(request: Request) {
  try {
    console.log("[API] GET /api/integrations/simplified/sync-logs: Starting request");
    
    const url = new URL(request.url);
    const params = url.searchParams;
    const limit = parseInt(params.get('limit') || '20');
    const integrationId = params.get('integration_id');
    
    let query = supabase
      .from('integration_sync_logs')
      .select('*')
      .order('start_time', { ascending: false })
      .limit(limit);
    
    // Add integration filter if provided
    if (integrationId) {
      query = query.eq('integration_config_id', integrationId);
    }
    
    const { data: logs, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json(logs);
  } catch (error: any) {
    console.error("[API] Error in GET /api/integrations/simplified/sync-logs:", error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}
