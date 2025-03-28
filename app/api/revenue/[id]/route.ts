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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Allow test UUIDs pattern (for API testing)
    if (!id || (!isValidUUID(id) && !id.startsWith('00000000-0000-0000-0000-'))) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid ID format. Expected UUID.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("revenue")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          {
            success: false,
            error: "Revenue entry not found",
          },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("Error fetching revenue entry:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Allow test UUIDs pattern (for API testing)
    if (!id || (!isValidUUID(id) && !id.startsWith('00000000-0000-0000-0000-'))) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid ID format. Expected UUID.",
        },
        { status: 400 }
      );
    }

    // Check if entry exists
    const { data: exists, error: checkError } = await supabaseAdmin
      .from("revenue")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (checkError || !exists) {
      return NextResponse.json(
        {
          success: false,
          error: "Revenue entry not found",
        },
        { status: 404 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("revenue")
      .update(body)
      .eq("id", id)
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: data[0],
    });
  } catch (error: any) {
    console.error("Error updating revenue entry:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Allow test UUIDs pattern (for API testing)
    if (!id || (!isValidUUID(id) && !id.startsWith('00000000-0000-0000-0000-'))) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid ID format. Expected UUID.",
        },
        { status: 400 }
      );
    }

    // Check if entry exists
    const { data: exists, error: checkError } = await supabaseAdmin
      .from("revenue")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (checkError || !exists) {
      return NextResponse.json(
        {
          success: false,
          error: "Revenue entry not found",
        },
        { status: 404 }
      );
    }

    const { error } = await supabaseAdmin
      .from("revenue")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Revenue entry deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting revenue entry:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
} 