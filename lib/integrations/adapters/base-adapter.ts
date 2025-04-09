/**
 * Base interface for all ERP/HRIS system adapters
 */
export interface BaseAdapter {
  /**
   * Connect to the external system
   * @param config Connection configuration object
   */
  connect(config: any): Promise<void>;
  
  /**
   * Test the connection to the external system
   * @param config Connection configuration object
   * @returns Object with success status and optional error message
   */
  testConnection(config: any): Promise<{ success: boolean; message?: string }>;
  
  /**
   * Get default field mappings for an entity type
   * @param entityType Type of entity (employee, department, etc.)
   * @returns Array of default field mappings
   */
  getDefaultMappings(entityType: string): any[];
  
  /**
   * Get employees from the external system
   * @param options Optional parameters (filters, pagination, etc.)
   * @returns Array of employee objects from the external system
   */
  getEmployees(options?: any): Promise<any[]>;
  
  /**
   * Get departments from the external system
   * @param options Optional parameters (filters, pagination, etc.)
   * @returns Array of department objects from the external system
   */
  getDepartments(options?: any): Promise<any[]>;
  
  /**
   * Get available fields for an entity type
   * @param entityType Type of entity (employee, department, etc.)
   * @returns Array of field definitions
   */
  getAvailableFields(entityType: string): Promise<{ name: string; label: string; type: string }[]>;
}

/**
 * Abstract base class that provides common functionality for adapters
 */
export abstract class AbstractAdapter implements BaseAdapter {
  protected connectionConfig: any;
  protected isConnected: boolean = false;
  
  /**
   * Store connection configuration and set connected state
   * @param config Connection configuration
   */
  async connect(config: any): Promise<void> {
    this.connectionConfig = config;
    this.isConnected = true;
  }
  
  /**
   * Basic connection test - override in specific adapters
   */
  async testConnection(config: any): Promise<{ success: boolean; message?: string }> {
    try {
      await this.connect(config);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message || 'Connection failed' };
    }
  }
  
  /**
   * Get default employee field mappings
   */
  getDefaultMappings(entityType: string): any[] {
    if (entityType === 'employee') {
      return [
        { entity_type: 'employee', source_field: 'firstName', target_field: 'first_name', is_required: true },
        { entity_type: 'employee', source_field: 'lastName', target_field: 'last_name', is_required: true },
        { entity_type: 'employee', source_field: 'email', target_field: 'email', is_required: true },
        { entity_type: 'employee', source_field: 'position', target_field: 'position', is_required: false },
        { entity_type: 'employee', source_field: 'departmentId', target_field: 'department_id', is_required: true },
        { entity_type: 'employee', source_field: 'hireDate', target_field: 'hire_date', is_required: true },
        { entity_type: 'employee', source_field: 'salary', target_field: 'salary', is_required: false }
      ];
    } else if (entityType === 'department') {
      return [
        { entity_type: 'department', source_field: 'name', target_field: 'name', is_required: true },
        { entity_type: 'department', source_field: 'description', target_field: 'description', is_required: false }
      ];
    }
    return [];
  }
  
  // Abstract methods to be implemented by specific adapters
  abstract getEmployees(options?: any): Promise<any[]>;
  abstract getDepartments(options?: any): Promise<any[]>;
  abstract getAvailableFields(entityType: string): Promise<{ name: string; label: string; type: string }[]>;
}
