import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase URL or Anon Key")
}

// Create a single supabase client for interacting with your database
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

// Singleton instance for the server-side admin client (service role key)
let supabaseAdminInstance: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseAdmin() {
  // This function should only be called on the server side.
  if (typeof window !== "undefined") {
    console.error(
      "Security Alert: getSupabaseAdmin() was called on the client-side!"
    )
    // Optionally throw an error or return null/anon client, but logging error is crucial.
    throw new Error("Cannot initialize admin client on the client-side.")
  }

  if (supabaseAdminInstance) {
    return supabaseAdminInstance
  }

  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!url || !supabaseServiceKey) {
    console.error(
      "Missing Supabase URL or Service Role Key for admin client. Check environment variables."
    )
    throw new Error("Missing Supabase URL or Service Role Key for admin client")
  }

  supabaseAdminInstance = createClient<Database>(url, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return supabaseAdminInstance
}

// Export the client
export { supabase }
export const getSupabase = () => supabase

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
