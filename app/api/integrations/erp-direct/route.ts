import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ERPIntegrationService } from '@/lib/services/erp-integration';

// Initialize Supabase Admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

// Define the expected structure for ERP integration
interface ERPIntegrationConfig {
  name: string;
  provider: 'workday' | 'sap' | 'oracle' | 'custom';
  connection_string: string;
  mapping: {
    employees?: Record<string, string>;
    departments?: Record<string, string>;
    projects?: Record<string, string>;
  };
  sync_frequency: 'hourly' | 'daily' | 'weekly' | 'manual';
  credentials: Record<string, string>;
}

// Helper function to validate the integration config
function validateIntegrationConfig(config: any): ERPIntegrationConfig {
  if (!config.name || typeof config.name !== 'string') {
    throw new Error('Invalid or missing integration name');
  }
  if (!['workday', 'sap', 'oracle', 'custom'].includes(config.provider)) {
    throw new Error('Invalid or unsupported provider');
  }
  if (!config.connection_string || typeof config.connection_string !== 'string') {
    throw new Error('Invalid or missing connection string');
  }
  if (!config.mapping || typeof config.mapping !== 'object') {
    throw new Error('Invalid or missing field mapping');
  }
  if (!['hourly', 'daily', 'weekly', 'manual'].includes(config.sync_frequency)) {
    throw new Error('Invalid sync frequency');
  }
  return config as ERPIntegrationConfig;
}

// POST endpoint to create/update ERP integration
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const config = validateIntegrationConfig(data);

    // Store the integration configuration
    const { data: integration, error } = await supabaseAdmin
      .from('erp_integration_config')
      .upsert({
        name: config.name,
        provider: config.provider,
        api_endpoint: config.connection_string,
        credentials: config.credentials,
        sync_frequency: config.sync_frequency,
        mapping: config.mapping,
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'ERP integration configured successfully',
      data: integration
    });
  } catch (error: any) {
    console.error('Error configuring ERP integration:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to configure ERP integration' },
      { status: 400 }
    );
  }
}

// GET endpoint to retrieve ERP integration status
export async function GET() {
  try {
    const { data: integrations, error } = await supabaseAdmin
      .from('erp_integration_config')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: integrations
    });
  } catch (error: any) {
    console.error('Error fetching ERP integrations:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch ERP integrations' },
      { status: 500 }
    );
  }
}

// PUT endpoint to trigger manual sync
export async function PUT(request: Request) {
  try {
    const { integration_id } = await request.json();
    if (!integration_id) {
      throw new Error('Integration ID is required');
    }

    // Get the integration config
    const { data: config, error: configError } = await supabaseAdmin
      .from('erp_integration_config')
      .select('*')
      .eq('id', integration_id)
      .single();

    if (configError || !config) {
      throw new Error('Integration not found');
    }

    // Initialize the ERP integration service
    const erpService = new ERPIntegrationService([{
      system: config.provider,
      connectionString: config.api_endpoint,
      credentials: config.credentials,
      mapping: config.mapping
    }]);

    // Perform the sync
    const employees = await erpService.getEmployeesFromAllSystems();
    
    // Update the last sync timestamp
    const { error: updateError } = await supabaseAdmin
      .from('erp_integration_config')
      .update({ last_sync: new Date().toISOString() })
      .eq('id', integration_id);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      message: 'Manual sync completed successfully',
      data: { synced_records: employees.length }
    });
  } catch (error: any) {
    console.error('Error during manual sync:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to perform manual sync' },
      { status: 500 }
    );
  }
}