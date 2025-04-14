import { createClient } from '@supabase/supabase-js'
import { AdapterRegistry } from '@/lib/integrations/adapter-registry'
import { EncryptionUtil } from '@/lib/utils/encryption-util'
import { v4 as uuidv4 } from 'uuid'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

interface IntegrationConfig {
  id?: string
  name: string
  system_type: string
  auth_type: string
  config: any
  is_active: boolean
  sync_frequency: string
  last_sync_at?: Date
  next_sync_at?: Date
}

interface FieldMapping {
  entity_type: string
  source_field: string
  target_field: string
  is_required: boolean
  transformation_rule?: string
}

interface SyncOptions {
  entities: string[]
  full_sync: boolean
  delete_missing: boolean
  batch_size: number
  test_mode: boolean
}

interface SyncResult {
  status: 'success' | 'failed' | 'partial'
  records_processed: number
  records_created: number
  records_updated: number
  records_failed: number
  start_time: Date
  end_time?: Date
  error_message?: string
  details?: any
}

export const integrationService = {
  /**
   * Get all integration configurations
   */
  async getAllConfigs() {
    try {
      const { data, error } = await supabaseAdmin
        .from('integration_configs')
        .select('*')
        .order('name')

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting integration configs:', error)
      throw error
    }
  },

  /**
   * Get a specific integration configuration
   */
  async getConfigById(id: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('integration_configs')
        .select(`
          *,
          integration_field_mappings(*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      
      // Decrypt sensitive config data
      if (data && data.config) {
        data.config = EncryptionUtil.decrypt(data.config)
      }
      
      return data
    } catch (error) {
      console.error(`Error getting integration config ${id}:`, error)
      throw error
    }
  },

  /**
   * Create a new integration configuration
   */
  async createConfig(config: IntegrationConfig, fieldMappings: FieldMapping[]) {
    try {
      // Encrypt sensitive configuration data
      const secureConfig = { 
        ...config,
        config: EncryptionUtil.encrypt(config.config)
      }

      // Insert the integration config
      const { data, error } = await supabaseAdmin
        .from('integration_configs')
        .insert([secureConfig])
        .select()
        .single()

      if (error) throw error

      // If we have field mappings, add them
      if (fieldMappings && fieldMappings.length > 0 && data.id) {
        const mappingsWithConfigId = fieldMappings.map(mapping => ({
          ...mapping,
          integration_config_id: data.id,
          id: uuidv4()
        }))

        const { error: mappingError } = await supabaseAdmin
          .from('integration_field_mappings')
          .insert(mappingsWithConfigId)

        if (mappingError) throw mappingError
      }

      return data
    } catch (error) {
      console.error('Error creating integration config:', error)
      throw error
    }
  },

  /**
   * Update an existing integration configuration
   */
  async updateConfig(id: string, config: Partial<IntegrationConfig>, fieldMappings?: FieldMapping[]) {
    try {
      // If config object contains sensitive data, encrypt it
      let updateData = { ...config }
      if (config.config) {
        updateData.config = EncryptionUtil.encrypt(config.config)
      }

      // Update the integration config
      const { data, error } = await supabaseAdmin
        .from('integration_configs')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // If we have field mappings, replace the existing ones
      if (fieldMappings && data.id) {
        // First delete existing mappings
        const { error: deleteError } = await supabaseAdmin
          .from('integration_field_mappings')
          .delete()
          .eq('integration_config_id', id)

        if (deleteError) throw deleteError

        // Then insert the new mappings
        if (fieldMappings.length > 0) {
          const mappingsWithConfigId = fieldMappings.map(mapping => ({
            ...mapping,
            integration_config_id: id,
            id: uuidv4()
          }))

          const { error: mappingError } = await supabaseAdmin
            .from('integration_field_mappings')
            .insert(mappingsWithConfigId)

          if (mappingError) throw mappingError
        }
      }

      return data
    } catch (error) {
      console.error(`Error updating integration config ${id}:`, error)
      throw error
    }
  },

  /**
   * Delete an integration configuration
   */
  async deleteConfig(id: string) {
    try {
      const { error } = await supabaseAdmin
        .from('integration_configs')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error(`Error deleting integration config ${id}:`, error)
      throw error
    }
  },

  /**
   * Activate or deactivate an integration
   */
  async setIntegrationActive(id: string, isActive: boolean) {
    try {
      const { data, error } = await supabaseAdmin
        .from('integration_configs')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error(`Error updating integration status ${id}:`, error)
      throw error
    }
  },

  /**
   * Get sync history for a specific integration
   */
  async getSyncHistory(integrationId: string, limit = 10) {
    try {
      const { data, error } = await supabaseAdmin
        .from('integration_sync_logs')
        .select('*')
        .eq('integration_config_id', integrationId)
        .order('start_time', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data
    } catch (error) {
      console.error(`Error getting sync history for ${integrationId}:`, error)
      throw error
    }
  },

  /**
   * Synchronize data from an external system
   */
  async syncData(integrationId: string, options: SyncOptions): Promise<SyncResult> {
    try {
      const startTime = new Date()
      
      // Log the start of sync
      const syncLogId = await this._createSyncLog({
        integration_config_id: integrationId,
        sync_type: options.entities.join(','),
        status: 'success', // Will update if it fails
        records_processed: 0,
        records_created: 0,
        records_updated: 0,
        records_failed: 0,
        start_time: startTime,
        details: { options }
      })

      // Get the integration config
      const integrationConfig = await this.getConfigById(integrationId)
      if (!integrationConfig) {
        throw new Error(`Integration with ID ${integrationId} not found`)
      }

      // Get field mappings
      const { data: fieldMappings, error: mappingError } = await supabaseAdmin
        .from('integration_field_mappings')
        .select('*')
        .eq('integration_config_id', integrationId)

      if (mappingError) throw mappingError

      // Initialize the adapter for this integration type
      const adapter = AdapterRegistry.getAdapter(integrationConfig.system_type)
      if (!adapter) {
        throw new Error(`No adapter found for system type: ${integrationConfig.system_type}`)
      }

      // Connect to the external system
      await adapter.connect(integrationConfig.config)

      // Create mappings by entity type
      const mappingsByEntity: Record<string, any[]> = {}
      fieldMappings.forEach(mapping => {
        if (!mappingsByEntity[mapping.entity_type]) {
          mappingsByEntity[mapping.entity_type] = []
        }
        mappingsByEntity[mapping.entity_type].push(mapping)
      })

      // Track sync results
      const result: SyncResult = {
        status: 'success',
        records_processed: 0,
        records_created: 0,
        records_updated: 0,
        records_failed: 0,
        start_time: startTime
      }

      // Sync each requested entity type
      for (const entityType of options.entities) {
        try {
          if (entityType === 'employees') {
            const employeeMappings = mappingsByEntity['employee'] || []
            const employeeResults = await this._syncEmployees(
              adapter, 
              employeeMappings, 
              options
            )
            
            // Update overall results
            result.records_processed += employeeResults.records_processed
            result.records_created += employeeResults.records_created
            result.records_updated += employeeResults.records_updated
            result.records_failed += employeeResults.records_failed
          } 
          else if (entityType === 'departments') {
            const departmentMappings = mappingsByEntity['department'] || []
            const departmentResults = await this._syncDepartments(
              adapter, 
              departmentMappings, 
              options
            )
            
            // Update overall results
            result.records_processed += departmentResults.records_processed
            result.records_created += departmentResults.records_created
            result.records_updated += departmentResults.records_updated
            result.records_failed += departmentResults.records_failed
          }
        } catch (error: any) {
          console.error(`Error syncing ${entityType}:`, error)
          
          // Mark as partial success if some entities succeeded
          if (result.records_created > 0 || result.records_updated > 0) {
            result.status = 'partial'
          } else {
            result.status = 'failed'
          }
          
          result.error_message = `Error syncing ${entityType}: ${error.message}`
        }
      }

      // Update integration last_sync_at and calculate next_sync_at
      const now = new Date()
      let nextSyncAt = null
      
      if (integrationConfig.sync_frequency === 'hourly') {
        nextSyncAt = new Date(now.getTime() + 60 * 60 * 1000)
      } else if (integrationConfig.sync_frequency === 'daily') {
        nextSyncAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      } else if (integrationConfig.sync_frequency === 'weekly') {
        nextSyncAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      }
      
      await this.updateConfig(integrationId, {
        last_sync_at: now,
        next_sync_at: nextSyncAt
      })

      // Finish the sync log
      result.end_time = new Date()
      await this._updateSyncLog(syncLogId, {
        ...result,
        status: result.status
      })

      return result
    } catch (error: any) {
      console.error(`Error during sync for integration ${integrationId}:`, error)
      
      // Update the sync log with the error
      const failedResult: SyncResult = {
        status: 'failed',
        records_processed: 0,
        records_created: 0,
        records_updated: 0,
        records_failed: 0,
        start_time: new Date(),
        end_time: new Date(),
        error_message: error.message
      }
      
      throw error
    }
  },

  /**
   * Test a connection to an external system
   */
  async testConnection(config: IntegrationConfig) {
    try {
      // Get the adapter for this system type
      const adapter = AdapterRegistry.getAdapter(config.system_type)
      if (!adapter) {
        throw new Error(`No adapter found for system type: ${config.system_type}`)
      }

      // Test the connection
      const result = await adapter.testConnection(config.config)
      return result
    } catch (error) {
      console.error('Error testing connection:', error)
      throw error
    }
  },

  /**
   * Get default field mappings for a specific system type and entity
   */
  async getDefaultMappings(systemType: string, entityType: string) {
    try {
      const adapter = AdapterRegistry.getAdapter(systemType)
      if (!adapter) {
        throw new Error(`No adapter found for system type: ${systemType}`)
      }

      return adapter.getDefaultMappings(entityType)
    } catch (error) {
      console.error(`Error getting default mappings for ${systemType}/${entityType}:`, error)
      throw error
    }
  },

  /**
   * Private method to sync employees
   */
  async _syncEmployees(adapter: any, mappings: any[], options: SyncOptions) {
    const result = {
      records_processed: 0,
      records_created: 0,
      records_updated: 0,
      records_failed: 0
    }

    // Get employees from the external system
    const externalEmployees = await adapter.getEmployees()
    result.records_processed = externalEmployees.length

    // If test mode, just return the counts
    if (options.test_mode) {
      return result
    }

    // Process each employee
    for (const externalEmployee of externalEmployees) {
      try {
        // Transform external data to our format using mappings
        const employeeData = this._mapEntityData(externalEmployee, mappings)
        
        // Check if employee already exists by email
        const { data: existingEmployees, error: queryError } = await supabaseAdmin
          .from('employees')
          .select('id')
          .eq('email', employeeData.email)

        if (queryError) throw queryError

        if (existingEmployees && existingEmployees.length > 0) {
          // Update existing employee
          const employeeId = existingEmployees[0].id
          const { error: updateError } = await supabaseAdmin
            .from('employees')
            .update(employeeData)
            .eq('id', employeeId)

          if (updateError) throw updateError
          result.records_updated++
        } else {
          // Create new employee
          const { error: insertError } = await supabaseAdmin
            .from('employees')
            .insert([employeeData])

          if (insertError) throw insertError
          result.records_created++
        }
      } catch (error) {
        console.error('Error processing employee:', error)
        result.records_failed++
      }
    }

    return result
  },

  /**
   * Private method to sync departments
   */
  async _syncDepartments(adapter: any, mappings: any[], options: SyncOptions) {
    const result = {
      records_processed: 0,
      records_created: 0,
      records_updated: 0,
      records_failed: 0
    }

    // Get departments from the external system
    const externalDepartments = await adapter.getDepartments()
    result.records_processed = externalDepartments.length

    // If test mode, just return the counts
    if (options.test_mode) {
      return result
    }

    // Process each department
    for (const externalDepartment of externalDepartments) {
      try {
        // Transform external data to our format using mappings
        const departmentData = this._mapEntityData(externalDepartment, mappings)
        
        // Check if department already exists by name
        const { data: existingDepartments, error: queryError } = await supabaseAdmin
          .from('departments')
          .select('id')
          .eq('name', departmentData.name)

        if (queryError) throw queryError

        if (existingDepartments && existingDepartments.length > 0) {
          // Update existing department
          const departmentId = existingDepartments[0].id
          const { error: updateError } = await supabaseAdmin
            .from('departments')
            .update(departmentData)
            .eq('id', departmentId)

          if (updateError) throw updateError
          result.records_updated++
        } else {
          // Create new department
          const { error: insertError } = await supabaseAdmin
            .from('departments')
            .insert([departmentData])

          if (insertError) throw insertError
          result.records_created++
        }
      } catch (error) {
        console.error('Error processing department:', error)
        result.records_failed++
      }
    }

    return result
  },

  /**
   * Map external entity data to our schema using field mappings
   */
  _mapEntityData(externalData: any, mappings: any[]) {
    const result: Record<string, any> = {}

    mappings.forEach(mapping => {
      // Get the source value from external data
      let value = externalData[mapping.source_field]

      // Apply transformation if specified
      if (mapping.transformation_rule && value !== undefined) {
        try {
          // Simple expression evaluation (with security considerations)
          const transformFn = new Function('value', `return ${mapping.transformation_rule}`)
          value = transformFn(value)
        } catch (error) {
          console.error(`Error applying transformation rule: ${mapping.transformation_rule}`, error)
        }
      }

      // Set the value in the result if not undefined
      if (value !== undefined) {
        result[mapping.target_field] = value
      } else if (mapping.is_required) {
        // Use a default value for required fields
        result[mapping.target_field] = null
      }
    })

    return result
  },

  /**
   * Create a sync log entry
   */
  async _createSyncLog(logData: any) {
    try {
      const { data, error } = await supabaseAdmin
        .from('integration_sync_logs')
        .insert([logData])
        .select()
        .single()

      if (error) throw error
      return data.id
    } catch (error) {
      console.error('Error creating sync log:', error)
      throw error
    }
  },

  /**
   * Update a sync log entry
   */
  async _updateSyncLog(id: string, updateData: any) {
    try {
      const { error } = await supabaseAdmin
        .from('integration_sync_logs')
        .update(updateData)
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error(`Error updating sync log ${id}:`, error)
      throw error
    }
  }
}
