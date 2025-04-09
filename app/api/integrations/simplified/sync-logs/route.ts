import { NextResponse } from "next/server";

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
    
    // Generate demo sync logs
    const demoLogs = [];
    const now = Date.now();
    
    // Create some demo sync logs with different statuses
    for (let i = 0; i < limit; i++) {
      const randomStatus = i % 10 === 0 ? 'failed' : (i % 5 === 0 ? 'warning' : 'success');
      const randomHoursAgo = i * 24 + Math.floor(Math.random() * 12);
      const startTime = new Date(now - randomHoursAgo * 60 * 60 * 1000);
      const endTime = new Date(startTime.getTime() + 5 * 60 * 1000); // 5 minutes later
      
      // Random stats based on status
      let recordsProcessed = Math.floor(Math.random() * 100) + 50;
      let recordsCreated = Math.floor(recordsProcessed * 0.3);
      let recordsUpdated = Math.floor(recordsProcessed * 0.6);
      let recordsFailed = randomStatus === 'failed' ? Math.floor(recordsProcessed * 0.7) : (randomStatus === 'warning' ? Math.floor(recordsProcessed * 0.1) : 0);
      
      const syncLog = {
        id: `log-${i + 1}`,
        integration_config_id: integrationId || '1',
        sync_type: i % 2 === 0 ? 'employees' : 'departments',
        status: randomStatus,
        records_processed: recordsProcessed,
        records_created: recordsCreated,
        records_updated: recordsUpdated,
        records_failed: recordsFailed,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        error_message: randomStatus === 'failed' ? 'Connection timed out while fetching data' : null,
        details: {
          entity: i % 2 === 0 ? 'employees' : 'departments',
          source: ['workday', 'sap', 'oracle', 'microsoft_dynamics'][i % 4]
        }
      };
      
      demoLogs.push(syncLog);
    }
    
    return NextResponse.json(demoLogs);
  } catch (error: any) {
    console.error("[API] Error in GET /api/integrations/simplified/sync-logs:", error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}
