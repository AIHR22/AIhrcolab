import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { WorkforcePlan, SkillRequirement } from "@/types/workforce-components"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get workforce plans
    const { data: plans, error } = await supabase
      .from('workforce_plans')
      .select(`
        *,
        departments:department_id (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching workforce plans:", error);
      return NextResponse.json(
        { error: "Failed to fetch workforce plans" },
        { status: 500 }
      );
    }

    // Process the data to match our expected interface
    const processedPlans = plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      department_id: plan.department_id,
      department_name: plan.departments?.name,
      start_date: plan.start_date,
      end_date: plan.end_date,
      status: plan.status,
      required_skills: plan.required_skills || [],
      budget_amount: plan.budget_amount,
      created_at: plan.created_at,
      updated_at: plan.updated_at
    }));

    return NextResponse.json({
      plans: processedPlans,
      count: processedPlans.length
    });
  } catch (error) {
    console.error("Server error in workforce plans API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();

    // Extract data from the form
    const {
      planName,
      description,
      department,
      startDate,
      endDate,
      budget,
      requiredSkills
    } = body;

    // Validate required fields
    if (!planName || !department || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Process required skills
    let skillsArray = [];
    if (requiredSkills) {
      // Simple parsing for demo - in production would use a more robust approach
      skillsArray = requiredSkills.split(',').map((skill: string) => ({
        skill_name: skill.trim(),
        required_level: 1,
        required_count: 1
      }));
    }

    // Create workforce plan
    const { data, error } = await supabase
      .from('workforce_plans')
      .insert([
        {
          name: planName,
          description,
          department_id: department,
          start_date: startDate,
          end_date: endDate,
          budget_amount: budget ? parseInt(budget) : null,
          required_skills: skillsArray,
          status: 'draft'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating workforce plan:", error);
      return NextResponse.json(
        { error: "Failed to create workforce plan" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      plan: data
    });
  } catch (error) {
    console.error("Server error in create workforce plan API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
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
