import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Use the service role key for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: Request) {
  try {
    const { userId, email, name, role } = await request.json()

    if (!userId || !email) {
      return NextResponse.json({ error: "User ID and email are required" }, { status: 400 })
    }

    // Check if profiles table exists
    const { error: tableCheckError } = await supabaseAdmin
      .from("profiles")
      .select("count(*)", { count: "exact", head: true })

    if (tableCheckError) {
      console.error("Profiles table does not exist:", tableCheckError)
      return NextResponse.json(
        { error: "Profiles table does not exist. Please run the setup SQL script first." },
        { status: 500 },
      )
    }

    // Insert the user profile
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .insert({
        user_id: userId,
        email,
        full_name: name || email.split("@")[0],
        role: role || "user",
      })
      .select()

    if (error) {
      console.error("Error creating user profile:", error)
      return NextResponse.json({ error: "Failed to create user profile", details: error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "User profile created successfully",
      profile: data,
    })
  } catch (error) {
    console.error("Unexpected error in create-profile:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

