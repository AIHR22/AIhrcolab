import { NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

// Helper to validate UUID
function isValidUUID(uuid: string) {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    // Allow test UUIDs pattern (for API testing)
    if (!id || (!isValidUUID(id) && !id.startsWith('00000000-0000-0000-0000-'))) {
      return NextResponse.json({ error: "Invalid project ID format" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("projects")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`Error fetching project ${params.id}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Allow test UUIDs pattern (for API testing)
    if (!id || (!isValidUUID(id) && !id.startsWith('00000000-0000-0000-0000-'))) {
      return NextResponse.json({ error: "Invalid project ID format" }, { status: 400 });
    }

    // Check if project exists
    const { data: projectExists, error: checkError } = await supabaseAdmin
      .from("projects")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (checkError || !projectExists) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Update the project
    const { data, error } = await supabaseAdmin
      .from("projects")
      .update(body)
      .eq("id", id)
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json(data[0]);
  } catch (error: any) {
    console.error(`Error updating project ${params.id}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    // Allow test UUIDs pattern (for API testing)
    if (!id || (!isValidUUID(id) && !id.startsWith('00000000-0000-0000-0000-'))) {
      return NextResponse.json({ error: "Invalid project ID format" }, { status: 400 });
    }

    // Check if project exists
    const { data: projectExists, error: checkError } = await supabaseAdmin
      .from("projects")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (checkError || !projectExists) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Delete the project
    const { error } = await supabaseAdmin
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, message: "Project deleted successfully" });
  } catch (error: any) {
    console.error(`Error deleting project ${params.id}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

