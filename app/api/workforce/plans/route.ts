import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import type { WorkforcePlan, SkillRequirement } from "@/types/workforce-components"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    if (!supabaseAdmin) {
      throw new Error("Supabase client not initialized")
    }

    const { data, error } = await supabaseAdmin
      .from("workforce_plans")
      .select(`
        *,
        department:departments (
          id,
          name
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[API] Error fetching workforce plans:", error)
      throw error
    }

    return NextResponse.json(data || [], {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error: any) {
    console.error("[API] Error in GET /api/workforce/plans:", error)
    return NextResponse.json({
      error: error.message,
      details: error.details || error.hint || null,
      code: error.code || null
    }, {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      throw new Error("Supabase client not initialized")
    }

    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.department_id || !body.start_date || !body.end_date) {
      return NextResponse.json({
        error: "Missing required fields: name, department_id, start_date, end_date"
      }, {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Create the workforce plan
    const { data: plan, error: planError } = await supabaseAdmin
      .from("workforce_plans")
      .insert([{
        name: body.name,
        description: body.description,
        department_id: body.department_id,
        start_date: body.start_date,
        end_date: body.end_date,
        status: "draft",
        required_skills: body.required_skills || []
      }])
      .select()
      .single()

    if (planError) {
      console.error("[API] Error creating workforce plan:", planError)
      throw planError
    }

    // If there are required skills, create them
    if (body.required_skills && body.required_skills.length > 0) {
      const skillRequirements = body.required_skills.map((skill: SkillRequirement) => ({
        plan_id: plan.id,
        skill_id: skill.skill_id,
        required_level: skill.required_level,
        required_count: skill.required_count
      }))

      const { error: skillError } = await supabaseAdmin
        .from("workforce_plan_skills")
        .insert(skillRequirements)

      if (skillError) {
        console.error("[API] Error creating skill requirements:", skillError)
        throw skillError
      }
    }

    return NextResponse.json(plan, {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error: any) {
    console.error("[API] Error in POST /api/workforce/plans:", error)
    return NextResponse.json({
      error: error.message,
      details: error.details || error.hint || null,
      code: error.code || null
    }, {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function PUT(request: Request) {
  try {
    if (!supabaseAdmin) {
      throw new Error("Supabase client not initialized")
    }

    const body = await request.json()

    // Validate required fields
    if (!body.id) {
      return NextResponse.json({
        error: "Missing required field: id"
      }, {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Update the workforce plan
    const { data: plan, error: planError } = await supabaseAdmin
      .from("workforce_plans")
      .update({
        name: body.name,
        description: body.description,
        department_id: body.department_id,
        start_date: body.start_date,
        end_date: body.end_date,
        status: body.status,
        required_skills: body.required_skills || [],
        updated_at: new Date().toISOString()
      })
      .eq("id", body.id)
      .select()
      .single()

    if (planError) {
      console.error("[API] Error updating workforce plan:", planError)
      throw planError
    }

    // If there are required skills, update them
    if (body.required_skills && body.required_skills.length > 0) {
      // First delete existing skill requirements
      const { error: deleteError } = await supabaseAdmin
        .from("workforce_plan_skills")
        .delete()
        .eq("plan_id", body.id)

      if (deleteError) {
        console.error("[API] Error deleting existing skill requirements:", deleteError)
        throw deleteError
      }

      // Then insert new skill requirements
      const skillRequirements = body.required_skills.map((skill: SkillRequirement) => ({
        plan_id: plan.id,
        skill_id: skill.skill_id,
        required_level: skill.required_level,
        required_count: skill.required_count
      }))

      const { error: skillError } = await supabaseAdmin
        .from("workforce_plan_skills")
        .insert(skillRequirements)

      if (skillError) {
        console.error("[API] Error updating skill requirements:", skillError)
        throw skillError
      }
    }

    return NextResponse.json(plan, {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error: any) {
    console.error("[API] Error in PUT /api/workforce/plans:", error)
    return NextResponse.json({
      error: error.message,
      details: error.details || error.hint || null,
      code: error.code || null
    }, {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function DELETE(request: Request) {
  try {
    if (!supabaseAdmin) {
      throw new Error("Supabase client not initialized")
    }

    const url = new URL(request.url)
    const id = url.searchParams.get("id")

    if (!id) {
      return NextResponse.json({
        error: "Missing required query parameter: id"
      }, {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // First delete all related records
    const { error: skillError } = await supabaseAdmin
      .from("workforce_plan_skills")
      .delete()
      .eq("plan_id", id)

    if (skillError) {
      console.error("[API] Error deleting skill requirements:", skillError)
      throw skillError
    }

    // Then delete the plan
    const { error: planError } = await supabaseAdmin
      .from("workforce_plans")
      .delete()
      .eq("id", id)

    if (planError) {
      console.error("[API] Error deleting workforce plan:", planError)
      throw planError
    }

    return NextResponse.json({
      success: true,
      message: "Workforce plan deleted successfully"
    }, {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error: any) {
    console.error("[API] Error in DELETE /api/workforce/plans:", error)
    return NextResponse.json({
      error: error.message,
      details: error.details || error.hint || null,
      code: error.code || null
    }, {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
