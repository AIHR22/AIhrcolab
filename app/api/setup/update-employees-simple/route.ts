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

    // Create a test record with all required fields
    const testRecord = {
      first_name: "Test",
      last_name: "User",
      email: `test.${Date.now()}@example.com`,
      phone: "123-456-7890",
      position: "Test Position",
      hire_date: "2023-01-01",
      address: "123 Test St",
      bio: "Test bio",
      team: "Test Team",
      username: `test.user.${Date.now()}`,
      role: "employee",
      avatar_url: "/placeholder.svg",
      status: "active",
    }

    // Try to insert the record, which will create the columns if they don't exist
    const { error: insertError } = await supabase.from("employees").insert([testRecord])

    if (insertError) {
      console.error("Error inserting test record:", insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Delete the test record
    await supabase.from("employees").delete().eq("email", testRecord.email)

    return NextResponse.json({
      message: "Employees table updated successfully",
      method: "test-record",
    })
  } catch (error: any) {
    console.error("Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

