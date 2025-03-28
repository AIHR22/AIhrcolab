"use client"

import { createContext, useContext, type ReactNode, useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "@/hooks/use-toast"
import type { Employee, TimeOffRequest, Review } from "@/lib/supabaseClient"

interface DataContextType {
  employees: Employee[]
  timeOffRequests: TimeOffRequest[]
  reviews: Review[]
  loading: {
    employees: boolean
    timeOffRequests: boolean
    reviews: boolean
  }
  error: {
    employees: Error | null
    timeOffRequests: Error | null
    reviews: Error | null
  }
  refreshData: () => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>([])
  const [reviews, setReviews] = useState<Review[]>([])

  const [loading, setLoading] = useState({
    employees: true,
    timeOffRequests: true,
    reviews: true,
  })

  const [error, setError] = useState({
    employees: null as Error | null,
    timeOffRequests: null as Error | null,
    reviews: null as Error | null,
  })

  const fetchEmployees = async () => {
    if (!supabase) return

    try {
      setLoading((prev) => ({ ...prev, employees: true }))
      const { data, error: fetchError } = await supabase.from("employees").select("*")

      if (fetchError) {
        console.error("Error fetching employees:", fetchError.message)
        setError((prev) => ({ ...prev, employees: new Error(fetchError.message) }))
        toast({
          title: "Error fetching employees",
          description: "Could not load employee data. Please try again later.",
          variant: "destructive",
        })
      } else {
        setEmployees(data || [])
        setError((prev) => ({ ...prev, employees: null }))
      }
    } catch (err) {
      console.error("Unexpected error fetching employees:", err)
      setError((prev) => ({ ...prev, employees: err instanceof Error ? err : new Error(String(err)) }))
      toast({
        title: "Error fetching employees",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading((prev) => ({ ...prev, employees: false }))
    }
  }

  const fetchTimeOffRequests = async () => {
    if (!supabase) return

    try {
      setLoading((prev) => ({ ...prev, timeOffRequests: true }))
      const { data, error: fetchError } = await supabase.from("time_off_requests").select("*")

      if (fetchError) {
        console.error("Error fetching time off requests:", fetchError.message)
        setError((prev) => ({ ...prev, timeOffRequests: new Error(fetchError.message) }))
        toast({
          title: "Error fetching time off requests",
          description: "Could not load time off request data. Please try again later.",
          variant: "destructive",
        })
      } else {
        setTimeOffRequests(data || [])
        setError((prev) => ({ ...prev, timeOffRequests: null }))
      }
    } catch (err) {
      console.error("Unexpected error fetching time off requests:", err)
      setError((prev) => ({ ...prev, timeOffRequests: err instanceof Error ? err : new Error(String(err)) }))
      toast({
        title: "Error fetching time off requests",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading((prev) => ({ ...prev, timeOffRequests: false }))
    }
  }

  const fetchReviews = async () => {
    if (!supabase) return

    try {
      setLoading((prev) => ({ ...prev, reviews: true }))
      const { data, error: fetchError } = await supabase.from("reviews").select("*")

      if (fetchError) {
        console.error("Error fetching reviews:", fetchError.message)
        setError((prev) => ({ ...prev, reviews: new Error(fetchError.message) }))
        toast({
          title: "Error fetching reviews",
          description: "Could not load review data. Please try again later.",
          variant: "destructive",
        })
      } else {
        setReviews(data || [])
        setError((prev) => ({ ...prev, reviews: null }))
      }
    } catch (err) {
      console.error("Unexpected error fetching reviews:", err)
      setError((prev) => ({ ...prev, reviews: err instanceof Error ? err : new Error(String(err)) }))
      toast({
        title: "Error fetching reviews",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading((prev) => ({ ...prev, reviews: false }))
    }
  }

  const refreshData = async () => {
    await Promise.all([fetchEmployees(), fetchTimeOffRequests(), fetchReviews()])
  }

  useEffect(() => {
    refreshData()
  }, [])

  return (
    <DataContext.Provider
      value={{
        employees,
        timeOffRequests,
        reviews,
        loading,
        error,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}

