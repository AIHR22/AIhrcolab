import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST() {
  try {
    console.log("Starting database initialization...")

    // Check if profiles table exists
    const { error: profilesCheckError } = await supabaseAdmin
      .from("profiles")
      .select("count(*)", { count: "exact", head: true })

    if (profilesCheckError) {
      console.log("Profiles table does not exist, skipping initialization")

      return NextResponse.json({
        success: false,
        message: "Database tables not initialized. Please run the SQL script first.",
      })
    }

    console.log("Database tables already exist")

    return NextResponse.json({
      success: true,
      message: "Database tables verified",
    })
  } catch (error) {
    console.error("Database initialization error:", error)
    return NextResponse.json({ error: "Failed to initialize database", details: error }, { status: 500 })
  }
}

