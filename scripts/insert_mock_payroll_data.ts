const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl);

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

const mockPayrollData = [
  {
    employee_id: "1",
    payment_date: "2023-12-15",
    base_salary: 5800,
    bonus: 0,
    overtime_pay: 0,
    deductions: 0,
    tax_withholding: 0,
    payment_method: "Direct Deposit",
    status: "paid",
    notes: "",
  },
  {
    employee_id: "2",
    payment_date: "2023-12-15",
    base_salary: 7200,
    bonus: 0,
    overtime_pay: 0,
    deductions: 0,
    tax_withholding: 0,
    payment_method: "Direct Deposit",
    status: "paid",
    notes: "",
  },
  {
    employee_id: "3",
    payment_date: "2023-12-15",
    base_salary: 5500,
    bonus: 0,
    overtime_pay: 0,
    deductions: 0,
    tax_withholding: 0,
    payment_method: "Direct Deposit",
    status: "pending",
    notes: "",
  },
  {
    employee_id: "4",
    payment_date: "2023-12-15",
    base_salary: 4800,
    bonus: 0,
    overtime_pay: 0,
    deductions: 0,
    tax_withholding: 0,
    payment_method: "Direct Deposit",
    status: "failed",
    notes: "",
  },
  {
    employee_id: "5",
    payment_date: "2023-12-15",
    base_salary: 6200,
    bonus: 0,
    overtime_pay: 0,
    deductions: 0,
    tax_withholding: 0,
    payment_method: "Direct Deposit",
    status: "paid",
    notes: "",
  },
  {
    employee_id: "6",
    payment_date: "2023-12-15",
    base_salary: 5900,
    bonus: 0,
    overtime_pay: 0,
    deductions: 0,
    tax_withholding: 0,
    payment_method: "Direct Deposit",
    status: "paid",
    notes: "",
  },
];

async function insertMockData() {
  for (const payrollEntry of mockPayrollData) {
    const { data, error } = await supabaseAdmin
      .from('payroll')
      .insert(payrollEntry);

    if (error) {
      console.error('Error inserting payroll entry:', error);
    } else {
      console.log('Inserted payroll entry:', data);
    }
  }
}

console.log('Starting mock payroll data insertion...');
insertMockData();
