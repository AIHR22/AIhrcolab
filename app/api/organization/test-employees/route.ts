import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    console.log("[Test Employees API] Fetching employees and departments");
    
    // Fetch employees
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('*')
      .order('first_name');
    
    if (empError) {
      console.error('Error fetching employees:', empError);
      return NextResponse.json(
        { success: false, message: "Failed to fetch employees", error: empError.message },
        { status: 500 }
      );
    }
    
    // Fetch departments
    const { data: departments, error: deptError } = await supabase
      .from('departments')
      .select('*')
      .order('name');
    
    if (deptError) {
      console.error('Error fetching departments:', deptError);
      return NextResponse.json(
        { success: false, message: "Failed to fetch departments", error: deptError.message },
        { status: 500 }
      );
    }
    
    // Create a map of department IDs to names for easier lookup
    const departmentMap = new Map();
    departments.forEach(dept => {
      departmentMap.set(dept.id, dept.name);
    });
    
    // Enhance employee data with department names
    const enhancedEmployees = employees.map(emp => ({
      ...emp,
      department_name: departmentMap.get(emp.department_id) || 'Unknown'
    }));
    
    // Group employees by department for easier viewing
    const employeesByDepartment: Record<string, any[]> = {};
    enhancedEmployees.forEach(emp => {
      const deptName = emp.department_name;
      if (!employeesByDepartment[deptName]) {
        employeesByDepartment[deptName] = [];
      }
      employeesByDepartment[deptName].push(emp);
    });
    
    return NextResponse.json({
      success: true,
      data: {
        employees: enhancedEmployees,
        departments: departments,
        employeesByDepartment: employeesByDepartment,
        counts: {
          employees: employees.length,
          departments: departments.length
        }
      }
    });
  } catch (error) {
    console.error("Error in test employees route:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to fetch organization data" 
      },
      { status: 500 }
    );
  }
} 