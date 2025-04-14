import { NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

export async function POST() {
  try {
    // Create the departments table if it doesn't exist
    const { error: departmentsError } = await supabaseAdmin.rpc('create_departments_table')
    
    if (departmentsError && !departmentsError.message.includes('already exists')) {
      throw departmentsError
    }
    
    // Create the employees table if it doesn't exist
    const { error: employeesError } = await supabaseAdmin.rpc('create_employees_table')
    
    if (employeesError && !employeesError.message.includes('already exists')) {
      throw employeesError
    }
    
    // Create the org_structures table for saving organization charts
    const { error: orgStructuresError } = await supabaseAdmin.rpc('create_org_structures_table')
    
    if (orgStructuresError && !orgStructuresError.message.includes('already exists')) {
      throw orgStructuresError
    }

    // Seed with some sample data if tables are empty
    await seedSampleData()
    
    return NextResponse.json({
      success: true,
      message: "Organization tables created successfully"
    })
  } catch (error: any) {
    console.error("Error creating organization tables:", error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

// Helper function to seed sample data
async function seedSampleData() {
  try {
    // Check if departments table is empty
    const { data: departments, error: deptCheckError } = await supabaseAdmin
      .from('departments')
      .select('id')
      .limit(1)
    
    if (deptCheckError) {
      throw deptCheckError
    }
    
    // If departments table is empty, add sample departments
    if (departments.length === 0) {
      const sampleDepartments = [
        {
          name: 'Executive',
          description: 'Executive leadership team'
        },
        {
          name: 'Technology',
          description: 'Technical and development teams'
        },
        {
          name: 'Finance',
          description: 'Financial operations'
        },
        {
          name: 'Human Resources',
          description: 'HR operations and employee management'
        },
        {
          name: 'Engineering',
          description: 'Engineering and product development'
        },
        {
          name: 'Product',
          description: 'Product management and design'
        }
      ]
      
      const { error: deptInsertError } = await supabaseAdmin
        .from('departments')
        .insert(sampleDepartments)
      
      if (deptInsertError) {
        throw deptInsertError
      }
    }
    
    // Check if employees table is empty
    const { data: employees, error: empCheckError } = await supabaseAdmin
      .from('employees')
      .select('id')
      .limit(1)
    
    if (empCheckError) {
      throw empCheckError
    }
    
    // If employees table is empty, add sample employees
    if (employees.length === 0) {
      // Get department IDs first
      const { data: deptIds, error: deptError } = await supabaseAdmin
        .from('departments')
        .select('id, name')
      
      if (deptError || !deptIds) {
        throw deptError || new Error('Failed to get department IDs')
      }
      
      // Create a mapping of department name to ID
      const deptMap = deptIds.reduce((acc, dept) => {
        acc[dept.name] = dept.id
        return acc
      }, {} as Record<string, number>)
      
      // Define sample employees with department references
      const sampleEmployees = [
        {
          first_name: 'Robert',
          last_name: 'Johnson',
          email: 'robert.johnson@example.com',
          position: 'CEO',
          department_id: deptMap['Executive'],
          salary: 250000
        }
      ]
      
      // Insert CEO first
      const { data: ceoData, error: ceoError } = await supabaseAdmin
        .from('employees')
        .insert(sampleEmployees)
        .select()
      
      if (ceoError || !ceoData) {
        throw ceoError || new Error('Failed to insert CEO')
      }
      
      // Get CEO ID
      const ceoId = ceoData[0].id
      
      // Add more employees with manager reference
      const executiveEmployees = [
        {
          first_name: 'Sarah',
          last_name: 'Williams',
          email: 'sarah.williams@example.com',
          position: 'CTO',
          department_id: deptMap['Technology'],
          manager_id: ceoId,
          salary: 220000
        },
        {
          first_name: 'David',
          last_name: 'Wilson',
          email: 'david.wilson@example.com',
          position: 'CFO',
          department_id: deptMap['Finance'],
          manager_id: ceoId,
          salary: 210000
        },
        {
          first_name: 'Lisa',
          last_name: 'Martinez',
          email: 'lisa.martinez@example.com',
          position: 'CHRO',
          department_id: deptMap['Human Resources'],
          manager_id: ceoId,
          salary: 200000
        }
      ]
      
      // Insert executive team
      const { data: execTeam, error: execError } = await supabaseAdmin
        .from('employees')
        .insert(executiveEmployees)
        .select()
      
      if (execError) {
        throw execError
      }
      
      // Create a mapping of position to ID for the executive team
      const execMap = execTeam.reduce((acc, exec) => {
        acc[exec.position] = exec.id
        return acc
      }, {} as Record<string, number>)
      
      // Add department directors
      const directorEmployees = [
        {
          first_name: 'Michael',
          last_name: 'Chen',
          email: 'michael.chen@example.com',
          position: 'Engineering Director',
          department_id: deptMap['Engineering'],
          manager_id: execMap['CTO'],
          salary: 180000
        },
        {
          first_name: 'Emily',
          last_name: 'Rodriguez',
          email: 'emily.rodriguez@example.com',
          position: 'Product Director',
          department_id: deptMap['Product'],
          manager_id: execMap['CTO'],
          salary: 175000
        },
        {
          first_name: 'Jennifer',
          last_name: 'Lee',
          email: 'jennifer.lee@example.com',
          position: 'Finance Director',
          department_id: deptMap['Finance'],
          manager_id: execMap['CFO'],
          salary: 170000
        },
        {
          first_name: 'Thomas',
          last_name: 'Brown',
          email: 'thomas.brown@example.com',
          position: 'Accounting Manager',
          department_id: deptMap['Finance'],
          manager_id: execMap['CFO'],
          salary: 160000
        },
        {
          first_name: 'James',
          last_name: 'Taylor',
          email: 'james.taylor@example.com',
          position: 'HR Director',
          department_id: deptMap['Human Resources'],
          manager_id: execMap['CHRO'],
          salary: 165000
        },
        {
          first_name: 'Sophia',
          last_name: 'Garcia',
          email: 'sophia.garcia@example.com',
          position: 'Talent Acquisition Manager',
          department_id: deptMap['Human Resources'],
          manager_id: execMap['CHRO'],
          salary: 155000
        }
      ]
      
      // Insert directors
      const { error: directorError } = await supabaseAdmin
        .from('employees')
        .insert(directorEmployees)
      
      if (directorError) {
        throw directorError
      }
    }
    
    console.log('Sample data seeded successfully')
  } catch (error) {
    console.error('Error seeding sample data:', error)
    throw error
  }
} 