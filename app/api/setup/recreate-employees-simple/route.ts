import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseKey)

    // First, check if the employees table exists
    const { data: tableExists, error: checkError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_name", "employees")
      .eq("table_schema", "public")

    if (checkError) {
      console.error("Error checking if table exists:", checkError)
    }

    // If the table exists, delete all records
    if (tableExists && tableExists.length > 0) {
      const { error: deleteError } = await supabase
        .from("employees")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000") // Delete all records

      if (deleteError) {
        console.error("Error deleting records:", deleteError)
      }

      // Check if the address column exists
      const { data: columnExists, error: columnError } = await supabase
        .from("information_schema.columns")
        .select("column_name")
        .eq("table_name", "employees")
        .eq("column_name", "address")
        .eq("table_schema", "public")

      if (columnError) {
        console.error("Error checking if column exists:", columnError)
      }

      // If the address column doesn't exist, add it
      if (!columnExists || columnExists.length === 0) {
        // We need to use the REST API directly to alter the table
        const alterResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            query: "ALTER TABLE employees ADD COLUMN IF NOT EXISTS address TEXT",
          }),
        })

        if (!alterResponse.ok) {
          console.error("Error adding address column:", await alterResponse.text())
        }
      }
    } else {
      // Create the employees table from scratch using the Supabase API
      const { error: createError } = await supabase
        .from("employees")
        .insert([
          {
            first_name: "TEMPLATE",
            last_name: "USER",
            email: "template@example.com",
            phone: "+1 (555) 000-0000",
            position: "Template",
            department: "00000000-0000-0000-0000-000000000000",
            hire_date: new Date().toISOString().split("T")[0],
            status: "template",
            avatar_url: "/placeholder.svg?height=40&width=40",
            address: "Template Address",
            bio: "Template Bio",
            team: "Template Team",
            username: "template.user",
            role: "template",
          },
        ])
        .select()

      if (createError) {
        // If the table doesn't exist, we'll get an error
        // Try to create it using the REST API
        const createTableResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            query: `
              CREATE TABLE IF NOT EXISTS employees (
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

        if (!createTableResponse.ok) {
          throw new Error(`Error creating employees table: ${await createTableResponse.text()}`)
        }
      } else {
        // Delete the template user
        await supabase.from("employees").delete().eq("email", "template@example.com")
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error recreating employees table:", error)
    return NextResponse.json({ error: `Error recreating employees table: ${error.message}` }, { status: 500 })
  }
}

