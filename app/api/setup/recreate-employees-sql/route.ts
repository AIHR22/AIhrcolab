import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    // First, check if the exec function exists
    const { data: functions, error: funcError } = await supabase
      .from("pg_proc")
      .select("proname")
      .eq("proname", "exec")
      .limit(1)

    if (funcError) {
      console.log("Error checking for exec function:", funcError)
    }

    // If the exec function doesn't exist, create it
    if (!functions || functions.length === 0) {
      console.log("Creating exec function...")

      // Create the exec function
      const { error: createFuncError } = await supabase.auth.admin.executeRaw(`
        CREATE OR REPLACE FUNCTION exec(query text)
        RETURNS void AS $$
        BEGIN
          EXECUTE query;
        END;
        $$ LANGUAGE plpgsql;
      `)

      if (createFuncError) {
        throw new Error(`Error creating exec function: ${createFuncError.message}`)
      }
    }

    // Now use the function to drop and recreate the employees table
    const { error: dropError } = await supabase.auth.admin.executeRaw("DROP TABLE IF EXISTS employees CASCADE")

    if (dropError) {
      throw new Error(`Error dropping employees table: ${dropError.message}`)
    }

    const { error: createError } = await supabase.auth.admin.executeRaw(`
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

    if (createError) {
      throw new Error(`Error creating employees table: ${createError.message}`)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error recreating employees table:", error)
    return NextResponse.json({ error: `Error recreating employees table: ${error.message}` }, { status: 500 })
  }
}

