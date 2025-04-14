import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  console.log("Setting up database schema...")

  try {
    // Create tables

    // Employees table
    console.log("Creating employees table...")
    const { error: employeesError } = await supabase.rpc("create_table_if_not_exists", {
      table_name: "employees",
      columns: `
        id uuid primary key default uuid_generate_v4(),
        created_at timestamp with time zone default now(),
        name text not null,
        email text not null unique,
        position text not null,
        department text not null,
        avatar_url text,
        start_date date not null,
        manager_id uuid references employees(id),
        salary integer not null,
        status text not null check (status in ('active', 'inactive', 'on_leave')) default 'active'
      `,
    })

    if (employeesError) {
      console.error("Error creating employees table:", employeesError)
    }

    // Time off requests table
    console.log("Creating time_off_requests table...")
    const { error: timeOffError } = await supabase.rpc("create_table_if_not_exists", {
      table_name: "time_off_requests",
      columns: `
        id uuid primary key default uuid_generate_v4(),
        created_at timestamp with time zone default now(),
        employee_id uuid not null references employees(id),
        type text not null check (type in ('vacation', 'sick', 'personal', 'other')),
        start_date date not null,
        end_date date not null,
        status text not null check (status in ('pending', 'approved', 'rejected')) default 'pending',
        notes text
      `,
    })

    if (timeOffError) {
      console.error("Error creating time_off_requests table:", timeOffError)
    }

    // Reviews table
    console.log("Creating reviews table...")
    const { error: reviewsError } = await supabase.rpc("create_table_if_not_exists", {
      table_name: "reviews",
      columns: `
        id uuid primary key default uuid_generate_v4(),
        created_at timestamp with time zone default now(),
        employee_id uuid not null references employees(id),
        reviewer_id uuid not null references employees(id),
        review_type text not null check (review_type in ('performance', 'probation', 'salary')),
        scheduled_date timestamp with time zone not null,
        status text not null check (status in ('scheduled', 'completed', 'cancelled')) default 'scheduled',
        notes text
      `,
    })

    if (reviewsError) {
      console.error("Error creating reviews table:", reviewsError)
    }

    // Projects table
    console.log("Creating projects table...")
    const { error: projectsError } = await supabase.rpc("create_table_if_not_exists", {
      table_name: "projects",
      columns: `
        id uuid primary key default uuid_generate_v4(),
        created_at timestamp with time zone default now(),
        name text not null,
        description text,
        start_date date not null,
        end_date date,
        status text not null check (status in ('planning', 'in_progress', 'completed', 'on_hold')) default 'planning',
        budget integer
      `,
    })

    if (projectsError) {
      console.error("Error creating projects table:", projectsError)
    }

    // Project members table
    console.log("Creating project_members table...")
    const { error: projectMembersError } = await supabase.rpc("create_table_if_not_exists", {
      table_name: "project_members",
      columns: `
        id uuid primary key default uuid_generate_v4(),
        created_at timestamp with time zone default now(),
        project_id uuid not null references projects(id),
        employee_id uuid not null references employees(id),
        role text not null
      `,
    })

    if (projectMembersError) {
      console.error("Error creating project_members table:", projectMembersError)
    }

    // Company settings table
    console.log("Creating company_settings table...")
    const { error: settingsError } = await supabase.rpc("create_table_if_not_exists", {
      table_name: "company_settings",
      columns: `
        id uuid primary key default uuid_generate_v4(),
        created_at timestamp with time zone default now(),
        name text not null,
        logo_url text,
        primary_color text,
        secondary_color text,
        address text,
        phone text,
        email text,
        website text
      `,
    })

    if (settingsError) {
      console.error("Error creating company_settings table:", settingsError)
    }

    console.log("Database schema setup completed!")
  } catch (error) {
    console.error("Error setting up database schema:", error)
  }
}

setupDatabase()

