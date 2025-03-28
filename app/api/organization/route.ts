import { NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'
import { OrgChartNode } from "@/types/organization"

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

export async function GET(request: Request) {
  try {
    // First, get all departments
    const { data: departments, error: departmentsError } = await supabaseAdmin
      .from("departments")
      .select("*")
    
    if (departmentsError) {
      throw departmentsError
    }
    
    // Then, get all employees with their department and manager info
    const { data: employees, error: employeesError } = await supabaseAdmin
      .from("employees")
      .select(`
        id, 
        first_name, 
        last_name, 
        position, 
        department_id, 
        manager_id
      `)
    
    if (employeesError) {
      throw employeesError
    }

    // Build org chart tree structure
    const orgChart = buildOrgChartTree(employees, departments)
    
    return NextResponse.json({
      success: true,
      data: orgChart
    })
  } catch (error: any) {
    console.error("Error fetching organization data:", error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

// Helper function to build tree structure
function buildOrgChartTree(employees: any[], departments: any[]) {
  if (!employees.length) {
    return null
  }
  
  // Create a department lookup map
  const departmentsMap = new Map()
  departments.forEach(dept => {
    departmentsMap.set(dept.id, dept.name)
  })
  
  // Create a map of employees by ID
  const employeesMap = new Map()
  employees.forEach(emp => {
    employeesMap.set(emp.id, {
      ...emp,
      children: []
    })
  })
  
  // Find CEO or root node (employee without manager)
  const rootEmployees = employees.filter(emp => !emp.manager_id)
  
  if (rootEmployees.length === 0) {
    // If no root, just return the first employee as root
    const firstEmployee = employees[0]
    return {
      id: firstEmployee.id,
      name: `${firstEmployee.first_name} ${firstEmployee.last_name}`,
      title: firstEmployee.position || "Employee",
      department: departmentsMap.get(firstEmployee.department_id) || "Unknown",
      children: []
    }
  }
  
  // Build tree structure
  employees.forEach(emp => {
    if (emp.manager_id && employeesMap.has(emp.manager_id)) {
      const manager = employeesMap.get(emp.manager_id)
      manager.children.push(employeesMap.get(emp.id))
    }
  })
  
  // Convert to OrgChartNode structure
  function convertToOrgChartNode(employee: any): OrgChartNode {
    return {
      id: employee.id,
      name: `${employee.first_name} ${employee.last_name}`,
      title: employee.position || "Employee",
      department: departmentsMap.get(employee.department_id) || "Unknown",
      children: employee.children.map(convertToOrgChartNode)
    }
  }
  
  // Return the root node
  return convertToOrgChartNode(employeesMap.get(rootEmployees[0].id))
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Create the organization structure
    const { data, error } = await supabaseAdmin
      .from("org_structures")
      .insert({
        name: body.name || "New Organization Structure",
        structure: body.structure,
        is_active: body.is_active ?? true
      })
      .select()
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({
      success: true,
      data: data[0]
    })
  } catch (error: any) {
    console.error("Error creating organization structure:", error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
} 