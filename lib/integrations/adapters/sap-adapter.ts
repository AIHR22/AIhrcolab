import { AbstractAdapter } from './base-adapter';
import axios from 'axios';

/**
 * Adapter for integrating with SAP SuccessFactors
 */
export class SapAdapter extends AbstractAdapter {
  private client: any;
  private baseUrl: string = '';
  private apiVersion: string = '';
  
  /**
   * Connect to SAP SuccessFactors API
   */
  async connect(config: any): Promise<void> {
    try {
      this.baseUrl = config.base_url;
      this.apiVersion = config.api_version || 'v2';
      
      // Set up axios client with authentication
      this.client = axios.create({
        baseURL: `${this.baseUrl}/odata/${this.apiVersion}`,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      // Add auth token to every request
      this.client.interceptors.request.use((config: any) => {
        config.headers['Authorization'] = `Bearer ${this.getAccessToken()}`;
        return config;
      });
      
      // Test connection by making a simple API call
      await this.client.get('/User');
      
      // Call parent method to store config
      await super.connect(config);
    } catch (error: any) {
      console.error('SAP connection error:', error);
      throw new Error(`Failed to connect to SAP SuccessFactors: ${error.message}`);
    }
  }
  
  /**
   * Get OAuth access token
   */
  private async getAccessToken(): Promise<string> {
    try {
      const tokenUrl = this.connectionConfig.token_url;
      const response = await axios.post(tokenUrl, {
        grant_type: 'client_credentials',
        client_id: this.connectionConfig.client_id,
        client_secret: this.connectionConfig.client_secret
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      return response.data.access_token;
    } catch (error: any) {
      console.error('Error getting SAP access token:', error);
      throw new Error(`Failed to get access token: ${error.message}`);
    }
  }
  
  /**
   * Test connection to SAP SuccessFactors
   */
  async testConnection(config: any): Promise<{ success: boolean; message?: string }> {
    try {
      await this.connect(config);
      return { success: true, message: 'Successfully connected to SAP SuccessFactors' };
    } catch (error: any) {
      return { 
        success: false, 
        message: `Connection to SAP SuccessFactors failed: ${error.message}` 
      };
    }
  }
  
  /**
   * Get employees from SAP SuccessFactors
   */
  async getEmployees(options?: any): Promise<any[]> {
    try {
      if (!this.isConnected) {
        throw new Error('Not connected to SAP SuccessFactors');
      }
      
      // Build query parameters
      let queryParams = '$select=userId,firstName,lastName,email,department,location,position,hireDate,salary';
      
      if (options?.limit) {
        queryParams += `&$top=${options.limit}`;
      }
      
      if (options?.offset) {
        queryParams += `&$skip=${options.offset}`;
      }
      
      // Get employees from API
      const response = await this.client.get(`/User?${queryParams}`);
      
      // Map SAP data structure to our expected format
      return response.data.d.results.map((employee: any) => ({
        id: employee.userId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        position: employee.position,
        departmentId: employee.department,
        hireDate: employee.hireDate,
        salary: employee.salary || 0
      }));
    } catch (error: any) {
      console.error('Error fetching employees from SAP:', error);
      throw new Error(`Failed to get employees: ${error.message}`);
    }
  }
  
  /**
   * Get departments from SAP SuccessFactors
   */
  async getDepartments(options?: any): Promise<any[]> {
    try {
      if (!this.isConnected) {
        throw new Error('Not connected to SAP SuccessFactors');
      }
      
      // Build query parameters
      let queryParams = '$select=externalCode,name,description,headOfUnit';
      
      if (options?.limit) {
        queryParams += `&$top=${options.limit}`;
      }
      
      if (options?.offset) {
        queryParams += `&$skip=${options.offset}`;
      }
      
      // Get departments from API
      const response = await this.client.get(`/FODepartment?${queryParams}`);
      
      // Map SAP data structure to our expected format
      return response.data.d.results.map((dept: any) => ({
        id: dept.externalCode,
        name: dept.name,
        description: dept.description || '',
        managerId: dept.headOfUnit
      }));
    } catch (error: any) {
      console.error('Error fetching departments from SAP:', error);
      throw new Error(`Failed to get departments: ${error.message}`);
    }
  }
  
  /**
   * Get field definitions for an entity type
   */
  async getAvailableFields(entityType: string): Promise<{ name: string; label: string; type: string }[]> {
    // Return predefined field definitions based on SAP API
    if (entityType === 'employee') {
      return [
        { name: 'userId', label: 'User ID', type: 'string' },
        { name: 'firstName', label: 'First Name', type: 'string' },
        { name: 'lastName', label: 'Last Name', type: 'string' },
        { name: 'email', label: 'Email Address', type: 'string' },
        { name: 'department', label: 'Department ID', type: 'string' },
        { name: 'position', label: 'Position Title', type: 'string' },
        { name: 'location', label: 'Location', type: 'string' },
        { name: 'hireDate', label: 'Hire Date', type: 'date' },
        { name: 'salary', label: 'Salary', type: 'number' }
      ];
    } else if (entityType === 'department') {
      return [
        { name: 'externalCode', label: 'Department ID', type: 'string' },
        { name: 'name', label: 'Department Name', type: 'string' },
        { name: 'description', label: 'Description', type: 'string' },
        { name: 'headOfUnit', label: 'Head of Department', type: 'string' }
      ];
    }
    
    return [];
  }
  
  /**
   * Get default field mappings for SAP entities
   */
  getDefaultMappings(entityType: string): any[] {
    if (entityType === 'employee') {
      return [
        { entity_type: 'employee', source_field: 'firstName', target_field: 'first_name', is_required: true },
        { entity_type: 'employee', source_field: 'lastName', target_field: 'last_name', is_required: true },
        { entity_type: 'employee', source_field: 'email', target_field: 'email', is_required: true },
        { entity_type: 'employee', source_field: 'position', target_field: 'position', is_required: true },
        { entity_type: 'employee', source_field: 'department', target_field: 'department_id', is_required: true },
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
