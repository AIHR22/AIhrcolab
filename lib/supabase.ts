import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Check and provide fallbacks for environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// In development, log warnings if environment variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing Supabase environment variables. Check your .env.local file.'
  )
}

// Create a singleton instance of the Supabase client to avoid multiple instances
let supabase: ReturnType<typeof createClient<Database>> | null = null

// Initialize the Supabase client if it doesn't exist yet
if (typeof window !== 'undefined' && !supabase) {
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
}

// For server-side operations, create a function that safely initializes the admin client
function getSupabaseAdmin() {
  // Only create admin client on the server side
  if (typeof window === 'undefined') {
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    
    if (!supabaseServiceKey) {
      console.error('Missing Supabase service role key. Check your environment variables.')
      throw new Error('Missing Supabase service role key')
    }
    
    return createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
      },
    })
  } else {
    console.warn("Attempted to use supabaseAdmin on the client side. This is not allowed.")
    // Return the regular client instead
    return supabase || createClient<Database>(supabaseUrl, supabaseAnonKey)
  }
}

// Export the client instances
export { supabase }

// Export the admin client getter function
export { getSupabaseAdmin }

// For backward compatibility, but will use the safe version on client side
export const supabaseAdmin = typeof window === 'undefined' ? getSupabaseAdmin() : (supabase || createClient<Database>(supabaseUrl, supabaseAnonKey))
