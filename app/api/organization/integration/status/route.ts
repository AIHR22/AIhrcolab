import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { ERPIntegrationConfig } from "@/types/organization"

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Helper function to ensure the ERP integration table exists
async function ensureERPIntegrationTable() {
  try {
    // Check if the table exists
    const { data, error } = await supabase
      .from('erp_integration_config')
      .select('id')
      .limit(1)
    
    // If there's an error other than table doesn't exist, throw it
    if (error && error.code !== '42P01') {
      throw error
    }
    
    // If the table doesn't exist, create it
    if (error && error.code === '42P01') {
      console.log("erp_integration_config table doesn't exist, creating it now")
      
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS public.erp_integration_config (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL,
          provider TEXT NOT NULL CHECK (provider IN ('workday', 'sap', 'oracle', 'custom')),
          api_endpoint TEXT NOT NULL,
          auth_method TEXT NOT NULL CHECK (auth_method IN ('oauth', 'api_key', 'basic_auth')),
          credentials JSONB NOT NULL,
          sync_frequency TEXT NOT NULL CHECK (sync_frequency IN ('hourly', 'daily', 'weekly', 'manual')),
          last_sync TIMESTAMP WITH TIME ZONE,
          status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
        
        -- Create index for faster queries
        CREATE INDEX IF NOT EXISTS idx_erp_integration_config_status ON public.erp_integration_config(status);
      `
      
      const { error: createError } = await supabase.rpc('pgql', { query: createTableQuery })
      
      if (createError) {
        console.error("Error creating erp_integration_config table:", createError)
        return false
      }
      
      console.log("Successfully created erp_integration_config table")
    }
    
    return true
  } catch (error) {
    console.error("Error ensuring ERP integration table:", error)
    return false
  }
}

export async function GET(request: Request) {
  try {
    console.log("Fetching organization data source status")
    
    // Since we're using Supabase directly and not an external ERP system,
    // we'll always return a "connected" status
    return NextResponse.json({
      success: true,
      data: {
        active: true,
        status: "active",
        provider: "supabase",
        lastSync: new Date().toISOString(),
        message: "Using Supabase as primary data source",
        isDirectIntegration: true
      }
    })
    
  } catch (error) {
    console.error("[API] Unexpected error in integration status endpoint:", error)
    return NextResponse.json({ 
      success: false, 
      message: "An unexpected error occurred", 
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  // We don't need to implement this since we're not connecting to an external ERP system
  return NextResponse.json({
    success: true,
    data: {
      active: true,
      status: "active",
      provider: "supabase",
      message: "Using Supabase as primary data source",
      isDirectIntegration: true
    }
  })
}
