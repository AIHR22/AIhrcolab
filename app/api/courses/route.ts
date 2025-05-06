import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const { data: courses, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(courses)
  } catch (error) {
    return NextResponse.json({ error: "Error fetching courses" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError) throw userError

    const json = await request.json()

    const { data: course, error } = await supabase
      .from("courses")
      .insert({
        ...json,
        created_by: user?.id,
        status: "active",
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(course)
  } catch (error) {
    return NextResponse.json({ error: "Error creating course" }, { status: 500 })
  }
}

