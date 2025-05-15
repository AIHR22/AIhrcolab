import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { ERPIntegrationConfig } from "@/types/organization"

export async function POST() {
  try {
    // Get the active integration configuration
    const { data: config, error: configError } = await supabaseAdmin
      .from("erp_integration_config")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()
    
    if (configError && configError.code !== "PGRST116") { // PGRST116 is "no rows returned"
      throw configError
    }
    
    if (!config) {
      return NextResponse.json({
        success: false,
        error: "No active ERP/HCM integration found"
      }, { status: 400 })
    }
    
    // In a real implementation, this would make an API call to the ERP/HCM system
    // For demonstration purposes, we'll simulate a successful sync
    
    // Metrics for the sync operation
    const stats = {
      added: Math.floor(Math.random() * 5),      // 0-4 employees added
      updated: Math.floor(Math.random() * 10),   // 0-9 employees updated
      unchanged: Math.floor(Math.random() * 20), // 0-19 employees unchanged
      failed: 0,                                // No failures in this demo
      total: 0
    }
    
    stats.total = stats.added + stats.updated + stats.unchanged + stats.failed
    
    // Update the last sync time
    const now = new Date().toISOString()
    const { error: updateError } = await supabaseAdmin
      .from("erp_integration_config")
      .update({
        last_sync: now,
        next_scheduled_sync: getNextSyncTime(now, config.sync_frequency),
        status: "active"
      })
      .eq("id", config.id)
    
    if (updateError) {
      throw updateError
    }
    
    // Log the sync operation
    await supabaseAdmin
      .from("integration_sync_logs")
      .insert({
        integration_id: config.id,
        provider: config.provider,
        sync_date: now,
        employees_added: stats.added,
        employees_updated: stats.updated,
        employees_unchanged: stats.unchanged,
        employees_failed: stats.failed,
        status: "success",
        details: `Successfully synchronized ${stats.total} employees`
      })
    
    // Create an audit log entry
    await supabaseAdmin
      .from("audit_logs")
      .insert({
        action: "sync",
        entity_type: "erp_integration",
        entity_id: config.id,
        user_id: "system", // In a real app, this would be the authenticated user's ID
        details: `Synchronized organization data with ${config.provider}`,
        ip_address: "127.0.0.1" // In a real app, this would be the client IP
      })
    
    return NextResponse.json({
      success: true,
      message: "Successfully synchronized with ERP/HCM system",
      stats,
      lastSyncTime: now
    })
  } catch (error: any) {
    console.error("[API] Error syncing with ERP/HCM:", error)
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to sync with ERP/HCM system"
    }, { status: 500 })
  }
}

// Helper function to calculate the next sync time based on frequency
function getNextSyncTime(currentTime: string, frequency: string): string {
  const date = new Date(currentTime)
  
  switch (frequency) {
    case "hourly":
      date.setHours(date.getHours() + 1)
      break
    case "daily":
      date.setDate(date.getDate() + 1)
      break
    case "weekly":
      date.setDate(date.getDate() + 7)
      break
    default:
      // For manual, set to null or far future
      date.setFullYear(date.getFullYear() + 1)
      break
  }
  
  return date.toISOString()
}
