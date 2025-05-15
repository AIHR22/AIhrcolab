import { createClient } from '@supabase/supabase-js'
import { integrationService } from '@/lib/services/integration-service'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function checkAndRunScheduledSyncs() {
  console.log('[Scheduler] Checking for scheduled integration syncs...')
  
  try {
    // Get all active integrations
    const { data: activeIntegrations, error } = await supabaseAdmin
      .from('integration_configs')
      .select('*')
      .eq('is_active', true)
      .order('next_sync_at', { ascending: true })
    
    if (error) {
      throw error
    }
    
    const now = new Date()
    let syncCount = 0
    
    // Check each integration to see if it's due for a sync
    for (const integration of (activeIntegrations || [])) {
      try {
        if (integration.next_sync_at && new Date(integration.next_sync_at) <= now) {
          console.log(`[Scheduler] Integration ${integration.id} (${integration.name}) is due for sync`)
          
          // Run the sync
          await integrationService.syncData(integration.id, {
            entities: ['employees', 'departments'],
            full_sync: false,
            delete_missing: false,
            batch_size: 100,
            test_mode: false
          })
          
          syncCount++
        }
      } catch (syncError) {
        console.error(`[Scheduler] Error syncing integration ${integration.id}:`, syncError)
        
        // Update the next_sync_at even if there was an error, to avoid endless retry loops
        try {
          const newNextSyncAt = calculateNextSyncTime(integration.sync_frequency)
          await integrationService.updateConfig(integration.id, {
            next_sync_at: newNextSyncAt
          })
        } catch (updateError) {
          console.error(`[Scheduler] Error updating next_sync_at for integration ${integration.id}:`, updateError)
        }
      }
    }
    
    console.log(`[Scheduler] Completed scheduled sync check. Synced ${syncCount} integrations`)
    return { success: true, synced: syncCount }
  } catch (error) {
    console.error('[Scheduler] Error checking for scheduled syncs:', error)
    return { success: false, error }
  }
}

/**
 * Calculate the next sync time based on the frequency
 */
function calculateNextSyncTime(frequency: string): Date {
  const now = new Date()
  
  switch (frequency) {
    case 'hourly':
      return new Date(now.getTime() + 60 * 60 * 1000) // 1 hour
    case 'daily':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days
    case 'monthly':
      // Add 30 days - simplified approach
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) 
    default:
      // Default to daily if frequency is unknown
      return new Date(now.getTime() + 24 * 60 * 60 * 1000)
  }
}
