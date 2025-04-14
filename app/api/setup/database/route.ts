import { NextResponse } from "next/server"
// import { createClient } from "@supabase/supabase-js" // Removed local client import
import { supabaseAdmin } from "@/lib/supabase"; // Import shared admin client

// const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!) // Removed local client definition

export async function POST() {
  try {
    // Check if the shared admin client is available
    if (!supabaseAdmin) {
      console.error("Database setup error: Supabase admin client is not available.");
      return NextResponse.json({ error: "Server configuration error: Supabase client not initialized" }, { status: 500 });
    }

    // Create user_profiles table if it doesn't exist
    const { error: profilesError } = await supabaseAdmin.rpc("create_table_if_not_exists", {
      table_name: "user_profiles",
      columns: `
        id uuid primary key default uuid_generate_v4(),
        user_id uuid references auth.users(id) not null,
        email text not null,
        name text,
        role text not null,
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now()
      `,
    })

    if (profilesError) throw profilesError

    // Create employees table if it doesn't exist
    const { error: employeesError } = await supabaseAdmin.rpc("create_table_if_not_exists", {
      table_name: "employees",
      columns: `
        id uuid primary key default uuid_generate_v4(),
        name text not null,
        email text not null,
        position text,
        department text,
        status text default 'active',
        hire_date date,
        skills jsonb default '[]'::jsonb,
        performance_reviews jsonb default '[]'::jsonb,
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now()
      `,
    })

    if (employeesError) throw employeesError

    // Create departments table if it doesn't exist
    const { error: departmentsError } = await supabaseAdmin.rpc("create_table_if_not_exists", {
      table_name: "departments",
      columns: `
        id uuid primary key default uuid_generate_v4(),
        name text not null,
        description text,
        manager_id uuid references employees(id),
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now()
      `,
    })

    if (departmentsError) throw departmentsError

    // Create positions table if it doesn't exist
    const { error: positionsError } = await supabaseAdmin.rpc("create_table_if_not_exists", {
      table_name: "positions",
      columns: `
        id uuid primary key default uuid_generate_v4(),
        title text not null,
        department_id uuid references departments(id),
        description text,
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now()
      `,
    })

    if (positionsError) throw positionsError

    // Create time_off table if it doesn't exist
    const { error: timeOffError } = await supabaseAdmin.rpc("create_table_if_not_exists", {
      table_name: "time_off",
      columns: `
        id uuid primary key default uuid_generate_v4(),
        employee_id uuid references employees(id) not null,
        start_date date not null,
        end_date date not null,
        type text not null,
        status text default 'pending',
        notes text,
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now()
      `,
    })

    if (timeOffError) throw timeOffError

    // Create the create_table_if_not_exists function if it doesn't exist
    const { error: functionError } = await supabaseAdmin.rpc("create_function_if_not_exists", {
      function_name: "create_table_if_not_exists",
      function_definition: `
        CREATE OR REPLACE FUNCTION create_table_if_not_exists(
          table_name text,
          columns text
        ) RETURNS void AS $$
        BEGIN
          EXECUTE format('
            CREATE TABLE IF NOT EXISTS %I (
              %s
            );
          ', table_name, columns);
        END;
        $$ LANGUAGE plpgsql;
      `,
    })

    if (functionError) throw functionError

    return NextResponse.json({
      success: true,
      message: "Database tables created successfully",
    })
  } catch (error) {
    console.error("Database setup error:", error)
    return NextResponse.json({ error: "Failed to set up database tables" }, { status: 500 })
  }
}

