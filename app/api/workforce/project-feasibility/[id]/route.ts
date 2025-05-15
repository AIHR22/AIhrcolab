import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!supabaseAdmin) {
      throw new Error("Supabase admin client not available");
    }

    const { id } = params;

    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: "Invalid ID format. Expected UUID." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("project_feasibility")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("[API] Error fetching project feasibility:", error);
      return NextResponse.json(
        { error: error.message },
        { status: error.code === "PGRST116" ? 404 : 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Project feasibility analysis not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[API] Error in GET /api/workforce/project-feasibility/[id]:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error"},
      { status: 500 }
    );
  }
} 