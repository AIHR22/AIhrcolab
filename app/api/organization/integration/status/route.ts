import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    // Fetch integration configuration from database
    const { data, error } = await supabaseAdmin
      .from("erp_integration_config")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()
    
    if (error && error.code !== "PGRST116") { // PGRST116 is "no rows returned"
      throw error
    }
    
    if (!data) {
      return NextResponse.json({
        success: true,
        status: "disconnected",
        message: "No active ERP/HCM integration found"
      })
    }
    
    return NextResponse.json({
      success: true,
      status: "connected",
      provider: data.provider,
      lastSyncTime: data.last_sync,
      nextScheduledSync: data.next_scheduled_sync
    })
  } catch (error: any) {
    console.error("[API] Error fetching integration status:", error)
    return NextResponse.json({
      success: false,
      status: "error",
      message: error.message || "Failed to get integration status"
    }, { status: 500 })
  }
}
