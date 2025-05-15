import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    })

    // Get the current table structure
    const { data: columns, error: columnsError } = await supabase.from("employees").select("*").limit(1).single()

    if (columnsError && columnsError.code !== "PGRST116") {
      // PGRST116 means no rows found, which is fine
      console.error("Error getting table structure:", columnsError)
      return NextResponse.json({ error: columnsError.message }, { status: 500 })
    }

    // Define the columns we need
    const requiredColumns = ["address", "bio", "team", "username", "role", "avatar_url", "status"]

    // Check which columns are missing
    const existingColumns = columns ? Object.keys(columns) : []
    const missingColumns = requiredColumns.filter((col) => !existingColumns.includes(col))

    if (missingColumns.length === 0) {
      return NextResponse.json({ message: "Employees table already has all required columns" })
    }

    // Use direct REST API call to execute SQL
    const sqlQuery = `
      ALTER TABLE employees
      ${missingColumns.map((col) => `ADD COLUMN IF NOT EXISTS ${col} TEXT`).join(",\n")}
    `

    // Make a direct fetch request to the Supabase REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        query: sqlQuery,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error executing SQL:", errorText)

      // Alternative approach: Try to add columns one by one using a test record
      console.log("Trying alternative approach...")

      // Create a test record with all required fields
      const testRecord = {
        first_name: "Test",
        last_name: "User",
        email: `test.${Date.now()}@example.com`,
        phone: "123-456-7890",
        position: "Test Position",
        hire_date: "2023-01-01",
      }

      // Add all the missing columns to the test record
      missingColumns.forEach((col) => {
        testRecord[col] = col === "avatar_url" ? "/placeholder.svg" : "Test " + col
      })

      // Try to insert the record, which will create the columns
      const { error: insertError } = await supabase.from("employees").insert([testRecord])

      if (insertError) {
        console.error("Error with alternative approach:", insertError)
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }

      // Delete the test record
      await supabase.from("employees").delete().eq("email", testRecord.email)

      return NextResponse.json({
        message: "Employees table updated successfully using alternative approach",
        columns: missingColumns,
      })
    }

    return NextResponse.json({
      message: "Employees table updated successfully",
      columns: missingColumns,
    })
  } catch (error: any) {
    console.error("Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

