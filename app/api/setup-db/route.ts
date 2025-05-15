import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

export async function GET() {
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: "Missing Supabase environment variables" }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Create employees table
    const { error: employeesError } = await supabase.rpc("create_table_if_not_exists", {
      table_name: "employees",
      table_definition: `
        id uuid primary key default uuid_generate_v4(),
        first_name text not null,
        last_name text not null,
        email text unique not null,
        department text not null,
        position text not null,
        hire_date date not null,
        manager_id uuid references employees(id),
        status text not null check (status in ('active', 'inactive', 'on_leave')),
        created_at timestamp with time zone default now()
      `,
    })

    if (employeesError) {
      return NextResponse.json({ error: `Error creating employees table: ${employeesError.message}` }, { status: 500 })
    }

    // Create time_off_requests table
    const { error: timeOffError } = await supabase.rpc("create_table_if_not_exists", {
      table_name: "time_off_requests",
      table_definition: `
        id uuid primary key default uuid_generate_v4(),
        employee_id uuid references employees(id) not null,
        start_date date not null,
        end_date date not null,
        reason text not null,
        status text not null check (status in ('pending', 'approved', 'rejected')),
        created_at timestamp with time zone default now()
      `,
    })

    if (timeOffError) {
      return NextResponse.json(
        { error: `Error creating time_off_requests table: ${timeOffError.message}` },
        { status: 500 },
      )
    }

    // Create reviews table
    const { error: reviewsError } = await supabase.rpc("create_table_if_not_exists", {
      table_name: "reviews",
      table_definition: `
        id uuid primary key default uuid_generate_v4(),
        employee_id uuid references employees(id) not null,
        reviewer_id uuid references employees(id) not null,
        review_date date not null,
        performance_score integer not null check (performance_score between 1 and 5),
        comments text,
        created_at timestamp with time zone default now()
      `,
    })

    if (reviewsError) {
      return NextResponse.json({ error: `Error creating reviews table: ${reviewsError.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Database tables created successfully" })
  } catch (error) {
    return NextResponse.json({ error: `Error initializing database: ${error}` }, { status: 500 })
  }
}

