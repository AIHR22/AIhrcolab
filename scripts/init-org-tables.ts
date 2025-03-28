import { supabase } from "../lib/supabase"

export async function initOrgTables() {
  console.log("Initializing organization tables...")

  // Create departments table
  const { error: deptError } = await supabase.query(`
    CREATE TABLE IF NOT EXISTS departments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      description TEXT,
      manager_id UUID,
      parent_department_id UUID REFERENCES departments(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `)

  if (deptError) {
    console.error("Error creating departments table:", deptError)
    throw deptError
  }

  // Create positions table
  const { error: posError } = await supabase.query(`
    CREATE TABLE IF NOT EXISTS positions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title TEXT NOT NULL,
      department_id UUID REFERENCES departments(id),
      level TEXT NOT NULL,
      description TEXT,
      is_manager BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `)

  if (posError) {
    console.error("Error creating positions table:", posError)
    throw posError
  }

  // Create org_structures table for storing generated org charts
  const { error: orgError } = await supabase.query(`
    CREATE TABLE IF NOT EXISTS org_structures (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      structure JSONB NOT NULL,
      is_active BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `)

  if (orgError) {
    console.error("Error creating org_structures table:", orgError)
    throw orgError
  }

  console.log("Organization tables initialized successfully")
}

