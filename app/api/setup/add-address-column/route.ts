import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if the employees table exists
    const { data: tableExists, error: checkError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_name", "employees")
      .eq("table_schema", "public")

    if (checkError) {
      throw new Error(`Error checking if table exists: ${checkError.message}`)
    }

    if (!tableExists || tableExists.length === 0) {
      throw new Error("Employees table does not exist")
    }

    // Check if the address column exists
    const { data: columnExists, error: columnError } = await supabase
      .from("information_schema.columns")
      .select("column_name")
      .eq("table_name", "employees")
      .eq("column_name", "address")
      .eq("table_schema", "public")

    if (columnError) {
      throw new Error(`Error checking if column exists: ${columnError.message}`)
    }

    // If the address column doesn't exist, add it
    if (!columnExists || columnExists.length === 0) {
      // Use the SQL API to add the column
      const { error: alterError } = await supabase.sql`
        ALTER TABLE employees ADD COLUMN IF NOT EXISTS address TEXT
      `

      if (alterError) {
        throw new Error(`Error adding address column: ${alterError.message}`)
      }
    }

    return NextResponse.json({ success: true, message: "Address column added successfully" })
  } catch (error: any) {
    console.error("Error adding address column:", error)
    return NextResponse.json({ error: `Error adding address column: ${error.message}` }, { status: 500 })
  }
}

