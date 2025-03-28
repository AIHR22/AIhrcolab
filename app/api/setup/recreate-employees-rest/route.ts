import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    // First, try to drop the table using a direct SQL query
    const dropResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        query: "DROP TABLE IF EXISTS employees CASCADE",
      }),
    })

    // Now create the table
    const createResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
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
      }),
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error recreating employees table:", error)
    return NextResponse.json({ error: `Error recreating employees table: ${error.message}` }, { status: 500 })
  }
}

