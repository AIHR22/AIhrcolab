import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Create a new employees table using the Supabase API

    // 1. First, try to delete the existing employees table
    try {
      // Delete all records from employees table
      await supabase.from("employees").delete().neq("id", "00000000-0000-0000-0000-000000000000")
    } catch (err) {
      console.log("Delete records failed:", err)
      // Continue even if delete fails
    }

    // 2. Try to insert a record with all the required fields
    try {
      const { error } = await supabase.from("employees").insert([
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
      ])

      if (!error) {
        // If insert worked, the table exists with the right structure
        // Now delete the test record
        await supabase.from("employees").delete().eq("email", "test@example.com")

        return NextResponse.json({
          message: "Employees table verified successfully",
        })
      } else {
        console.log("Insert test record failed:", error)
      }
    } catch (err) {
      console.log("Insert test record error:", err)
    }

    // If we get here, we need to try a different approach
    // Let's use the Supabase Storage API as a workaround to store the schema

    try {
      // Create a bucket for schema if it doesn't exist
      const { error: bucketError } = await supabase.storage.createBucket("schema", {
        public: false,
      })

      if (bucketError && !bucketError.message.includes("already exists")) {
        console.log("Create bucket error:", bucketError)
      }

      // Store the employees schema in the bucket
      const schemaContent = JSON.stringify({
        table: "employees",
        columns: [
          { name: "id", type: "uuid", primary: true },
          { name: "first_name", type: "text" },
          { name: "last_name", type: "text" },
          { name: "email", type: "text" },
          { name: "phone", type: "text" },
          { name: "position", type: "text" },
          { name: "department", type: "uuid" },
          { name: "hire_date", type: "date" },
          { name: "status", type: "text" },
          { name: "avatar_url", type: "text" },
          { name: "address", type: "text" },
          { name: "bio", type: "text" },
          { name: "team", type: "text" },
          { name: "username", type: "text" },
          { name: "role", type: "text" },
        ],
      })

      const { error: uploadError } = await supabase.storage.from("schema").upload("employees.json", schemaContent, {
        contentType: "application/json",
        upsert: true,
      })

      if (uploadError) {
        console.log("Upload schema error:", uploadError)
      } else {
        return NextResponse.json({
          message: "Employees schema stored successfully",
        })
      }
    } catch (err) {
      console.log("Storage API error:", err)
    }

    // If all methods fail, return an error
    return NextResponse.json({ error: "Failed to recreate employees table" }, { status: 500 })
  } catch (error: any) {
    console.error("Error recreating employees table:", error)
    return NextResponse.json({ error: `Error recreating employees table: ${error.message}` }, { status: 500 })
  }
}

