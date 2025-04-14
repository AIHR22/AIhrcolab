import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    let query = supabaseAdmin
      .from("job_postings")
      .select(`
        *,
        departments:department_id (
          id,
          name
        )
      `)
      .order("created_at", { ascending: false })

    if (status) {
      query = query.eq("status", status)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error fetching job postings:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { data, error } = await supabaseAdmin.from("job_postings").insert(body).select()

    if (error) {
      throw error
    }

    return NextResponse.json(data[0])
  } catch (error: any) {
    console.error("Error creating job posting:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

