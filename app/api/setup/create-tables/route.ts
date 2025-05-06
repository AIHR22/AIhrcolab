import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Drop the employees table if it exists to ensure we create it with the correct structure
    await supabase.query(`DROP TABLE IF EXISTS employees CASCADE`)

    // Create employees table with all required columns
    const { error: employeesError } = await supabase.query(`
      CREATE TABLE employees (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name TEXT,
        last_name TEXT,
        email TEXT UNIQUE,
        phone TEXT,
        position TEXT,
        department TEXT,
        hire_date DATE,
        status TEXT DEFAULT 'onboarding',
        manager_id UUID NULL,
        avatar_url TEXT,
        address TEXT,
        bio TEXT,
        team TEXT,
        username TEXT,
        role TEXT DEFAULT 'employee',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)

    if (employeesError) {
      throw new Error(`Error creating employees table: ${employeesError.message}`)
    }

    // Create departments table
    const { error: departmentsError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)

    if (departmentsError) {
      throw new Error(`Error creating departments table: ${departmentsError.message}`)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error creating tables:", error)
    return NextResponse.json({ error: `Error creating tables: ${error.message}` }, { status: 500 })
  }
}

