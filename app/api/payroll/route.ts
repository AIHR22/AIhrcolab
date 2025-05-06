import { NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const employeeId = url.searchParams.get('employeeId');

    let query = supabaseAdmin
      .from("payroll")
      .select("*, employees(id, first_name, last_name)")
      .order("payment_date", { ascending: false });
    
    // Filter by employee_id if provided
    if (employeeId) {
      query = query.eq("employee_id", employeeId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching payroll:", error);
    return NextResponse.json({ error: "Error fetching payroll entries" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.employee_id || !body.payment_date || !body.base_salary) {
      return NextResponse.json(
        { error: "Employee ID, payment date, and base salary are required" },
        { status: 400 }
      );
    }

    // Create payroll data with required and optional fields
    const payrollData = {
      employee_id: body.employee_id,
      payment_date: body.payment_date,
      base_salary: body.base_salary,
      bonus: body.bonus || 0,
      overtime_pay: body.overtime_pay || 0,
      deductions: body.deductions || 0,
      tax_withholding: body.tax_withholding || 0,
      payment_method: body.payment_method || "direct_deposit",
      status: body.status || "processed",
      notes: body.notes || ""
    };

    const { data, error } = await supabaseAdmin
      .from("payroll")
      .insert(payrollData)
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error: any) {
    console.error("Error creating payroll entry:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}