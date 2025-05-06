import { NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("employees")
      .select("*, departments(name)")
      .or(
        `first_name.ilike.%${query}%, 
         last_name.ilike.%${query}%, 
         email.ilike.%${query}%, 
         position.ilike.%${query}%`
      )
      .order("first_name")

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error searching employees:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
