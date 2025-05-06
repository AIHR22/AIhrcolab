"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { Employee } from "@/types/employees"

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchEmployees = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.from("employees").select("*").order("last_name", { ascending: true })

      if (error) throw error
      setEmployees(data || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch employees"))
      console.error("Error fetching employees:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const addEmployee = async (employee: Omit<Employee, "id">) => {
    try {
      const { data, error } = await supabase.from("employees").insert([employee]).select()

      if (error) throw error
      setEmployees([...employees, data[0]])
      return data[0]
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to add employee"))
      console.error("Error adding employee:", err)
      throw err
    }
  }

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      const { data, error } = await supabase.from("employees").update(updates).eq("id", id).select()

      if (error) throw error
      setEmployees(employees.map((emp) => (emp.id === id ? { ...emp, ...updates } : emp)))
      return data[0]
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to update employee"))
      console.error("Error updating employee:", err)
      throw err
    }
  }

  const deleteEmployee = async (id: string) => {
    try {
      const { error } = await supabase.from("employees").delete().eq("id", id)

      if (error) throw error
      setEmployees(employees.filter((emp) => emp.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to delete employee"))
      console.error("Error deleting employee:", err)
      throw err
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  return {
    employees,
    isLoading,
    error,
    fetchEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
  }
}

