import { AbstractAdapter } from './base-adapter';
import axios from 'axios';

/**
 * Adapter for integrating with Microsoft Dynamics 365 HR
 */
export class MicrosoftDynamicsAdapter extends AbstractAdapter {
  private client: any;
  private baseUrl: string = '';
  private apiVersion: string = '';
  
  /**
   * Connect to Microsoft Dynamics 365 API
   */
  async connect(config: any): Promise<void> {
    try {
      this.baseUrl = config.base_url;
      this.apiVersion = config.api_version || 'v9.1';
      
      // Set up axios client with authentication
      this.client = axios.create({
        baseURL: `${this.baseUrl}/api/data/${this.apiVersion}`,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      // Add auth token to every request
      this.client.interceptors.request.use((config: any) => {
        config.headers['Authorization'] = `Bearer ${this.connectionConfig.access_token}`;
        return config;
      });
      
      // Test connection by making a simple API call
      await this.client.get('/systemusers?$top=1');
      
      // Call parent method to store config
      await super.connect(config);
    } catch (error: any) {
      console.error('Microsoft Dynamics connection error:', error);
      throw new Error(`Failed to connect to Microsoft Dynamics 365: ${error.message}`);
    }
  }
  
  /**
   * Test connection to Microsoft Dynamics 365
   */
  async testConnection(config: any): Promise<{ success: boolean; message?: string }> {
    try {
      await this.connect(config);
      return { success: true, message: 'Successfully connected to Microsoft Dynamics 365' };
    } catch (error: any) {
      return { 
        success: false, 
        message: `Connection to Microsoft Dynamics 365 failed: ${error.message}` 
      };
    }
  }
  
  /**
   * Get employees from Microsoft Dynamics 365
   */
  async getEmployees(options?: any): Promise<any[]> {
    try {
      if (!this.isConnected) {
        throw new Error('Not connected to Microsoft Dynamics 365');
      }
      
      // Build query parameters for OData
      let queryParams = '$select=systemuserid,firstname,lastname,internalemailaddress,jobtitle,_parentbusinessunitid_value';
      queryParams += '&$expand=businessunitid($select=name)';
      
      if (options?.limit) {
        queryParams += `&$top=${options.limit}`;
      }
      
      // Get employees from API
      const response = await this.client.get(`/systemusers?${queryParams}`);
      
      // Map Dynamics data structure to our expected format
      return response.data.value.map((employee: any) => ({
        id: employee.systemuserid,
        firstName: employee.firstname,
        lastName: employee.lastname,
        email: employee.internalemailaddress,
        position: employee.jobtitle || '',
        departmentId: employee._parentbusinessunitid_value || '',
        departmentName: employee.businessunitid?.name || '',
        hireDate: employee.createdon, // Use creation date as hire date
        salary: 0 // Salary information may not be available in standard fields
      }));
    } catch (error: any) {
      console.error('Error fetching employees from Microsoft Dynamics:', error);
      throw new Error(`Failed to get employees: ${error.message}`);
    }
  }
  
  /**
   * Get departments from Microsoft Dynamics 365
   */
  async getDepartments(options?: any): Promise<any[]> {
    try {
      if (!this.isConnected) {
        throw new Error('Not connected to Microsoft Dynamics 365');
      }
      
      // Build query parameters for OData
      let queryParams = '$select=businessunitid,name,description,parentbusinessunitid';
      
      if (options?.limit) {
        queryParams += `&$top=${options.limit}`;
      }
      
      // Get departments from API (using businessunit entity)
      const response = await this.client.get(`/businessunits?${queryParams}`);
      
      // Map Dynamics data structure to our expected format
      return response.data.value.map((dept: any) => ({
        id: dept.businessunitid,
        name: dept.name,
        description: dept.description || '',
        managerId: dept.managerid || null,
        parentId: dept.parentbusinessunitid || null
      }));
    } catch (error: any) {
      console.error('Error fetching departments from Microsoft Dynamics:', error);
      throw new Error(`Failed to get departments: ${error.message}`);
    }
  }
  
  /**
   * Get field definitions for an entity type
   */
  async getAvailableFields(entityType: string): Promise<{ name: string; label: string; type: string }[]> {
    // Return predefined field definitions based on Dynamics 365 API
    if (entityType === 'employee') {
      return [
        { name: 'systemuserid', label: 'User ID', type: 'string' },
        { name: 'firstname', label: 'First Name', type: 'string' },
        { name: 'lastname', label: 'Last Name', type: 'string' },
        { name: 'internalemailaddress', label: 'Email Address', type: 'string' },
        { name: 'jobtitle', label: 'Job Title', type: 'string' },
        { name: '_parentbusinessunitid_value', label: 'Department ID', type: 'string' },
        { name: 'createdon', label: 'Created Date', type: 'date' }
      ];
    } else if (entityType === 'department') {
      return [
        { name: 'businessunitid', label: 'Business Unit ID', type: 'string' },
        { name: 'name', label: 'Name', type: 'string' },
        { name: 'description', label: 'Description', type: 'string' },
        { name: 'parentbusinessunitid', label: 'Parent Business Unit', type: 'string' }
      ];
    }
    
    return [];
  }
  
  /**
   * Get default field mappings for Dynamics 365 entities
   */
  getDefaultMappings(entityType: string): any[] {
    if (entityType === 'employee') {
      return [
        { entity_type: 'employee', source_field: 'firstname', target_field: 'first_name', is_required: true },
        { entity_type: 'employee', source_field: 'lastname', target_field: 'last_name', is_required: true },
        { entity_type: 'employee', source_field: 'internalemailaddress', target_field: 'email', is_required: true },
        { entity_type: 'employee', source_field: 'jobtitle', target_field: 'position', is_required: false },
        { entity_type: 'employee', source_field: '_parentbusinessunitid_value', target_field: 'department_id', is_required: true },
        { entity_type: 'employee', source_field: 'createdon', target_field: 'hire_date', is_required: false, transformation_rule: 'new Date(value).toISOString().split("T")[0]' }
      ];
    } else if (entityType === 'department') {
      return [
        { entity_type: 'department', source_field: 'name', target_field: 'name', is_required: true },
        { entity_type: 'department', source_field: 'description', target_field: 'description', is_required: false },
        { entity_type: 'department', source_field: 'businessunitid', target_field: 'id', is_required: true }
      ];
    }
    return [];
  }
}
