import { AbstractAdapter } from './base-adapter';

/**
 * Adapter for importing employee and department data from CSV files
 */
export class CsvFileAdapter extends AbstractAdapter {
  private employeeData: any[] = [];
  private departmentData: any[] = [];
  
  /**
   * Initialize with CSV data
   */
  async connect(config: any): Promise<void> {
    try {
      // Parse employee CSV if provided
      if (config.employees_csv) {
        this.employeeData = this.parseCsv(config.employees_csv);
      }
      
      // Parse department CSV if provided
      if (config.departments_csv) {
        this.departmentData = this.parseCsv(config.departments_csv);
      }
      
      // Call parent method to store config
      await super.connect(config);
    } catch (error: any) {
      console.error('CSV parsing error:', error);
      throw new Error(`Failed to parse CSV: ${error.message}`);
    }
  }
  
  /**
   * Test CSV parsing
   */
  async testConnection(config: any): Promise<{ success: boolean; message?: string }> {
    try {
      // Validate that at least one CSV is provided
      if (!config.employees_csv && !config.departments_csv) {
        return { 
          success: false, 
          message: 'At least one CSV file for employees or departments is required.'
        };
      }
      
      // Attempt to parse the first few rows of each CSV to validate structure
      if (config.employees_csv) {
        const sampleEmployees = this.parseCsv(config.employees_csv, 5);
        if (!this.validateEmployeeCsv(sampleEmployees)) {
          return { 
            success: false, 
            message: 'Employee CSV is missing required columns. Please check the file format.'
          };
        }
      }
      
      if (config.departments_csv) {
        const sampleDepartments = this.parseCsv(config.departments_csv, 5);
        if (!this.validateDepartmentCsv(sampleDepartments)) {
          return { 
            success: false, 
            message: 'Department CSV is missing required columns. Please check the file format.'
          };
        }
      }
      
      await this.connect(config);
      
      const employeeCount = this.employeeData.length;
      const departmentCount = this.departmentData.length;
      
      return { 
        success: true, 
        message: `Successfully parsed ${employeeCount} employees and ${departmentCount} departments from CSV.`
      };
    } catch (error: any) {
      return { 
        success: false, 
        message: `CSV parsing failed: ${error.message}`
      };
    }
  }
  
  /**
   * Get employees from CSV data
   */
  async getEmployees(): Promise<any[]> {
    if (!this.isConnected) {
      throw new Error('CSV data not loaded');
    }
    
    return this.employeeData;
  }
  
  /**
   * Get departments from CSV data
   */
  async getDepartments(): Promise<any[]> {
    if (!this.isConnected) {
      throw new Error('CSV data not loaded');
    }
    
    return this.departmentData;
  }
  
  /**
   * Get available fields based on CSV headers
   */
  async getAvailableFields(entityType: string): Promise<{ name: string; label: string; type: string }[]> {
    if (!this.isConnected) {
      throw new Error('CSV data not loaded');
    }
    
    if (entityType === 'employee' && this.employeeData.length > 0) {
      const sampleEmployee = this.employeeData[0];
      return Object.keys(sampleEmployee).map(key => ({
        name: key,
        label: this.formatFieldName(key),
        type: this.inferFieldType(sampleEmployee[key])
      }));
    } 
    else if (entityType === 'department' && this.departmentData.length > 0) {
      const sampleDepartment = this.departmentData[0];
      return Object.keys(sampleDepartment).map(key => ({
        name: key,
        label: this.formatFieldName(key),
        type: this.inferFieldType(sampleDepartment[key])
      }));
    }
    
    return [];
  }
  
  /**
   * Get default field mappings for CSV fields
   */
  getDefaultMappings(entityType: string): any[] {
    if (entityType === 'employee') {
      return [
        { entity_type: 'employee', source_field: 'first_name', target_field: 'first_name', is_required: true },
        { entity_type: 'employee', source_field: 'last_name', target_field: 'last_name', is_required: true },
        { entity_type: 'employee', source_field: 'email', target_field: 'email', is_required: true },
        { entity_type: 'employee', source_field: 'position', target_field: 'position', is_required: true },
        { entity_type: 'employee', source_field: 'department_id', target_field: 'department_id', is_required: true },
        { entity_type: 'employee', source_field: 'hire_date', target_field: 'hire_date', is_required: true },
        { entity_type: 'employee', source_field: 'salary', target_field: 'salary', is_required: false }
      ];
    } else if (entityType === 'department') {
      return [
        { entity_type: 'department', source_field: 'id', target_field: 'id', is_required: true },
        { entity_type: 'department', source_field: 'name', target_field: 'name', is_required: true },
        { entity_type: 'department', source_field: 'description', target_field: 'description', is_required: false }
      ];
    }
    return [];
  }
  
  /**
   * Parse CSV data into objects
   * Custom implementation to avoid external dependencies
   */
  private parseCsv(csvData: string, maxRows: number = 0): any[] {
    try {
      // Split the CSV by lines
      const lines = csvData.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length === 0) {
        return [];
      }
      
      // Extract headers (first line)
      const headers = this.parseCSVLine(lines[0]);
      
      // Parse each data line
      const results: any[] = [];
      const limit = maxRows > 0 ? Math.min(maxRows + 1, lines.length) : lines.length;
      
      for (let i = 1; i < limit; i++) {
        const values = this.parseCSVLine(lines[i]);
        if (values.length === headers.length) {
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index];
          });
          results.push(row);
        }
      }
      
      return results;
    } catch (error) {
      console.error('CSV parsing error:', error);
      throw new Error('Failed to parse CSV data');
    }
  }
  
  /**
   * Parse a single CSV line, handling quotes and commas properly
   */
  private parseCSVLine(line: string): string[] {
    const results: string[] = [];
    let currentValue = '';
    let insideQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (i < line.length - 1 && line[i + 1] === '"') {
          // Double quotes inside quotes - add a single quote
          currentValue += '"';
          i++; // Skip the next quote
        } else {
          // Toggle inside quotes flag
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        // End of field
        results.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    // Add the last field
    results.push(currentValue.trim());
    
    return results;
  }
  
  /**
   * Validate employee CSV has required columns
   */
  private validateEmployeeCsv(data: any[]): boolean {
    if (data.length === 0) return false;
    
    const requiredColumns = ['first_name', 'last_name', 'email'];
    const sampleKeys = Object.keys(data[0]).map(k => k.toLowerCase());
    
    return requiredColumns.every(col => 
      sampleKeys.some(key => key === col || key.replace(/[_\s]/g, '') === col.replace(/[_\s]/g, ''))
    );
  }
  
  /**
   * Validate department CSV has required columns
   */
  private validateDepartmentCsv(data: any[]): boolean {
    if (data.length === 0) return false;
    
    const requiredColumns = ['id', 'name'];
    const sampleKeys = Object.keys(data[0]).map(k => k.toLowerCase());
    
    return requiredColumns.every(col => 
      sampleKeys.some(key => key === col || key.replace(/[_\s]/g, '') === col.replace(/[_\s]/g, ''))
    );
  }
  
  /**
   * Format a field name to a readable label
   */
  private formatFieldName(name: string): string {
    return name
      // Convert snake_case or camelCase to spaces
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      // Capitalize first letter of each word
      .replace(/^\w|\s\w/g, c => c.toUpperCase());
  }
  
  /**
   * Infer field type from value
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
      // Check if it looks like a date
      if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
        return 'date';
      }
      return 'string';
    }
    
    return 'string';
  }
}
