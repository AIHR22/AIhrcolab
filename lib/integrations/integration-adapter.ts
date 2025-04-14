import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

export interface IntegrationConfig {
  id: string
  name: string
  system_type: string
  auth_type: string
  config: Record<string, any>
  is_active: boolean
  sync_frequency: string
  last_sync_at?: string
  next_sync_at?: string
  created_at: string
  updated_at: string
}

export interface SyncLog {
  id: string
  integration_config_id: string
  sync_type: string
  status: string
  records_processed: number
  records_created: number
  records_updated: number
  records_failed: number
  start_time: string
  end_time?: string
  error_message?: string
  details?: Record<string, any>
}

export class IntegrationAdapter {
  async getIntegrations() {
    const { data, error } = await supabase
      .from('integration_configs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async getIntegrationById(id: string) {
    const { data, error } = await supabase
      .from('integration_configs')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async updateIntegrationStatus(id: string, isActive: boolean) {
    const { error } = await supabase
      .from('integration_configs')
      .update({ is_active: isActive })
      .eq('id', id)

    if (error) throw error
  }

  async updateSyncTiming(id: string, lastSyncAt: string, nextSyncAt: string) {
    const { error } = await supabase
      .from('integration_configs')
      .update({
        last_sync_at: lastSyncAt,
        next_sync_at: nextSyncAt
      })
      .eq('id', id)

    if (error) throw error
  }

  async createSyncLog(log: Omit<SyncLog, 'id'>) {
    const { error } = await supabase
      .from('integration_sync_logs')
      .insert([log])

    if (error) throw error
  }

  async getLatestSyncLog(integrationId: string) {
    const { data, error } = await supabase
      .from('integration_sync_logs')
      .select('*')
      .eq('integration_config_id', integrationId)
      .order('start_time', { ascending: false })
      .limit(1)
      .single()

    if (error) throw error
    return data
  }

  async testWorkdayConnection(config: Record<string, any>) {
    const { tenant_url, client_id, client_secret } = config
    if (!tenant_url || !client_id || !client_secret) {
      throw new Error('Missing required Workday configuration')
    }

    try {
      // Test connection to Workday API
      const response = await fetch(`${tenant_url}/api/v1/system/ping`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to connect to Workday: ${response.statusText}`)
      }
    } catch (error: any) {
      throw new Error(`Workday connection test failed: ${error.message}`)
    }
  }

  async testSapConnection(config: Record<string, any>) {
    const { api_url, api_key } = config
    if (!api_url || !api_key) {
      throw new Error('Missing required SAP configuration')
    }

    try {
      // Test connection to SAP SuccessFactors API
      const response = await fetch(`${api_url}/odata/v2/User/$count`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${api_key}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to connect to SAP: ${response.statusText}`)
      }
    } catch (error: any) {
      throw new Error(`SAP connection test failed: ${error.message}`)
    }
  }

  async testCsvFileAccess(config: Record<string, any>) {
    const { file_path, delimiter = ',' } = config
    if (!file_path) {
      throw new Error('Missing required CSV file configuration')
    }

    try {
      // Test if file exists and is accessible
      const { data, error } = await supabase
        .storage
        .from('integration-files')
        .download(file_path)

      if (error) {
        throw new Error(`Failed to access CSV file: ${error.message}`)
      }

      // Test if file content is valid CSV
      const content = await data.text()
      const lines = content.split('\n')
      if (lines.length < 2) { // At least header + one data row
        throw new Error('CSV file must contain at least a header row and one data row')
      }

      const headers = lines[0].split(delimiter)
      if (headers.length < 1) {
        throw new Error('Invalid CSV format: No columns found')
      }
    } catch (error: any) {
      throw new Error(`CSV file access test failed: ${error.message}`)
    }
  }
}