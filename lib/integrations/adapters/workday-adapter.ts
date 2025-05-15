import { AbstractAdapter } from './base-adapter';
import axios from 'axios';

/**
 * Adapter for integrating with Workday HRIS
 */
export class WorkdayAdapter extends AbstractAdapter {
  private client: any;
  private tenantUrl: string = '';
  private apiVersion: string = '';
  
  /**
   * Connect to Workday API
   */
  async connect(config: any): Promise<void> {
    try {
      this.tenantUrl = config.tenant_url;
      this.apiVersion = config.api_version || 'v1';
      
      // Set up axios client with authentication
      this.client = axios.create({
        baseURL: `${this.tenantUrl}/api/${this.apiVersion}`,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        auth: {
          username: config.client_id,
          password: config.client_secret
        }
      });
      
      // Test connection by making a simple API call
      await this.client.get('/common/healthcheck');
      
      // Call parent method to store config
      await super.connect(config);
    } catch (error: any) {
      console.error('Workday connection error:', error);
      throw new Error(`Failed to connect to Workday: ${error.message}`);
    }
  }
  
  /**
   * Test connection to Workday
   */
  async testConnection(config: any): Promise<{ success: boolean; message?: string }> {
    try {
      await this.connect(config);
      return { success: true, message: 'Successfully connected to Workday' };
    } catch (error: any) {
      return { 
        success: false, 
        message: `Connection to Workday failed: ${error.message}` 
      };
    }
  }
  
  /**
   * Get employees from Workday
   */
  async getEmployees(options?: any): Promise<any[]> {
    try {
      if (!this.isConnected) {
        throw new Error('Not connected to Workday');
      }
      
      // Set up query parameters
      const params: any = {};
      if (options?.limit) params.limit = options.limit;
      if (options?.offset) params.offset = options.offset;
      if (options?.updatedSince) params.updated_since = options.updatedSince;
      
      // Get workers from Workday API
      const response = await this.client.get('/human_resources/workers', { params });
      
      // Map Workday data structure to our expected format
      return response.data.workers.map((worker: any) => ({
        id: worker.id,
        firstName: worker.personal_data.name.first_name,
        lastName: worker.personal_data.name.last_name,
        email: worker.contact_data.email_addresses.find((email: any) => email.primary)?.email_address || '',
        position: worker.position_data.position_title,
        departmentId: worker.organization_data.department_id,
        hireDate: worker.employment_data.hire_date,
        salary: worker.compensation_data?.base_salary || 0,
        status: worker.employment_data.status
      }));
    } catch (error: any) {
      console.error('Error fetching employees from Workday:', error);
      throw new Error(`Failed to get employees: ${error.message}`);
    }
  }
  
  /**
   * Get departments from Workday
   */
  async getDepartments(options?: any): Promise<any[]> {
    try {
      if (!this.isConnected) {
        throw new Error('Not connected to Workday');
      }
      
      // Set up query parameters
      const params: any = {};
      if (options?.limit) params.limit = options.limit;
      if (options?.offset) params.offset = options.offset;
      
      // Get organizations from Workday API
      const response = await this.client.get('/human_resources/organizations', { params });
      
      // Filter for departments and map to our format
      return response.data.organizations
        .filter((org: any) => org.type === 'DEPARTMENT')
        .map((dept: any) => ({
          id: dept.id,
          name: dept.name,
          description: dept.description || '',
          managerId: dept.manager_id
        }));
    } catch (error: any) {
      console.error('Error fetching departments from Workday:', error);
      throw new Error(`Failed to get departments: ${error.message}`);
    }
  }
  
  /**
   * Get field definitions for an entity type
   */
  async getAvailableFields(entityType: string): Promise<{ name: string; label: string; type: string }[]> {
    // Return predefined field definitions based on Workday API
    if (entityType === 'employee') {
      return [
        { name: 'id', label: 'Worker ID', type: 'string' },
        { name: 'firstName', label: 'First Name', type: 'string' },
        { name: 'lastName', label: 'Last Name', type: 'string' },
        { name: 'email', label: 'Email Address', type: 'string' },
        { name: 'position', label: 'Position Title', type: 'string' },
        { name: 'departmentId', label: 'Department ID', type: 'string' },
        { name: 'hireDate', label: 'Hire Date', type: 'date' },
        { name: 'salary', label: 'Base Salary', type: 'number' },
        { name: 'status', label: 'Employment Status', type: 'string' }
      ];
    } else if (entityType === 'department') {
      return [
        { name: 'id', label: 'Department ID', type: 'string' },
        { name: 'name', label: 'Department Name', type: 'string' },
        { name: 'description', label: 'Description', type: 'string' },
        { name: 'managerId', label: 'Manager ID', type: 'string' }
      ];
    }
    
    return [];
  }
  
  /**
   * Get default field mappings for Workday entities
   */
  getDefaultMappings(entityType: string): any[] {
    if (entityType === 'employee') {
      return [
        { entity_type: 'employee', source_field: 'firstName', target_field: 'first_name', is_required: true },
        { entity_type: 'employee', source_field: 'lastName', target_field: 'last_name', is_required: true },
        { entity_type: 'employee', source_field: 'email', target_field: 'email', is_required: true },
        { entity_type: 'employee', source_field: 'position', target_field: 'position', is_required: true },
        { entity_type: 'employee', source_field: 'departmentId', target_field: 'department_id', is_required: true },
        { entity_type: 'employee', source_field: 'hireDate', target_field: 'hire_date', is_required: true, transformation_rule: 'new Date(value).toISOString().split("T")[0]' },
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
}
