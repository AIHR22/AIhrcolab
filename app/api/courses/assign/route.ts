import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const json = await request.json()
    const { courseId, employeeIds } = json

    // Create enrollments for each employee
    const enrollments = employeeIds.map((employeeId) => ({
      course_id: courseId,
      employee_id: employeeId,
      status: "enrolled",
      progress: 0,
    }))

    const { error } = await supabase.from("course_enrollments").insert(enrollments)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Error assigning course" }, { status: 500 })
  }
}

