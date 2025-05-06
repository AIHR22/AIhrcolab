import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { integrationService } from '@/lib/services/integration-service';
import { AdapterRegistry } from '@/lib/integrations/adapter-registry';

// Initialize Supabase client (admin for full data access)
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
 * GET handler - Get all integration configurations
 */
export async function GET(request: Request) {
  try {
    console.log("[API] GET /api/integrations: Starting request");
    
    // Get URL and clean it
    const url = new URL(request.url);
    const cleanPath = decodeURIComponent(url.pathname).replace(/\s+/g, '');
    
    // Handle specific integration by ID if provided in the path
    if (cleanPath.match(/\/api\/integrations\/[\w-]+/)) {
      const id = cleanPath.split('/').pop();
      console.log(`[API] Getting integration with ID: ${id}`);
      
      const integrationConfig = await integrationService.getConfigById(id as string);
      return NextResponse.json(integrationConfig);
    }
    
    // Handle query parameters
    const params = url.searchParams;
    
    // If we're getting supported systems
    if (params.get('systems') === 'true') {
      const supportedSystems = AdapterRegistry.getSupportedSystems();
      return NextResponse.json(supportedSystems);
    }
    
    // Otherwise, get all configurations
    const configs = await integrationService.getAllConfigs();
    return NextResponse.json(configs);
  } catch (error: any) {
    console.error("[API] Error in GET /api/integrations:", error);
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

/**
 * POST handler - Create a new integration configuration
 */
export async function POST(request: Request) {
  try {
    console.log("[API] POST /api/integrations: Starting request");
    
    // Parse the request body
    const body = await request.json();
    console.log("[API] Request body:", { ...body, config: "[REDACTED]" });
    
    // Get URL to check for specific actions
    const url = new URL(request.url);
    const params = url.searchParams;
    
    // Handle test connection request
    if (params.get('action') === 'test') {
      console.log(`[API] Testing connection for system type: ${body.system_type}`);
      
      const result = await integrationService.testConnection(body);
      return NextResponse.json(result);
    }
    
    // Handle sync request
    if (params.get('action') === 'sync') {
      console.log(`[API] Syncing data for integration: ${body.integration_id}`);
      
      const result = await integrationService.syncData(
        body.integration_id, 
        body.options || {}
      );
      
      return NextResponse.json(result);
    }
    
    // Handle default field mappings request
    if (params.get('action') === 'mappings') {
      console.log(`[API] Getting default mappings for ${body.system_type}/${body.entity_type}`);
      
      const mappings = await integrationService.getDefaultMappings(
        body.system_type,
        body.entity_type
      );
      
      return NextResponse.json(mappings);
    }
    
    // Handle create integration request
    const { fieldMappings, ...config } = body;
    const result = await integrationService.createConfig(config, fieldMappings);
    
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("[API] Error in POST /api/integrations:", error);
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

/**
 * PATCH handler - Update an existing integration configuration
 */
export async function PATCH(request: Request) {
  try {
    // Get URL and clean it
    const url = new URL(request.url);
    const cleanPath = decodeURIComponent(url.pathname).replace(/\s+/g, '');
    
    // Extract ID from the path
    const matches = cleanPath.match(/\/api\/integrations\/([\w-]+)/);
    if (!matches || !matches[1]) {
      return NextResponse.json({ error: "Invalid integration ID" }, { status: 400 });
    }
    
    const id = matches[1];
    console.log(`[API] PATCH /api/integrations/${id}: Starting request`);
    
    // Parse the request body
    const body = await request.json();
    console.log("[API] Request body:", { ...body, config: body.config ? "[REDACTED]" : undefined });
    
    // Handle activate/deactivate action
    const params = url.searchParams;
    if (params.get('action') === 'activate') {
      const isActive = body.is_active === true;
      console.log(`[API] ${isActive ? 'Activating' : 'Deactivating'} integration ${id}`);
      
      const result = await integrationService.setIntegrationActive(id, isActive);
      return NextResponse.json(result);
    }
    
    // Handle regular update
    const { fieldMappings, ...updates } = body;
    const result = await integrationService.updateConfig(id, updates, fieldMappings);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[API] Error in PATCH /api/integrations:", error);
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

/**
 * DELETE handler - Delete an integration configuration
 */
export async function DELETE(request: Request) {
  try {
    // Get URL and clean it
    const url = new URL(request.url);
    const cleanPath = decodeURIComponent(url.pathname).replace(/\s+/g, '');
    
    // Extract ID from the path
    const matches = cleanPath.match(/\/api\/integrations\/([\w-]+)/);
    if (!matches || !matches[1]) {
      return NextResponse.json({ error: "Invalid integration ID" }, { status: 400 });
    }
    
    const id = matches[1];
    console.log(`[API] DELETE /api/integrations/${id}: Starting request`);
    
    // Delete the integration
    await integrationService.deleteConfig(id);
    
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("[API] Error in DELETE /api/integrations:", error);
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
