import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if the employees table exists
    const { error: checkError } = await supabase.from("employees").select("id").limit(1)

    if (checkError && checkError.code === "42P01") {
      // Table doesn't exist, create it with all columns
      const { error } = await supabase.query(`
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

      if (error) {
        throw new Error(`Error creating employees table: ${error.message}`)
      }
    } else {
      // Table exists, check if address column exists
      try {
        // Try to select the address column
        await supabase.from("employees").select("address").limit(1)
      } catch (error: any) {
        // If error, add the address column
        await supabase.query(`
          ALTER TABLE employees 
          ADD COLUMN IF NOT EXISTS address TEXT
        `)
      }

      // Check for other required columns and add them if missing
      const requiredColumns = [
        "first_name",
        "last_name",
        "email",
        "phone",
        "position",
        "department",
        "hire_date",
        "status",
        "manager_id",
        "avatar_url",
        "bio",
        "team",
        "username",
        "role",
        "created_at",
        "updated_at",
      ]

      for (const column of requiredColumns) {
        try {
          // Try to select each column
          await supabase.from("employees").select(column).limit(1)
        } catch (error: any) {
          // If error, add the column
          await supabase.query(`
            ALTER TABLE employees 
            ADD COLUMN IF NOT EXISTS ${column} TEXT
          `)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error fixing employees table:", error)
    return NextResponse.json({ error: `Error fixing employees table: ${error.message}` }, { status: 500 })
  }
}

