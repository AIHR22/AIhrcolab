import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { withTenantAuth, getTenantId } from '@/lib/middleware/tenant-auth';

export const POST = withTenantAuth(async (request: Request) => {
  try {
    const body = await request.json();
    const { projectId, employeeId, role, parentId, level } = body;

    if (!projectId || !employeeId) {
      return NextResponse.json(
        { error: "Project ID and Employee ID are required" },
        { status: 400 }
      );
    }

    // Check if project exists and belongs to tenant
    const tenantId = getTenantId(request);
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('tenant_id', tenantId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Create or update organization chart entry
    const { data: orgChart, error: orgChartError } = await supabaseAdmin
      .from('project_organization_charts')
      .upsert({
        project_id: projectId,
        employee_id: employeeId,
        role,
        parent_id: parentId,
        level,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (orgChartError) {
      console.error("[API] Error updating project org chart:", orgChartError);
      return NextResponse.json(
        { error: orgChartError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(orgChart);
  } catch (error: any) {
    console.error("[API] Error in project org chart update:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withTenantAuth(async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const tenantId = getTenantId(request);

    // Fetch project organization chart with employee details
    const { data: orgChart, error: orgChartError } = await supabaseAdmin
      .from('project_organization_charts')
      .select(`
        id,
        role,
        parent_id,
        level,
        employees!inner (id, first_name, last_name, email, position)
      `)
      .eq('project_id', projectId)
      .eq('tenant_id', tenantId)
      .order('level');

    if (orgChartError) {
      console.error("[API] Error fetching project org chart:", orgChartError);
      return NextResponse.json(
        { error: orgChartError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(orgChart);
  } catch (error: any) {
    console.error("[API] Error in project org chart fetch:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}