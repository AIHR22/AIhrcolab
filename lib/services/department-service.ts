import type { Database } from "@/lib/database.types"

type Department = Database["public"]["Tables"]["departments"]["Row"]
type NewDepartment = Database["public"]["Tables"]["departments"]["Insert"]
type DepartmentUpdate = Database["public"]["Tables"]["departments"]["Update"]

export const departmentService = {
  async getAll(): Promise<Department[]> {
    try {
      console.log('[Service] Fetching departments...')
      const response = await fetch('/api/departments', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        // Add cache control to prevent caching issues
        cache: 'no-store'
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('[Service] Error fetching departments:', errorData)
        throw new Error(`Failed to fetch departments: ${errorData.error || response.statusText}`)
      }

      const data = await response.json()
      console.log('[Service] Departments fetched successfully:', data.length)
      return data
    } catch (error) {
      console.error('[Service] Error in getAll():', error)
      throw error
    }
  },

  async getById(id: string): Promise<Department> {
    try {
      const res = await fetch(`/api/departments/${id}`)
      console.log(`GET /api/departments/${id} response:`, res.status)
      
      if (!res.ok) {
        const error = await res.json()
        console.error("Error fetching department:", error)
        throw new Error(error.message || "Failed to fetch department")
      }
      
      const data = await res.json()
      console.log("Fetched department:", data)
      return data
    } catch (error) {
      console.error("Error in getById:", error)
      throw error
    }
  },

  async create(department: NewDepartment): Promise<Department> {
    try {
      console.log("Creating department with data:", department)
      const res = await fetch("/api/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(department),
      })
      
      console.log("POST /api/departments response:", res.status)
      
      if (!res.ok) {
        const error = await res.json()
        console.error("Error creating department:", error)
        throw new Error(error.message || "Failed to create department")
      }
      
      const data = await res.json()
      console.log("Created department:", data)
      return data
    } catch (error) {
      console.error("Error in create:", error)
      throw error
    }
  },

  async update(id: string, updates: DepartmentUpdate): Promise<Department> {
    try {
      console.log(`Updating department ${id} with data:`, updates)
      const res = await fetch(`/api/departments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })
      
      console.log(`PUT /api/departments/${id} response:`, res.status)
      
      if (!res.ok) {
        const error = await res.json()
        console.error("Error updating department:", error)
        throw new Error(error.message || "Failed to update department")
      }
      
      const data = await res.json()
      console.log("Updated department:", data)
      return data
    } catch (error) {
      console.error("Error in update:", error)
      throw error
    }
  },

  async delete(id: string): Promise<void> {
    try {
      console.log(`Deleting department ${id}`)
      const res = await fetch(`/api/departments/${id}`, {
        method: "DELETE",
      })
      
      console.log(`DELETE /api/departments/${id} response:`, res.status)
      
      if (!res.ok) {
        const error = await res.json()
        console.error("Error deleting department:", error)
        throw new Error(error.message || "Failed to delete department")
      }
      
      console.log("Department deleted successfully")
    } catch (error) {
      console.error("Error in delete:", error)
      throw error
    }
  }
}
