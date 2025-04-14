import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a singleton instance for the client
let supabaseInstance: ReturnType<typeof createClient> | null = null

// Only create supabaseAdmin on the server side
let supabaseAdminInstance: ReturnType<typeof createClient> | null = null

export function getSupabase() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
}

export function getSupabaseAdmin() {
  // Make sure we're on the server side
  if (typeof window === 'undefined') {
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    if (!supabaseAdminInstance) {
      supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    }
    return supabaseAdminInstance
  } else {
    console.warn("Attempted to use supabaseAdmin on the client side. This is not allowed.")
    // Return the regular client instead
    return getSupabase()
  }
}

// For backward compatibility - direct exports of the clients
export const supabase = getSupabase()

// Only export supabaseAdmin if we're on the server side
export const supabaseAdmin = typeof window === 'undefined' ? getSupabaseAdmin() : supabase

export type Employee = {
  id: string
  employee_id: string
  name: string
  email: string
  phone?: string
  position: string
  department_id: string
  status: "active" | "on_leave" | "terminated"
  hire_date: string
  termination_date?: string
  salary: number
  address?: string
  emergency_contact?: string
  notes?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface TimeOffRequest {
  id: string
  employee_id: string
  start_date: string
  end_date: string
  type: string
  reason: string
  notes?: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  employee_id: string
  reviewer_id: string
  review_date: string
  performance_score: number
  strengths: string
  areas_for_improvement: string
  goals: string
  comments: string
  created_at: string
  updated_at: string
}
