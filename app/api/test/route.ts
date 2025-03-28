import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    // Test anon client
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey)
    const { data: anonData, error: anonError } = await supabaseAnon
      .from("departments")
      .select("count(*)", { count: "exact", head: true })

    // Test service role client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from("departments")
      .select("count(*)", { count: "exact", head: true })

    return NextResponse.json({
      success: true,
      environment: {
        supabaseUrl: supabaseUrl ? "Set" : "Not set",
        supabaseAnonKey: supabaseAnonKey ? "Set" : "Not set",
        supabaseServiceKey: supabaseServiceKey ? "Set" : "Not set",
      },
      anonClient: {
        error: anonError ? anonError.message : null,
        data: anonData,
      },
      adminClient: {
        error: adminError ? adminError.message : null,
        data: adminData,
      },
    })
  } catch (error) {
    console.error("Test error:", error)
    return NextResponse.json({ error: "Test failed", details: JSON.stringify(error) }, { status: 500 })
  }
}

