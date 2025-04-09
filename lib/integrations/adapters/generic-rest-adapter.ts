import { AbstractAdapter } from './base-adapter';
import axios from 'axios';

/**
 * Generic REST API adapter that can connect to any RESTful ERP/HRIS system
 */
export class GenericRestAdapter extends AbstractAdapter {
  private client: any;
  private config: any;
  
  /**
   * Connect to the generic REST API endpoint
   */
  async connect(config: any): Promise<void> {
    try {
      this.config = config;
      
      // Create axios client with base configuration
      const axiosConfig: any = {
        baseURL: config.base_url,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: config.timeout || 30000
      };
      
      // Add authentication based on auth_type
      if (config.auth_type === 'basic') {
        axiosConfig.auth = {
          username: config.username,
          password: config.password
        };
      } else if (config.auth_type === 'api_key') {
        // Determine if API key goes in header or query parameter
        if (config.api_key_in === 'header') {
          axiosConfig.headers[config.api_key_name] = config.api_key;
        } else {
          axiosConfig.params = { [config.api_key_name]: config.api_key };
        }
      } else if (config.auth_type === 'oauth2') {
        axiosConfig.headers['Authorization'] = `Bearer ${config.access_token}`;
      }
      
      // Add any custom headers
      if (config.custom_headers && typeof config.custom_headers === 'object') {
        Object.assign(axiosConfig.headers, config.custom_headers);
      }
      
      this.client = axios.create(axiosConfig);
      
      // Verify connection by calling the test endpoint
      if (config.test_endpoint) {
        await this.client.get(config.test_endpoint);
      }
      
      // Call parent method to store config
      await super.connect(config);
    } catch (error: any) {
      console.error('Generic REST API connection error:', error);
      throw new Error(`Failed to connect to REST API: ${error.message}`);
    }
  }
  
  /**
   * Test the connection to the REST API
   */
  async testConnection(config: any): Promise<{ success: boolean; message?: string }> {
    try {
      // If there's a test endpoint specified, use it
      if (config.test_endpoint) {
        await this.connect(config);
        return { success: true, message: 'Successfully connected to REST API' };
      }
      
      // Otherwise, try to connect to the employees endpoint
      if (config.employees_endpoint) {
        await this.connect(config);
        await this.client.get(config.employees_endpoint, { params: { limit: 1 } });
        return { success: true, message: 'Successfully connected to REST API' };
      }
      
      return { success: false, message: 'No test endpoint or employees endpoint specified' };
    } catch (error: any) {
      return { 
        success: false, 
        message: `Connection to REST API failed: ${error.message}` 
      };
    }
  }
  
  /**
   * Get employees from the REST API
   */
  async getEmployees(options?: any): Promise<any[]> {
    try {
      if (!this.isConnected || !this.config.employees_endpoint) {
        throw new Error('Not connected to REST API or no employees endpoint configured');
      }
      
      // Build query parameters
      const params: any = {};
      
      // Add pagination parameters if specified in config
      if (this.config.pagination_type === 'offset') {
        if (options?.limit) params[this.config.limit_param || 'limit'] = options.limit;
        if (options?.offset) params[this.config.offset_param || 'offset'] = options.offset;
      } else if (this.config.pagination_type === 'page') {
        if (options?.limit) params[this.config.limit_param || 'per_page'] = options.limit;
        if (options?.page) params[this.config.page_param || 'page'] = options.page;
      }
      
      // Add any additional query parameters
      if (options?.params) {
        Object.assign(params, options.params);
      }
      
      // Get employees from API
      const response = await this.client.get(this.config.employees_endpoint, { params });
      
      // Extract data based on the response path configuration
      let employees;
      if (this.config.response_path) {
        employees = this.getNestedValue(response.data, this.config.response_path);
      } else {
        employees = response.data;
      }
      
      if (!Array.isArray(employees)) {
        throw new Error('API response is not an array of employees');
      }
      
      return employees;
    } catch (error: any) {
      console.error('Error fetching employees from REST API:', error);
      throw new Error(`Failed to get employees: ${error.message}`);
    }
  }
  
  /**
   * Get departments from the REST API
   */
  async getDepartments(options?: any): Promise<any[]> {
    try {
      if (!this.isConnected || !this.config.departments_endpoint) {
        throw new Error('Not connected to REST API or no departments endpoint configured');
      }
      
      // Build query parameters
      const params: any = {};
      
      // Add pagination parameters if specified in config
      if (this.config.pagination_type === 'offset') {
        if (options?.limit) params[this.config.limit_param || 'limit'] = options.limit;
        if (options?.offset) params[this.config.offset_param || 'offset'] = options.offset;
      } else if (this.config.pagination_type === 'page') {
        if (options?.limit) params[this.config.limit_param || 'per_page'] = options.limit;
        if (options?.page) params[this.config.page_param || 'page'] = options.page;
      }
      
      // Add any additional query parameters
      if (options?.params) {
        Object.assign(params, options.params);
      }
      
      // Get departments from API
      const response = await this.client.get(this.config.departments_endpoint, { params });
      
      // Extract data based on the response path configuration
      let departments;
      if (this.config.departments_response_path) {
        departments = this.getNestedValue(response.data, this.config.departments_response_path);
      } else {
        departments = response.data;
      }
      
      if (!Array.isArray(departments)) {
        throw new Error('API response is not an array of departments');
      }
      
      return departments;
    } catch (error: any) {
      console.error('Error fetching departments from REST API:', error);
      throw new Error(`Failed to get departments: ${error.message}`);
    }
  }
  
  /**
   * Get field definitions for an entity type
   */
  async getAvailableFields(entityType: string): Promise<{ name: string; label: string; type: string }[]> {
    // For a generic adapter, we don't know the fields in advance
    // Return some common fields as examples, or fetch a sample record to introspect
    
    if (entityType === 'employee') {
      try {
        // Fetch a sample employee to determine available fields
        const employees = await this.getEmployees({ limit: 1 });
        if (employees.length > 0) {
          const sampleEmployee = employees[0];
          return Object.keys(sampleEmployee).map(key => ({
            name: key,
            label: this.formatFieldLabel(key),
            type: this.inferFieldType(sampleEmployee[key])
          }));
        }
      } catch (error) {
        console.error('Could not fetch sample employee:', error);
      }
      
      // Fallback to common fields
      return [
        { name: 'id', label: 'ID', type: 'string' },
        { name: 'first_name', label: 'First Name', type: 'string' },
        { name: 'last_name', label: 'Last Name', type: 'string' },
        { name: 'email', label: 'Email', type: 'string' },
        { name: 'department_id', label: 'Department ID', type: 'string' },
        { name: 'hire_date', label: 'Hire Date', type: 'date' },
        { name: 'salary', label: 'Salary', type: 'number' }
      ];
    } else if (entityType === 'department') {
      try {
        // Fetch a sample department to determine available fields
        const departments = await this.getDepartments({ limit: 1 });
        if (departments.length > 0) {
          const sampleDepartment = departments[0];
          return Object.keys(sampleDepartment).map(key => ({
            name: key,
            label: this.formatFieldLabel(key),
            type: this.inferFieldType(sampleDepartment[key])
          }));
        }
      } catch (error) {
        console.error('Could not fetch sample department:', error);
      }
      
      // Fallback to common fields
      return [
        { name: 'id', label: 'ID', type: 'string' },
        { name: 'name', label: 'Name', type: 'string' },
        { name: 'description', label: 'Description', type: 'string' }
      ];
    }
    
    return [];
  }
  
  /**
   * Format a field name as a human-readable label
   */
  private formatFieldLabel(fieldName: string): string {
    return fieldName
      // Split by underscore or camelCase
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/_/g, ' ')
      // Capitalize first letter of each word
      .replace(/(^\w|\s\w)/g, m => m.toUpperCase());
  }
  
  /**
   * Infer the data type of a field based on its value
   */
  private inferFieldType(value: any): string {
    if (value === null || value === undefined) {
      return 'string';
    }
    
    if (typeof value === 'number') {
      return 'number';
    }
    
    if (typeof value === 'boolean') {
      return 'boolean';
    }
    
    if (value instanceof Date) {
      return 'date';
    }
    
    if (typeof value === 'string') {
      // Check if it's a date string
      if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
        return 'date';
      }
      return 'string';
    }
    
    if (Array.isArray(value)) {
      return 'array';
    }
    
    if (typeof value === 'object') {
      return 'object';
    }
    
    return 'string';
  }
  
  /**
   * Get a nested value from an object using a path string
   * e.g., "data.results" would return obj.data.results
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((prev, curr) => {
      return prev && prev[curr] !== undefined ? prev[curr] : null;
    }, obj);
  }
}
