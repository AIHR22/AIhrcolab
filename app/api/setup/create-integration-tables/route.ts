import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { createSQLFunctions } from './sql-functions';

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
 * GET handler - Create integration tables
 */
export async function GET() {
  try {
    console.log("[Setup] Creating integration tables...");
    
    // Step 1: Create the SQL functions
    await createSQLFunctions();
    console.log("[Setup] SQL functions created successfully");
    
    // Step 2: Execute the setup function
    const { data, error } = await supabaseAdmin.rpc('setup_integration_tables');
    
    if (error) {
      console.error("[Setup] Error setting up integration tables:", error);
      throw error;
    }
    
    console.log("[Setup] Integration tables created successfully:", data);
    
    return NextResponse.json({ 
      success: true, 
      message: "Integration tables created successfully" 
    });
  } catch (error: any) {
    console.error("[Setup] Error creating integration tables:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
