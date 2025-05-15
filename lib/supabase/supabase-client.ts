import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from "./database.types"

// Create a singleton instance of the Supabase client
let supabase: ReturnType<typeof createBrowserSupabaseClient<Database>> | null = null

// Export the createClient function with the correct name
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  if (!supabase) {
    supabase = createBrowserSupabaseClient<Database>({
      supabaseUrl: supabaseUrl,
      supabaseKey: supabaseKey,
      options: { 
        auth: { 
          persistSession: true, 
          detectSessionInUrl: true 
        } 
      }
    })
  }

  return supabase
}

// Also export a singleton instance for convenience
export const supabaseClient = createClient()

