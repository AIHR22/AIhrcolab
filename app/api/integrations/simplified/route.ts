import { NextResponse } from "next/server";
import { IntegrationAdapter } from '@/lib/integrations/integration-adapter';

const integrationAdapter = new IntegrationAdapter();

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET handler - Get simplified integration status or available systems
 */
export async function GET(request: Request) {
  try {
    console.log("[API] GET /api/integrations/simplified: Starting request");
    
    const url = new URL(request.url);
    const params = url.searchParams;
    
    // If we're getting supported systems
    if (params.get('systems') === 'true') {
      // Return hardcoded list of supported systems
      const supportedSystems = [
        { value: 'workday', label: 'Workday' },
        { value: 'sap', label: 'SAP SuccessFactors' },
        { value: 'csv_file', label: 'CSV File Import' }
      ];
      return NextResponse.json(supportedSystems);
    }
    
    // Get real integrations from database
    const integrations = await integrationAdapter.getIntegrations();
    return NextResponse.json(integrations);
  } catch (error: any) {
    console.error("[API] Error in GET /api/integrations/simplified:", error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}

/**
 * POST handler - Sync data from external system (simplified demo)
 */
export async function POST(request: Request) {
  try {
    console.log("[API] POST /api/integrations/simplified: Starting request");
    
    const url = new URL(request.url);
    const params = url.searchParams;
    const body = await request.json();
    
    // If action is sync
    if (params.get('action') === 'sync') {
      const { integration_id } = body;
      console.log(`[API] Starting simplified sync for integration: ${integration_id}`);
      
      const integration = await integrationAdapter.getIntegrationById(integration_id);
      if (!integration) {
        return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
      }
      
      const now = new Date();
      const startTime = now.toISOString();
      
      // Calculate next sync time based on frequency
      const nextSync = new Date(now);
      switch (integration.sync_frequency) {
        case 'hourly':
          nextSync.setHours(nextSync.getHours() + 1);
          break;
        case 'daily':
          nextSync.setDate(nextSync.getDate() + 1);
          break;
        case 'weekly':
          nextSync.setDate(nextSync.getDate() + 7);
          break;
        case 'monthly':
          nextSync.setMonth(nextSync.getMonth() + 1);
          break;
        default:
          nextSync.setDate(nextSync.getDate() + 1); // Default to daily
      }
      
      // Update sync timing
      await integrationAdapter.updateSyncTiming(
        integration_id,
        startTime,
        nextSync.toISOString()
      );
      
      // Create sync log
      const syncLog = {
        integration_config_id: integration_id,
        sync_type: 'manual',
        status: 'success',
        records_processed: 0,
        records_created: 0,
        records_updated: 0,
        records_failed: 0,
        start_time: startTime,
        end_time: new Date().toISOString()
      };
      
      await integrationAdapter.createSyncLog(syncLog);
      return NextResponse.json(syncLog);
    }
    
    // Handle test connection request
    if (params.get('action') === 'test') {
      const { system_type, config } = body;
      
      try {
        // Test connection based on system type
        switch (system_type) {
          case 'workday':
            await integrationAdapter.testWorkdayConnection(config);
            break;
          case 'sap':
            await integrationAdapter.testSapConnection(config);
            break;
          case 'csv_file':
            await integrationAdapter.testCsvFileAccess(config);
            break;
          default:
            throw new Error(`Unsupported system type: ${system_type}`);
        }

        return NextResponse.json({
          success: true,
          message: 'Connection successful'
        });
      } catch (error: any) {
        return NextResponse.json({
          success: false,
          message: error.message || 'Connection failed'
        }, { status: 400 });
      }
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error("[API] Error in POST /api/integrations/simplified:", error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}

/**
 * PATCH handler - Update integration status
 */
export async function PATCH(request: Request) {
  try {
    console.log("[API] PATCH /api/integrations/simplified: Starting request");
    
    const url = new URL(request.url);
    const params = url.searchParams;
    const id = params.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Integration ID is required' }, { status: 400 });
    }
    
    const body = await request.json();
    
    // Handle activate/deactivate action
    if (params.get('action') === 'activate') {
      const isActive = body.is_active === true;
      console.log(`[API] ${isActive ? 'Activating' : 'Deactivating'} integration ${id}`);
      
      await integrationAdapter.updateIntegrationStatus(id, isActive);
      
      // Get the updated integration from database
      const { data: updatedIntegration, error: fetchError } = await integrationAdapter.getIntegrationById(id);
      if (fetchError) throw fetchError;
      
      return NextResponse.json(updatedIntegration);
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('[API] Error in PATCH /api/integrations/simplified:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
