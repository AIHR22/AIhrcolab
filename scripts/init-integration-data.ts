import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

async function initializeIntegrationData() {
  try {
    console.log('Initializing integration data...');

    // Insert sample integration configs
    const { error: configError } = await supabase
      .from('integration_configs')
      .insert([
        {
          name: 'Workday Integration',
          system_type: 'workday',
          auth_type: 'oauth2',
          config: {},
          is_active: true,
          sync_frequency: 'daily'
        },
        {
          name: 'SAP SuccessFactors Integration',
          system_type: 'sap',
          auth_type: 'oauth2',
          config: {},
          is_active: true,
          sync_frequency: 'daily'
        },
        {
          name: 'CSV File Import',
          system_type: 'csv_file',
          auth_type: 'none',
          config: {},
          is_active: true,
          sync_frequency: 'manual'
        }
      ]);

    if (configError) {
      throw configError;
    }

    console.log('Integration data initialized successfully!');
  } catch (error) {
    console.error('Error initializing integration data:', error);
    throw error;
  }
}

initializeIntegrationData();