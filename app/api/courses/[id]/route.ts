import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// Helper to validate UUID
function isValidUUID(uuid: string) {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    if (!id || (!isValidUUID(id) && !id.startsWith('00000000-0000-0000-0000-'))) {
      return NextResponse.json({ error: "Invalid course ID format. Expected UUID." }, { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });
    const { data, error } = await supabase
      .from("courses")
      .select("*, created_by")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`Error fetching course ${params.id}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    if (!id || (!isValidUUID(id) && !id.startsWith('00000000-0000-0000-0000-'))) {
      return NextResponse.json({ error: "Invalid course ID format. Expected UUID." }, { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError) throw userError

    // Check if course exists and user has permission
    const { data: existingCourse, error: checkError } = await supabase
      .from("courses")
      .select("id, created_by")
      .eq("id", id)
      .maybeSingle();

    if (checkError || !existingCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Only allow course creator or admin to update
    if (existingCourse.created_by !== user?.id) {
      return NextResponse.json({ error: "Unauthorized to update this course" }, { status: 403 });
    }

    // Update the course
    const { data, error } = await supabase
      .from("courses")
      .update(body)
      .eq("id", id)
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json(data[0]);
  } catch (error: any) {
    console.error(`Error updating course ${params.id}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    if (!id || (!isValidUUID(id) && !id.startsWith('00000000-0000-0000-0000-'))) {
      return NextResponse.json({ error: "Invalid course ID format. Expected UUID." }, { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError) throw userError

    // Check if course exists and user has permission
    const { data: existingCourse, error: checkError } = await supabase
      .from("courses")
      .select("id, created_by")
      .eq("id", id)
      .maybeSingle();

    if (checkError || !existingCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Only allow course creator or admin to delete
    if (existingCourse.created_by !== user?.id) {
      return NextResponse.json({ error: "Unauthorized to delete this course" }, { status: 403 });
    }

    // Delete the course
    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, message: "Course deleted successfully" });
  } catch (error: any) {
    console.error(`Error deleting course ${params.id}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
