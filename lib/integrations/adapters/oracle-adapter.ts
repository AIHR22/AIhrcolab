import { AbstractAdapter } from './base-adapter';
import axios from 'axios';

/**
 * Adapter for integrating with Oracle HCM Cloud
 */
export class OracleAdapter extends AbstractAdapter {
  private client: any;
  private baseUrl: string = '';
  private apiVersion: string = '';
  
  /**
   * Connect to Oracle HCM Cloud API
   */
  async connect(config: any): Promise<void> {
    try {
      this.baseUrl = config.base_url;
      this.apiVersion = config.api_version || 'v1';
      
      // Set up axios client with authentication
      this.client = axios.create({
        baseURL: `${this.baseUrl}/hcmRestApi/${this.apiVersion}`,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      // Add auth token to every request
      this.client.interceptors.request.use((config: any) => {
        config.headers['Authorization'] = `Bearer ${config.access_token}`;
        return config;
      });
      
      // Test connection by making a simple API call
      await this.client.get('/workers');
      
      // Call parent method to store config
      await super.connect(config);
    } catch (error: any) {
      console.error('Oracle connection error:', error);
      throw new Error(`Failed to connect to Oracle HCM Cloud: ${error.message}`);
    }
  }
  
  /**
   * Test connection to Oracle HCM Cloud
   */
  async testConnection(config: any): Promise<{ success: boolean; message?: string }> {
    try {
      await this.connect(config);
      return { success: true, message: 'Successfully connected to Oracle HCM Cloud' };
    } catch (error: any) {
      return { 
        success: false, 
        message: `Connection to Oracle HCM Cloud failed: ${error.message}` 
      };
    }
  }
  
  /**
   * Get employees from Oracle HCM Cloud
   */
  async getEmployees(options?: any): Promise<any[]> {
    try {
      if (!this.isConnected) {
        throw new Error('Not connected to Oracle HCM Cloud');
      }
      
      // Build query parameters
      let queryParams = 'expand=assignments';
      
      if (options?.limit) {
        queryParams += `&limit=${options.limit}`;
      }
      
      if (options?.offset) {
        queryParams += `&offset=${options.offset}`;
      }
      
      // Get employees from API
      const response = await this.client.get(`/workers?${queryParams}`);
      
      // Map Oracle data structure to our expected format
      return response.data.items.map((employee: any) => ({
        id: employee.personId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.workEmail,
        position: employee.assignments[0]?.jobTitle || '',
        departmentId: employee.assignments[0]?.departmentId || '',
        hireDate: employee.hireDate,
        salary: employee.assignments[0]?.salaryAmount || 0
      }));
    } catch (error: any) {
      console.error('Error fetching employees from Oracle:', error);
      throw new Error(`Failed to get employees: ${error.message}`);
    }
  }
  
  /**
   * Get departments from Oracle HCM Cloud
   */
  async getDepartments(options?: any): Promise<any[]> {
    try {
      if (!this.isConnected) {
        throw new Error('Not connected to Oracle HCM Cloud');
      }
      
      // Build query parameters
      let queryParams = '';
      
      if (options?.limit) {
        queryParams += `limit=${options.limit}`;
      }
      
      if (options?.offset) {
        queryParams += `&offset=${options.offset}`;
      }
      
      // Get departments from API
      const url = `/departments${queryParams ? '?' + queryParams : ''}`;
      const response = await this.client.get(url);
      
      // Map Oracle data structure to our expected format
      return response.data.items.map((dept: any) => ({
        id: dept.departmentId,
        name: dept.name,
        description: dept.description || '',
        managerId: dept.managerId
      }));
    } catch (error: any) {
      console.error('Error fetching departments from Oracle:', error);
      throw new Error(`Failed to get departments: ${error.message}`);
    }
  }
  
  /**
   * Get field definitions for an entity type
   */
  async getAvailableFields(entityType: string): Promise<{ name: string; label: string; type: string }[]> {
    // Return predefined field definitions based on Oracle HCM API
    if (entityType === 'employee') {
      return [
        { name: 'personId', label: 'Person ID', type: 'string' },
        { name: 'firstName', label: 'First Name', type: 'string' },
        { name: 'lastName', label: 'Last Name', type: 'string' },
        { name: 'workEmail', label: 'Work Email', type: 'string' },
        { name: 'jobTitle', label: 'Job Title', type: 'string' },
        { name: 'departmentId', label: 'Department ID', type: 'string' },
        { name: 'hireDate', label: 'Hire Date', type: 'date' },
        { name: 'salaryAmount', label: 'Salary Amount', type: 'number' }
      ];
    } else if (entityType === 'department') {
      return [
        { name: 'departmentId', label: 'Department ID', type: 'string' },
        { name: 'name', label: 'Department Name', type: 'string' },
        { name: 'description', label: 'Description', type: 'string' },
        { name: 'managerId', label: 'Manager ID', type: 'string' }
      ];
    }
    
    return [];
  }
}
