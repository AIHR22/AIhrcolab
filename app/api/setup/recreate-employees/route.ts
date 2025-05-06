import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Drop the employees table if it exists
    await supabase.rpc("exec", {
      query: "DROP TABLE IF EXISTS employees CASCADE",
    })

    // Create employees table with all required columns
    const { error } = await supabase.rpc("exec", {
      query: `
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
      `,
    })

    if (error) {
      throw new Error(`Error recreating employees table: ${error.message}`)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error recreating employees table:", error)
    return NextResponse.json({ error: `Error recreating employees table: ${error.message}` }, { status: 500 })
  }
}

