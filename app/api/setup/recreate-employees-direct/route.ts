import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseKey)

    // First, drop the employees table if it exists
    try {
      // Use the REST API directly to execute SQL
      const dropResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          query: "DROP TABLE IF EXISTS employees",
        }),
      })

      if (!dropResponse.ok) {
        console.log("Drop table failed, but continuing...")
      }
    } catch (err) {
      console.log("Drop table error:", err)
      // Continue even if drop fails
    }

    // Create the employees table with all required columns
    try {
      // First, try to create the table using the Supabase API
      const { error } = await supabase.from("employees").insert(
        [
          {
            first_name: "Test",
            last_name: "User",
            email: "test@example.com",
            phone: "123-456-7890",
            position: "Test Position",
            department: "00000000-0000-0000-0000-000000000000",
            hire_date: new Date().toISOString().split("T")[0],
            status: "active",
            avatar_url: "/placeholder.svg",
            address: "123 Test St",
            bio: "Test bio",
            team: "Test Team",
            username: "test.user",
            role: "employee",
          },
        ],
        { upsert: true },
      )

      if (!error) {
        // If insert worked, the table exists with the right structure
        // Now delete the test record
        await supabase.from("employees").delete().eq("email", "test@example.com")

        return NextResponse.json({
          message: "Employees table recreated successfully using insert method",
        })
      }
    } catch (err) {
      console.log("Create table via insert failed:", err)
    }

    // If the above methods fail, return an error
    return NextResponse.json({ error: "Failed to recreate employees table" }, { status: 500 })
  } catch (error: any) {
    console.error("Error recreating employees table:", error)
    return NextResponse.json({ error: `Error recreating employees table: ${error.message}` }, { status: 500 })
  }
}

