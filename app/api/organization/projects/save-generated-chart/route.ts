import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projectId, generatedChart } = body;

    if (!projectId || !generatedChart) {
      return NextResponse.json(
        { error: "Project ID and generated chart data are required" },
        { status: 400 }
      );
    }

    // Check if project exists
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Delete existing chart entries for this project
    const { error: deleteError } = await supabaseAdmin
      .from('project_organization_charts')
      .delete()
      .eq('project_id', projectId);

    if (deleteError) {
      console.error("[API] Error deleting existing project org chart:", deleteError);
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    // First pass: Create all nodes without parent references
    async function createNodes(node: any, level: number = 0, nodeMap = new Map()) {
      const { data: chartEntry, error: insertError } = await supabaseAdmin
        .from('project_organization_charts')
        .insert({
          project_id: projectId,
          employee_id: node.id,
          role: node.title,
          parent_id: null, // Initially set to null
          level: level
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Error inserting node: ${insertError.message}`);
      }

      // Store the mapping between original node and its DB entry
      nodeMap.set(node.id, chartEntry.id);

      // Recursively process child nodes
      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          await createNodes(child, level + 1, nodeMap);
        }
      }

      return nodeMap;
    }

    // Second pass: Update parent references
    async function updateParentReferences(node: any, nodeMap: Map<string, string>, parentId: string | null = null) {
      const currentNodeId = nodeMap.get(node.id);
      
      if (currentNodeId && parentId) {
        const { error: updateError } = await supabaseAdmin
          .from('project_organization_charts')
          .update({ parent_id: parentId })
          .eq('id', currentNodeId);

        if (updateError) {
          throw new Error(`Error updating parent reference: ${updateError.message}`);
        }
      }

      // Recursively update child nodes
      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          await updateParentReferences(child, nodeMap, currentNodeId);
        }
      }
    }

    // Execute two-pass process
    const nodeMap = await createNodes(generatedChart);
    await updateParentReferences(generatedChart, nodeMap);

    return NextResponse.json({
      success: true,
      message: "Organization chart saved to project successfully"
    });

  } catch (error: any) {
    console.error("[API] Error saving generated org chart to project:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}