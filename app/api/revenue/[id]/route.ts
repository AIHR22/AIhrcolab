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
      .from("revenue_data")
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

    interface RevenueData {
      id: string;
      department_id?: string;
      period_type?: string;
      period_date?: string;
    }

    // Check if entry exists
    const { data: exists, error: checkError } = await supabaseAdmin
      .from("revenue_data")
      .select("id, department_id, period_type, period_date")
      .eq("id", id)
      .maybeSingle() as { data: RevenueData | null, error: any };

    if (checkError || !exists) {
      return NextResponse.json(
        {
          success: false,
          error: "Revenue entry not found",
        },
        { status: 404 }
      );
    }

    // Update revenue_data
    const { data, error } = await supabaseAdmin
      .from("revenue_data")
      .update(body)
      .eq("id", id)
      .select();

    // If this is department revenue, also update department_revenue
    if (data?.[0]?.department_id) {
      const deptData = {
        department_id: data[0].department_id,
        period_type: data[0].period_type,
        period_date: data[0].period_date,
        amount: data[0].amount,
        is_projected: data[0].is_projected,
        growth_rate: data[0].growth_rate
      }

      const { error: deptError } = await supabaseAdmin
        .from("department_revenue")
        .upsert(deptData, {
          onConflict: 'department_id,period_type,period_date'
        })

      if (deptError) {
        console.error("Error updating department revenue:", deptError)
      }
    }

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

    interface RevenueData {
      id: string;
      department_id?: string;
      period_type?: string;
      period_date?: string;
    }

    // Check if entry exists
    const { data: exists, error: checkError } = await supabaseAdmin
      .from("revenue_data")
      .select("id, department_id, period_type, period_date")
      .eq("id", id)
      .maybeSingle() as { data: RevenueData | null, error: any };

    if (checkError || !exists) {
      return NextResponse.json(
        {
          success: false,
          error: "Revenue entry not found",
        },
        { status: 404 }
      );
    }

    // Delete from revenue_data
    const { error } = await supabaseAdmin
      .from("revenue_data")
      .delete()
      .eq("id", id);

    // If this was department revenue, also delete from department_revenue
    if (exists?.department_id) {
      const { error: deptError } = await supabaseAdmin
        .from("department_revenue")
        .delete()
        .eq("department_id", exists.department_id)
        .eq("period_type", exists.period_type)
        .eq("period_date", exists.period_date)

      if (deptError) {
        console.error("Error deleting department revenue:", deptError)
      }
    }

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