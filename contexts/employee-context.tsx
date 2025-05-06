"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

// Define the Employee interface
export interface Employee {
  id: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  position?: string
  department?: string
  hire_date?: string
  status?: string
  manager_id?: string | null
  avatar_url?: string
  address?: string
  bio?: string
  team?: string
  username?: string
  role?: string
  created_at?: string
  updated_at?: string
}

// Define the context type
interface EmployeeContextType {
  employees: Employee[]
  loading: boolean
  error: Error | null
  addEmployee: (employee: Omit<Employee, "id" | "created_at" | "updated_at">) => Promise<Employee | null>
  updateEmployee: (id: string, employee: Partial<Employee>) => Promise<Employee | null>
  deleteEmployee: (id: string) => Promise<boolean>
  getEmployee: (id: string) => Promise<Employee | null>
  refreshEmployees: () => Promise<void>
}

// Create the context
const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined)

// Provider component
export function EmployeeProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  // Fetch employees on mount
  useEffect(() => {
    refreshEmployees()
  }, [])

  // Refresh employees from the database
  const refreshEmployees = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("employees").select("*").order("created_at", { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      setEmployees(data || [])
      setError(null)
    } catch (err: any) {
      setError(err)
      toast({
        title: "Error loading employees",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Add a new employee
  const addEmployee = async (employee: Omit<Employee, "id" | "created_at" | "updated_at">) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("employees").insert([employee]).select().single()

      if (error) {
        throw new Error(error.message)
      }

      setEmployees((prev) => [data, ...prev])
      return data
    } catch (err: any) {
      setError(err)
      toast({
        title: "Error adding employee",
        description: err.message,
        variant: "destructive",
      })
      return null
    } finally {
      setLoading(false)
    }
  }

  // Update an existing employee
  const updateEmployee = async (id: string, updatedData: Partial<Employee>) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("employees").update(updatedData).eq("id", id).select().single()

      if (error) {
        throw new Error(error.message)
      }

      setEmployees((prev) => prev.map((employee) => (employee.id === id ? data : employee)))
      return data
    } catch (err: any) {
      setError(err)
      toast({
        title: "Error updating employee",
        description: err.message,
        variant: "destructive",
      })
      return null
    } finally {
      setLoading(false)
    }
  }

  // Delete an employee
  const deleteEmployee = async (id: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.from("employees").delete().eq("id", id)

      if (error) {
        throw new Error(error.message)
      }

      setEmployees((prev) => prev.filter((employee) => employee.id !== id))
      return true
    } catch (err: any) {
      setError(err)
      toast({
        title: "Error deleting employee",
        description: err.message,
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  // Get a specific employee by ID
  const getEmployee = async (id: string) => {
    try {
      // First check if we already have it in state
      const existingEmployee = employees.find((emp) => emp.id === id)
      if (existingEmployee) return existingEmployee

      // Otherwise fetch from database
      const { data, error } = await supabase.from("employees").select("*").eq("id", id).single()

      if (error) {
        throw new Error(error.message)
      }

      return data
    } catch (err: any) {
      setError(err)
      toast({
        title: "Error fetching employee",
        description: err.message,
        variant: "destructive",
      })
      return null
    }
  }

  return (
    <EmployeeContext.Provider
      value={{
        employees,
        loading,
        error,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        getEmployee,
        refreshEmployees,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  )
}

// Custom hook to use the employee context
export function useEmployees() {
  const context = useContext(EmployeeContext)
  if (context === undefined) {
    throw new Error("useEmployees must be used within an EmployeeProvider")
  }
  return context
}

