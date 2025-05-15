import { NextResponse } from "next/server"
import { checkAndRunScheduledSyncs } from "@/lib/schedulers/integration-sync-scheduler"

// This endpoint can be called by a cron job or webhook to trigger scheduled syncs
export const dynamic = 'force-dynamic' // No caching
export const runtime = 'nodejs'

/**
 * GET handler - Run scheduled integration syncs
 */
export async function GET(request: Request) {
  try {
    // Verify request contains the correct API key for security
    const url = new URL(request.url)
    const apiKey = url.searchParams.get('api_key')
    
    if (!apiKey || apiKey !== process.env.INTEGRATION_SCHEDULER_API_KEY) {
      console.error("[API] Unauthorized attempt to trigger integration sync scheduler")
      return new NextResponse("Unauthorized", { status: 401 })
    }
    
    console.log("[API] Running integration sync scheduler")
    const result = await checkAndRunScheduledSyncs()
    
    return NextResponse.json(result)
  } catch (error: any) {
    console.error("[API] Error running integration sync scheduler:", error)
    return NextResponse.json({ 
      error: error.message,
      success: false
    }, { status: 500 })
  }
}
