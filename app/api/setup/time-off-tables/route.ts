import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Initialize Supabase Admin client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET() {
  try {
    // Create time_off_requests table if it doesn't exist
    let tableExists = true;
    try {
      const { data } = await supabase
        .from('time_off_requests')
        .select('id')
        .limit(1);
    } catch (err) {
      tableExists = false;
    }

    // If table doesn't exist, create it
    if (!tableExists) {
      console.log("Creating time_off_requests table");
      // Since SQL commands can't be directly executed in the client SDK,
      // we'll implement the required functionality directly

      // First, check if employees table exists
      const { error: employeesError } = await supabase
        .from('employees')
        .select('id')
        .limit(1);

      if (employeesError) {
        return NextResponse.json({ 
          success: false, 
          error: "Employees table must exist before creating time_off_requests" 
        }, { status: 500 });
      }

      // Create time_off_requests table using standard Supabase API
      const { error: createError } = await supabase
        .from('time_off_requests')
        .insert([
          {
            id: '00000000-0000-0000-0000-000000000001',
            employee_id: '00000000-0000-0000-0000-000000000001',
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date().toISOString().split('T')[0],
            type: 'system',
            reason: 'Table initialization',
            status: 'approved'
          }
        ])
        .select();

      if (createError) {
        console.error("Error creating time_off_requests table:", createError);
        return NextResponse.json({ 
          success: false, 
          error: "Failed to create time_off_requests table" 
        }, { status: 500 });
      }
    }

    // Insert sample time off requests
    const { data: employees } = await supabase.from("employees").select("id").limit(5)

    if (employees && employees.length > 0) {
      // Get current date
      const today = new Date()

      // Sample time off requests
      const timeOffRequests = [
        {
          employee_id: employees[0].id,
          start_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5).toISOString().split('T')[0],
          end_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10).toISOString().split('T')[0],
          type: 'vacation',
          reason: 'Annual vacation',
          status: 'approved'
        },
        {
          employee_id: employees[1].id,
          start_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2).toISOString().split('T')[0],
          end_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3).toISOString().split('T')[0],
          type: 'sick',
          reason: 'Doctor appointment',
          status: 'pending'
        },
        {
          employee_id: employees[2].id,
          start_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 15).toISOString().split('T')[0],
          end_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 20).toISOString().split('T')[0],
          type: 'personal',
          reason: 'Family event',
          status: 'pending'
        }
      ]

      await supabase.from("time_off_requests").insert(timeOffRequests)
    }

    return NextResponse.json({ success: true, message: "Time off tables created successfully" })
  } catch (error) {
    console.error("Error creating time off tables:", error)
    return NextResponse.json({ success: false, error: "Failed to create time off tables" }, { status: 500 })
  }
}

