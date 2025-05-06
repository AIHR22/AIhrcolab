// Removing the import since we're using fetch API
// import { createClient } from "@/lib/supabase";

export type PayrollEntry = {
  id: string;
  employee_id: string;
  payment_date: string;
  base_salary: number;
  bonus?: number;
  overtime_pay?: number;
  deductions?: number;
  tax_withholding?: number;
  payment_method?: string;
  status?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  employees?: {
    id: string;
    first_name: string;
    last_name: string;
    department?: string;
    job_title?: string;
    position?: string;
    department_id?: string;
  };
};

export type NewPayrollEntry = Omit<PayrollEntry, 'id' | 'created_at' | 'updated_at' | 'employees'>;

export const payrollService = {
  /**
   * Get all payroll entries
   */
  async getAll(): Promise<PayrollEntry[]> {
    const response = await fetch('/api/payroll');
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error fetching payroll entries');
    }
    
    return response.json();
  },

  /**
   * Get payroll entries for a specific employee
   */
  async getByEmployeeId(employeeId: string): Promise<PayrollEntry[]> {
    const response = await fetch(`/api/payroll?employeeId=${employeeId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error fetching employee payroll entries');
    }
    
    return response.json();
  },

  /**
   * Get a specific payroll entry
   */
  async getById(id: string): Promise<PayrollEntry> {
    const response = await fetch(`/api/payroll/${id}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error fetching payroll entry');
    }
    
    return response.json();
  },

  /**
   * Create a new payroll entry
   */
  async create(payrollEntry: NewPayrollEntry): Promise<PayrollEntry> {
    const response = await fetch('/api/payroll', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payrollEntry),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error creating payroll entry');
    }
    
    return response.json();
  },

  /**
   * Update a payroll entry
   */
  async update(id: string, payrollEntry: Partial<NewPayrollEntry>): Promise<PayrollEntry> {
    const response = await fetch(`/api/payroll/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payrollEntry),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error updating payroll entry');
    }
    
    return response.json();
  },

  /**
   * Delete a payroll entry
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`/api/payroll/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error deleting payroll entry');
    }
  }
};
