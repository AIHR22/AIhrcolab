export interface Payroll {
  id: string
  employee_id: string
  base_salary: number
  bonus: number
  deductions: number
  net_salary: number
  payment_date: string
  payment_period_start: string
  payment_period_end: string
  status: string
  created_at: string
  updated_at: string
  employees?: Employee
  payroll_components?: PayrollComponent[]
  payslips?: Payslip[]
}

export interface Employee {
  id: string
  name: string
  email: string
  position_id: string
  department_id: string
}

export interface PayrollComponent {
  id: string
  payroll_id: string
  component_id: string
  amount: number
  created_at: string
  updated_at: string
  salary_components: SalaryComponent
}

export interface SalaryComponent {
  id: string
  name: string
  type: string
  description: string
  is_taxable: boolean
  created_at: string
  updated_at: string
}

export interface Payslip {
  id: string
  payroll_id: string
  file_url: string
  generated_at: string
  created_at: string
  updated_at: string
} 