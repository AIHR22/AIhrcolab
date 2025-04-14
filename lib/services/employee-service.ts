import type { Database } from "@/lib/database.types"

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

  async create(employee: NewEmployee) {
    try {
      console.log("Creating employee with data:", employee)
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(employee),
      })
      
      console.log("POST /api/employees response:", res.status)
      
      if (!res.ok) {
        const error = await res.json()
        console.error("Error creating employee:", error)
        throw new Error(error.message || "Failed to create employee")
      }
      
      const data = await res.json()
      console.log("Created employee:", data)
      return data
    } catch (error) {
      console.error("Error in create:", error)
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
