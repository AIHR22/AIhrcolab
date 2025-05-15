import type { Database } from "@/lib/database.types"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

type Employee = Database["public"]["Tables"]["employees"]["Row"]
type NewEmployee = Database["public"]["Tables"]["employees"]["Insert"]
type EmployeeUpdate = Database["public"]["Tables"]["employees"]["Update"]

export const employeeService = {
  async getAll(): Promise<Employee[]> {
    try {
      console.log('[Service] Fetching employees...')
      const response = await fetch('/api/employees', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        // Add cache control to prevent caching issues
        cache: 'no-store'
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('[Service] Error fetching employees:', errorData)
        throw new Error(`Failed to fetch employees: ${errorData.error || response.statusText}`)
      }

      const data = await response.json()
      console.log('[Service] Employees fetched successfully:', data.length)
      return data
    } catch (error) {
      console.error('[Service] Error in getAll():', error)
      throw error
    }
  },

  async getById(id: string) {
    try {
      const res = await fetch(`/api/employees/${id}`)
      console.log(`GET /api/employees/${id} response:`, res.status)
      
      if (!res.ok) {
        const error = await res.json()
        console.error("Error fetching employee:", error)
        throw new Error(error.message || "Failed to fetch employee")
      }
      
      const data = await res.json()
      console.log("Fetched employee:", data)
      return data
    } catch (error) {
      console.error("Error in getById:", error)
      throw error
    }
  },

  async create(employee: any) {
    if (!employee) {
      throw new Error("Employee data is required")
    }

    // Extract skills from employee data
    const { skills, ...employeeData } = employee

    try {
      // Start a Supabase transaction
      const { data: newEmployee, error: employeeError } = await supabase
        .from("employees")
        .insert(employeeData)
        .select()
        .single()

      if (employeeError) {
        console.error("Error creating employee:", employeeError)
        throw employeeError
      }

      // If skills are provided, add them to the employee_skills table
      if (skills && skills.length > 0 && newEmployee?.id) {
        const employeeSkills = skills.map((skill: { skill_id: string; proficiency_level: number }) => ({
          employee_id: newEmployee.id,
          skill_id: skill.skill_id,
          proficiency_level: skill.proficiency_level || 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))

        const { error: skillsError } = await supabase
          .from("employee_skills")
          .insert(employeeSkills)

        if (skillsError) {
          console.error("Error adding employee skills:", skillsError)
          // We don't throw here since the employee was created successfully
          // Instead, we log the error and continue
        }
      }

      // Fetch the employee with their skills
      const { data: employeeWithSkills, error: fetchError } = await supabase
        .from("employees")
        .select(`
          *,
          employee_skills (
            skill_id,
            proficiency_level,
            skills (
              id,
              name,
              category
            )
          )
        `)
        .eq("id", newEmployee.id)
        .single()

      if (fetchError) {
        console.error("Error fetching employee with skills:", fetchError)
        // Return the employee without skills if we can't fetch them
        return newEmployee
      }

      return employeeWithSkills
    } catch (error) {
      console.error("Error in create employee transaction:", error)
      throw error
    }
  },

  async update(id: string, updates: EmployeeUpdate) {
    try {
      console.log(`Updating employee ${id} with:`, updates)
      const res = await fetch(`/api/employees/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })
      
      console.log(`PATCH /api/employees/${id} response:`, res.status)
      
      if (!res.ok) {
        const error = await res.json()
        console.error("Error updating employee:", error)
        throw new Error(error.message || "Failed to update employee")
      }
      
      const data = await res.json()
      console.log("Updated employee:", data)
      return data
    } catch (error) {
      console.error("Error in update:", error)
      throw error
    }
  },

  async delete(id: string) {
    try {
      console.log(`Deleting employee ${id}`)
      const res = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
      })
      
      console.log(`DELETE /api/employees/${id} response:`, res.status)
      
      if (!res.ok) {
        const error = await res.json()
        console.error("Error deleting employee:", error)
        throw new Error(error.message || "Failed to delete employee")
      }
      
      console.log("Employee deleted successfully")
      return true
    } catch (error) {
      console.error("Error in delete:", error)
      throw error
    }
  },

  async search(query: string) {
    try {
      const res = await fetch(`/api/employees/search?q=${encodeURIComponent(query)}`)
      console.log(`GET /api/employees/search response:`, res.status)
      
      if (!res.ok) {
        const error = await res.json()
        console.error("Error searching employees:", error)
        throw new Error(error.message || "Failed to search employees")
      }
      
      const data = await res.json()
      console.log("Search results:", data)
      return data
    } catch (error) {
      console.error("Error in search:", error)
      throw error
    }
  },
}
