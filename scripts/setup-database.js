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
    // Enable UUID extension if not already enabled
    console.log("Enabling UUID extension...")
    await supabase.rpc("create_extension_if_not_exists", { extension_name: "uuid-ossp" })

    // Create tables using SQL queries directly

    // Employees table
    console.log("Creating employees table...")
    await supabase.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        position TEXT NOT NULL,
        department TEXT NOT NULL,
        avatar_url TEXT,
        start_date DATE NOT NULL,
        manager_id UUID REFERENCES employees(id),
        salary INTEGER NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'on_leave')) DEFAULT 'active'
      )
    `)

    // Time off requests table
    console.log("Creating time_off_requests table...")
    await supabase.query(`
      CREATE TABLE IF NOT EXISTS time_off_requests (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        employee_id UUID NOT NULL REFERENCES employees(id),
        type TEXT NOT NULL CHECK (type IN ('vacation', 'sick', 'personal', 'other')),
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
        notes TEXT
      )
    `)

    // Reviews table
    console.log("Creating reviews table...")
    await supabase.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        employee_id UUID NOT NULL REFERENCES employees(id),
        reviewer_id UUID NOT NULL REFERENCES employees(id),
        review_type TEXT NOT NULL CHECK (review_type IN ('performance', 'probation', 'salary')),
        scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
        notes TEXT
      )
    `)

    // Projects table
    console.log("Creating projects table...")
    await supabase.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        name TEXT NOT NULL,
        description TEXT,
        start_date DATE NOT NULL,
        end_date DATE,
        status TEXT NOT NULL CHECK (status IN ('planning', 'in_progress', 'completed', 'on_hold')) DEFAULT 'planning',
        budget INTEGER
      )
    `)

    // Project members table
    console.log("Creating project_members table...")
    await supabase.query(`
      CREATE TABLE IF NOT EXISTS project_members (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        project_id UUID NOT NULL REFERENCES projects(id),
        employee_id UUID NOT NULL REFERENCES employees(id),
        role TEXT NOT NULL
      )
    `)

    // Company settings table
    console.log("Creating company_settings table...")
    await supabase.query(`
      CREATE TABLE IF NOT EXISTS company_settings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        name TEXT NOT NULL,
        logo_url TEXT,
        primary_color TEXT,
        secondary_color TEXT,
        address TEXT,
        phone TEXT,
        email TEXT,
        website TEXT
      )
    `)

    console.log("Database schema setup completed successfully!")
  } catch (error) {
    console.error("Error setting up database schema:", error)
  }
}

setupDatabase()

