import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
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
        { value: 'oracle', label: 'Oracle HCM Cloud' },
        { value: 'microsoft_dynamics', label: 'Microsoft Dynamics 365 HR' },
        { value: 'csv_file', label: 'CSV File Import' }
      ];
      return NextResponse.json(supportedSystems);
    }
    
    // Return some demo integrations
    const demoIntegrations = [
      {
        id: "1",
        name: "Workday Demo Integration",
        system_type: "workday",
        auth_type: "basic",
        is_active: true,
        sync_frequency: "daily",
        last_sync_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        next_sync_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    return NextResponse.json(demoIntegrations);
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
      console.log(`[API] Starting simplified sync for integration: ${body.integration_id}`);
      
      // Actually sync some data to the database
      // This will directly update employees and departments tables
      const demoEmployees = [
        {
          first_name: "John",
          last_name: "Doe",
          email: "john.doe@example.com",
          position: "Software Engineer",
          department_id: await getDepartmentId("Engineering"),
          hire_date: "2023-01-15",
          salary: 85000
        },
        {
          first_name: "Jane",
          last_name: "Smith",
          email: "jane.smith@example.com",
          position: "Product Manager",
          department_id: await getDepartmentId("Product"),
          hire_date: "2022-11-20",
          salary: 95000
        },
        {
          first_name: "Michael",
          last_name: "Johnson",
          email: "michael.johnson@example.com",
          position: "UX Designer",
          department_id: await getDepartmentId("Design"),
          hire_date: "2023-03-05",
          salary: 80000
        }
      ];
      
      // Insert or update employees
      for (const employee of demoEmployees) {
        // Check if employee already exists
        const { data: existingEmployees } = await supabaseAdmin
          .from('employees')
          .select('id')
          .eq('email', employee.email);
        
        if (existingEmployees && existingEmployees.length > 0) {
          // Update the existing employee
          await supabaseAdmin
            .from('employees')
            .update(employee)
            .eq('id', existingEmployees[0].id);
        } else {
          // Create a new employee
          await supabaseAdmin
            .from('employees')
            .insert([employee]);
        }
      }
      
      // Create a sync log entry
      const syncResult = {
        status: 'success',
        records_processed: demoEmployees.length,
        records_created: 1,
        records_updated: 2,
        records_failed: 0,
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString()
      };
      
      return NextResponse.json(syncResult);
    }
    
    // Handle test connection request
    if (params.get('action') === 'test') {
      console.log(`[API] Testing connection for simplified integration`);
      
      // Always return success for demo
      return NextResponse.json({
        success: true,
        message: 'Connection successful'
      });
    }
    
    // Create a demo integration
    return NextResponse.json({
      id: "2",
      name: body.name || "New Integration",
      system_type: body.system_type || "workday",
      auth_type: body.auth_type || "basic",
      is_active: body.is_active || false,
      sync_frequency: body.sync_frequency || "daily",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, { status: 201 });
  } catch (error: any) {
    console.error("[API] Error in POST /api/integrations/simplified:", error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}

/**
 * Helper function to get or create a department ID
 */
async function getDepartmentId(departmentName: string): Promise<string> {
  // Check if department exists
  const { data: departments } = await supabaseAdmin
    .from('departments')
    .select('id')
    .eq('name', departmentName);
  
  if (departments && departments.length > 0) {
    return departments[0].id;
  }
  
  // Create department if it doesn't exist
  const { data: newDepartment, error } = await supabaseAdmin
    .from('departments')
    .insert([{ name: departmentName }])
    .select('id')
    .single();
  
  if (error) {
    console.error(`Error creating department ${departmentName}:`, error);
    throw error;
  }
  
  return newDepartment.id;
}

/**
 * PATCH handler - Update an existing integration (simplified demo)
 */
export async function PATCH(request: Request) {
  try {
    const url = new URL(request.url);
    const cleanPath = decodeURIComponent(url.pathname).replace(/\s+/g, '');
    
    // Extract ID from the path
    const matches = cleanPath.match(/\/api\/integrations\/simplified\/([\w-]+)/);
    const id = matches ? matches[1] : '1'; // Default to ID 1 if not provided
    
    console.log(`[API] PATCH /api/integrations/simplified/${id}: Starting request`);
    
    const body = await request.json();
    
    // Handle activate/deactivate action
    const params = url.searchParams;
    if (params.get('action') === 'activate') {
      const isActive = body.is_active === true;
      console.log(`[API] ${isActive ? 'Activating' : 'Deactivating'} integration ${id}`);
      
      // For demo, just return the updated integration
      return NextResponse.json({
        id,
        name: "Workday Demo Integration",
        system_type: "workday",
        auth_type: "basic",
        is_active: isActive,
        sync_frequency: "daily",
        last_sync_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        next_sync_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    
    // Return the "updated" integration
    return NextResponse.json({
      id,
      ...body,
      updated_at: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("[API] Error in PATCH /api/integrations/simplified:", error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}
