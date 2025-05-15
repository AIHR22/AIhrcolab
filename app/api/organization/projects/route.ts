import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { withTenantAuth, getTenantId } from '@/lib/middleware/tenant-auth';

export const POST = withTenantAuth(async (request: Request) => {
  try {
    const body = await request.json();
    const { name, description } = body;
    const tenantId = getTenantId(request);

    if (!name) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    // Create new project with tenant context
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .insert({ 
        name, 
        description,
        tenant_id: tenantId
      })
      .select()
      .single();

    if (projectError) {
      console.error("[API] Error creating project:", projectError);
      return NextResponse.json(
        { error: projectError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(project);
  } catch (error: any) {
    console.error("[API] Error in project creation:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withTenantAuth(async (request: Request) => {
  try {
    const tenantId = getTenantId(request);
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');

    let query = supabaseAdmin
      .from('projects')
      .select(`
        *,
        departments (id, name),
        project_organization_charts (id, role, employee_id)
      `);

    // Apply tenant filter
    query = query.eq('tenant_id', tenantId);

    if (projectsError) {
      console.error("[API] Error fetching projects:", projectsError);
      return NextResponse.json(
        { error: projectsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(projects);
  } catch (error: any) {
    console.error("[API] Error in projects fetch:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}