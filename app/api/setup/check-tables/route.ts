import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Method 1: Use the from() method to query information_schema
    try {
      const { data, error } = await supabase
        .from("information_schema.columns")
        .select("column_name, data_type")
        .eq("table_name", "employees")
        .eq("table_schema", "public")

      if (!error && data) {
        return NextResponse.json({ columns: data })
      }
    } catch (err) {
      console.log("Method 1 failed:", err)
    }

    // Method 2: Use the REST API directly
    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/information_schema/columns?select=column_name,data_type&table_name=eq.employees&table_schema=eq.public`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        },
      )

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json({ columns: data })
      }
    } catch (err) {
      console.log("Method 2 failed:", err)
    }

    // Method 3: Use a simpler approach - just list the employees table
    try {
      const { data, error } = await supabase.from("employees").select("*").limit(1)

      if (!error) {
        // If we can query the table, extract column names from the first row
        const columns = data && data.length > 0 ? Object.keys(data[0]).map((column) => ({ column_name: column })) : []

        return NextResponse.json({
          columns,
          message: "Retrieved column names from sample data",
        })
      }
    } catch (err) {
      console.log("Method 3 failed:", err)
    }

    // If all methods fail, return a generic error
    return NextResponse.json({ error: "Could not retrieve table structure information" }, { status: 500 })
  } catch (error: any) {
    console.error("Error checking tables:", error)
    return NextResponse.json({ error: `Error checking tables: ${error.message}` }, { status: 500 })
  }
}

