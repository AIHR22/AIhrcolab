import { NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  try {
    const { data: skills, error } = await supabaseAdmin
      .from("skills")
      .select("id, name")
      .order("name", { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      skills
    })
  } catch (error: any) {
    console.error("Error fetching skills:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        {
          success: false,
          error: "Name is required for creating a skill",
        },
        { status: 400 }
      )
    }

    // Create a minimal skill object with just the required fields
    const skillData = {
      name: body.name,
      // These fields may not exist in your table, so let's make them optional:
      ...(body.category ? { category: body.category } : {}),
      ...(body.description ? { description: body.description } : {})
    };

    // Create the skill
    const { data, error } = await supabaseAdmin
      .from("skills")
      .insert(skillData)
      .select()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      skill: data[0]
    })
  } catch (error: any) {
    console.error("Error creating skill:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
} 