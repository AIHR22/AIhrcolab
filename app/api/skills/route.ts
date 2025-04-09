import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  console.log("[API] GET /api/skills: Starting request");
  try {
    // Check if Supabase admin client is available
    if (!supabaseAdmin) {
      console.error("Supabase admin client not available for skills API");
      return NextResponse.json(
        { error: "Database connection error" },
        { status: 500 }
      );
    }

    console.log("[API] Fetching skills from database...");
    const { data: skills, error } = await supabaseAdmin
      .from("skills")
      .select("id, name, category")
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching skills:", error);
      throw error;
    }

    console.log(`[API] Successfully fetched ${skills?.length || 0} skills`);
    // Return just the skills array for simpler handling in components
    return NextResponse.json(skills);
  } catch (error: any) {
    console.error("Error in skills API:", error);
    return NextResponse.json(
      { error: error.message || "Error fetching skills" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Check if Supabase admin client is available
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Database connection error" },
        { status: 500 }
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    if (!body.name) {
      return NextResponse.json(
        { error: "Skill name is required" },
        { status: 400 }
      );
    }

    // Insert the new skill
    const { data, error } = await supabaseAdmin
      .from("skills")
      .insert({
        name: body.name,
        category: body.category || "General",
        description: body.description || ""
      })
      .select();

    if (error) {
      console.error("Error creating skill:", error);
      throw error;
    }

    return NextResponse.json(data[0]);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error creating skill" },
      { status: 500 }
    );
  }
} 