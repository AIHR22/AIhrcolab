import { NextResponse } from "next/server";
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

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET handler - Create basic SQL function capability
 */
export async function GET() {
  try {
    console.log("[Setup] Creating function helper...");
    
    // Execute raw SQL to create the create_pgsql_function function
    const { error } = await supabaseAdmin.rpc('exec_sql', {
      sql_statement: `
        CREATE OR REPLACE FUNCTION create_pgsql_function(function_name TEXT, function_definition TEXT) 
        RETURNS BOOLEAN AS $$
        BEGIN
          EXECUTE 'CREATE OR REPLACE FUNCTION ' || function_name || '() RETURNS BOOLEAN AS $inner$' || function_definition || '$inner$ LANGUAGE plpgsql;';
          RETURN TRUE;
        END;
        $$ LANGUAGE plpgsql;
      `
    });
    
    if (error) {
      // If exec_sql doesn't exist, create it first
      if (error.message.includes('function exec_sql() does not exist')) {
        const { error: createError } = await supabaseAdmin.from('_functions').insert({
          name: 'exec_sql',
          definition: `
            CREATE OR REPLACE FUNCTION exec_sql(sql_statement TEXT) 
            RETURNS VOID AS $$
            BEGIN
              EXECUTE sql_statement;
            END;
            $$ LANGUAGE plpgsql;
          `,
          schema: 'public',
          return_type: 'void'
        });
        
        if (createError) {
          throw new Error(`Failed to create exec_sql function: ${createError.message}`);
        }
        
        // Try creating the function again
        return await GET();
      }
      
      throw new Error(`Failed to create function helper: ${error.message}`);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Function helper created successfully" 
    });
  } catch (error: any) {
    console.error("[Setup] Error creating function helper:", error);
    
    // Try direct SQL approach if the API fails
    try {
      // Create a direct SQL query to create the functions
      // This is a fallback method
      const sqlQuery = `
      -- Create integration_configs table
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
      
      -- Create integration_sync_logs table
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
      
      -- Create integration_field_mappings table
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
      
      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_integration_configs_system_type ON integration_configs(system_type);
      CREATE INDEX IF NOT EXISTS idx_integration_sync_logs_config_id ON integration_sync_logs(integration_config_id);
      CREATE INDEX IF NOT EXISTS idx_integration_sync_logs_status ON integration_sync_logs(status);
      CREATE INDEX IF NOT EXISTS idx_integration_field_mappings_config_id ON integration_field_mappings(integration_config_id);
      `;
      
      const { error: directSqlError } = await supabaseAdmin.rpc('exec_sql', { sql_statement: sqlQuery });
      
      if (directSqlError) {
        throw directSqlError;
      }
      
      return NextResponse.json({ 
        success: true, 
        message: "Tables created directly via SQL as fallback" 
      });
    } catch (fallbackError: any) {
      console.error("[Setup] Fallback SQL failed too:", fallbackError);
      
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        fallbackError: fallbackError.message
      }, { status: 500 });
    }
  }
}
