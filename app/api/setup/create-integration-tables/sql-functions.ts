import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with admin rights
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Create the database functions for setting up integration tables
 */
export async function createSQLFunctions() {
  try {
    console.log("[Setup] Creating SQL functions for integration tables...");
    
    // Function to create integration_configs table
    await supabaseAdmin.rpc('create_pgsql_function', {
      function_name: 'create_integration_configs_table',
      function_definition: `
        BEGIN
          -- Create integration_configs table if it doesn't exist
          CREATE TABLE IF NOT EXISTS integration_configs (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(255) NOT NULL,
            system_type VARCHAR(100) NOT NULL,
            auth_type VARCHAR(50) NOT NULL,
            config JSONB NOT NULL,
            is_active BOOLEAN DEFAULT false,
            sync_frequency VARCHAR(50) DEFAULT 'daily',
            last_sync_at TIMESTAMP WITH TIME ZONE,
            next_sync_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
          
          -- Create index on system_type
          CREATE INDEX IF NOT EXISTS idx_integration_configs_system_type ON integration_configs(system_type);
          
          -- Create trigger for updated_at
          CREATE OR REPLACE FUNCTION update_updated_at_column()
          RETURNS TRIGGER AS $$
          BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
          END;
          $$ language 'plpgsql';
          
          DROP TRIGGER IF EXISTS update_integration_configs_updated_at ON integration_configs;
          CREATE TRIGGER update_integration_configs_updated_at
          BEFORE UPDATE ON integration_configs
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
          
          RETURN TRUE;
        END;
      `
    });
    
    // Function to create integration_sync_logs table
    await supabaseAdmin.rpc('create_pgsql_function', {
      function_name: 'create_integration_sync_logs_table',
      function_definition: `
        BEGIN
          -- Create integration_sync_logs table if it doesn't exist
          CREATE TABLE IF NOT EXISTS integration_sync_logs (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            integration_config_id UUID REFERENCES integration_configs(id) ON DELETE CASCADE,
            sync_type VARCHAR(50) NOT NULL,
            status VARCHAR(50) NOT NULL,
            records_processed INTEGER DEFAULT 0,
            records_created INTEGER DEFAULT 0,
            records_updated INTEGER DEFAULT 0,
            records_failed INTEGER DEFAULT 0,
            start_time TIMESTAMP WITH TIME ZONE NOT NULL,
            end_time TIMESTAMP WITH TIME ZONE,
            error_message TEXT,
            details JSONB
          );
          
          -- Create indexes
          CREATE INDEX IF NOT EXISTS idx_integration_sync_logs_config_id ON integration_sync_logs(integration_config_id);
          CREATE INDEX IF NOT EXISTS idx_integration_sync_logs_status ON integration_sync_logs(status);
          
          RETURN TRUE;
        END;
      `
    });
    
    // Function to create integration_field_mappings table
    await supabaseAdmin.rpc('create_pgsql_function', {
      function_name: 'create_integration_field_mappings_table',
      function_definition: `
        BEGIN
          -- Create integration_field_mappings table if it doesn't exist
          CREATE TABLE IF NOT EXISTS integration_field_mappings (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            integration_config_id UUID REFERENCES integration_configs(id) ON DELETE CASCADE,
            entity_type VARCHAR(50) NOT NULL,
            source_field VARCHAR(255) NOT NULL,
            target_field VARCHAR(255) NOT NULL,
            is_required BOOLEAN DEFAULT false,
            transformation_rule TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
          
          -- Create index
          CREATE INDEX IF NOT EXISTS idx_integration_field_mappings_config_id ON integration_field_mappings(integration_config_id);
          
          -- Create trigger for updated_at
          DROP TRIGGER IF EXISTS update_integration_field_mappings_updated_at ON integration_field_mappings;
          CREATE TRIGGER update_integration_field_mappings_updated_at
          BEFORE UPDATE ON integration_field_mappings
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
          
          RETURN TRUE;
        END;
      `
    });
    
    // Create the function that calls these functions
    await supabaseAdmin.rpc('create_pgsql_function', {
      function_name: 'setup_integration_tables',
      function_definition: `
        BEGIN
          PERFORM create_integration_configs_table();
          PERFORM create_integration_sync_logs_table();
          PERFORM create_integration_field_mappings_table();
          RETURN TRUE;
        END;
      `
    });
    
    return true;
  } catch (error) {
    console.error("[Setup] Error creating SQL functions:", error);
    throw error;
  }
}
