import { supabase } from "./supabase-client"
import type { Database } from "./database.types"
import { createClient } from "@/lib/supabase/supabase-client"

// Employee API
export async function getEmployees() {
  const { data, error } = await supabase.from("employees").select("*").order("start_date", { ascending: false })

  if (error) throw error
  return data
}

// Function to get recent hires
export async function getRecentHires(limit = 5) {
  const client = createClient()

  const { data, error } = await client
    .from("employees")
    .select("*")
    .order("start_date", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching recent hires:", error)
    throw new Error("Failed to fetch recent hires")
  }

  return data || []
}

export async function getEmployee(id: string) {
  const { data, error } = await supabase.from("employees").select("*").eq("id", id).single()

  if (error) throw error
  return data
}

export async function createEmployee(employee: Database["public"]["Tables"]["employees"]["Insert"]) {
  const { data, error } = await supabase.from("employees").insert(employee).select().single()

  if (error) throw error
  return data
}

export async function updateEmployee(id: string, updates: Database["public"]["Tables"]["employees"]["Update"]) {
  const { data, error } = await supabase.from("employees").update(updates).eq("id", id).select().single()

  if (error) throw error
  return data
}

export async function deleteEmployee(id: string) {
  const { error } = await supabase.from("employees").delete().eq("id", id)

  if (error) throw error
  return true
}

// Time Off Requests API
// Function to get time off requests
export async function getTimeOffRequests(limit = 5, status = "pending") {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("time_off_requests")
    .select("*, employees(name, avatar_url)")
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching time off requests:", error)
    throw new Error("Failed to fetch time off requests")
  }

  return data || []
}

export async function getPendingTimeOffRequests(limit = 4) {
  const { data, error } = await supabase
    .from("time_off_requests")
    .select(`
      *,
      employees (id, name, avatar_url)
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function updateTimeOffRequest(id: string, status: "approved" | "rejected") {
  const { data, error } = await supabase.from("time_off_requests").update({ status }).eq("id", id).select().single()

  if (error) throw error
  return data
}

// Reviews API
// Function to get upcoming reviews
export async function getUpcomingReviews(limit = 5) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("reviews")
    .select("*, employees(name, avatar_url)")
    .gt("review_date", new Date().toISOString())
    .order("review_date", { ascending: true })
    .limit(limit)

  if (error) {
    console.error("Error fetching upcoming reviews:", error)
    throw new Error("Failed to fetch upcoming reviews")
  }

  return data || []
}

export async function getUpcomingReviewsOld(limit = 4) {
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      *,
      employees!reviews_employee_id_fkey (id, name, avatar_url),
      employees!reviews_reviewer_id_fkey (id, name)
    `)
    .eq("status", "scheduled")
    .gte("scheduled_date", new Date().toISOString())
    .order("scheduled_date", { ascending: true })
    .limit(limit)

  if (error) throw error
  return data
}

// Projects API
export async function getProjects() {
  const { data, error } = await supabase
    .from("projects")
    .select(`
      *,
      project_members (
        *,
        employees (id, name, avatar_url, position)
      )
    `)
    .order("start_date", { ascending: false })

  if (error) throw error
  return data
}

// Company Settings API
// Function to get company settings
export async function getCompanySettings() {
  const supabase = createClient()

  const { data, error } = await supabase.from("company_settings").select("*").single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 is the error code for no rows returned
    console.error("Error fetching company settings:", error)
    throw new Error("Failed to fetch company settings")
  }

  return (
    data || {
      company_name: "HR Suite",
      logo_url: null,
      primary_color: "#0070f3",
      secondary_color: "#0070f3",
      contact_email: "contact@example.com",
      contact_phone: "+1 (555) 123-4567",
    }
  )
}

export async function updateCompanySettingsOld(updates: Database["public"]["Tables"]["company_settings"]["Update"]) {
  const { data, error } = await supabase
    .from("company_settings")
    .update(updates)
    .eq("id", "1") // Assuming there's only one company settings record
    .select()
    .single()

  if (error) throw error
  return data
}

// Function to update company settings
export async function updateCompanySettings(settings) {
  const supabase = createClient()

  const { data, error } = await supabase.from("company_settings").upsert(settings).select().single()

  if (error) {
    console.error("Error updating company settings:", error)
    throw new Error("Failed to update company settings")
  }

  return data
}

// Dashboard Stats
// Function to get dashboard stats
export async function getDashboardStats() {
  const supabase = createClient()

  // Get total employees
  const { count: totalEmployees, error: employeesError } = await supabase
    .from("employees")
    .select("*", { count: "exact", head: true })

  // Get pending time off requests
  const { count: pendingTimeOff, error: timeOffError } = await supabase
    .from("time_off_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  // Get upcoming reviews
  const { count: upcomingReviews, error: reviewsError } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .gt("review_date", new Date().toISOString())

  if (employeesError || timeOffError || reviewsError) {
    console.error("Error fetching dashboard stats:", { employeesError, timeOffError, reviewsError })
    throw new Error("Failed to fetch dashboard stats")
  }

  return {
    totalEmployees: totalEmployees || 0,
    pendingTimeOff: pendingTimeOff || 0,
    upcomingReviews: upcomingReviews || 0,
    newHires: 0, // This would require more complex query, simplified for now
  }
}

export async function getDashboardStatsOld() {
  // Get total employees
  const { count: employeeCount, error: employeeError } = await supabase
    .from("employees")
    .select("*", { count: "exact", head: true })

  if (employeeError) throw employeeError

  // Get open positions (this would be from a jobs table in a real app)
  // For demo purposes, we'll return a fixed number
  const openPositions = 24

  // Get pending time off requests
  const { count: timeOffCount, error: timeOffError } = await supabase
    .from("time_off_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  if (timeOffError) throw timeOffError

  // Get average salary
  const { data: salaryData, error: salaryError } = await supabase.from("employees").select("salary")

  if (salaryError) throw salaryError

  const averageSalary =
    salaryData.length > 0 ? salaryData.reduce((sum, emp) => sum + emp.salary, 0) / salaryData.length : 0

  return {
    employees: {
      total: employeeCount || 0,
      change: 3.5, // This would be calculated from historical data in a real app
      increasing: true,
    },
    openPositions: {
      total: openPositions,
      change: -8.2,
      increasing: false,
    },
    timeOffRequests: {
      total: timeOffCount || 0,
      change: 12.5,
      increasing: true,
    },
    averageSalary: {
      total: Math.round(averageSalary),
      change: 4.2,
      increasing: true,
    },
  }
}

// Add more API functions as needed

