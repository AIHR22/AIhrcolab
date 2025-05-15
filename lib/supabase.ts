import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"
import { getAuthConfig } from './supabase/auth-config'

// Check and provide fallbacks for environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Debug environment variables (without exposing full keys)
if (typeof window === 'undefined') { // Only log server-side
  console.log("[SUPABASE CONFIG] URL exists:", !!supabaseUrl);
  console.log("[SUPABASE CONFIG] Anon key exists:", !!supabaseAnonKey);
  console.log("[SUPABASE CONFIG] Service key exists:", !!supabaseServiceKey);
  
  if (supabaseUrl) {
    console.log("[SUPABASE CONFIG] URL prefix:", supabaseUrl.split('.')[0]);
  }
}

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
  try {
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      ...getAuthConfig(),
      auth: {
        ...getAuthConfig().auth,
        // Additional client-specific settings
        autoRefreshToken: true,
      }
    })
    console.log("[SUPABASE] Client-side client initialized successfully");
  } catch (e) {
    console.error("[SUPABASE] Failed to initialize client-side client:", e);
    supabase = null;
  }
}

// For server-side operations, create a function that safely initializes the admin client
function getSupabaseAdmin() {
  // Only create admin client on the server side
  if (typeof window === 'undefined') {
    if (!supabaseServiceKey) {
      console.error('Missing Supabase service role key. Check your environment variables.')
      return null;
    }
    
    if (!supabaseUrl) {
      console.error('Missing Supabase URL. Check your environment variables.')
      return null;
    }

    try {
      const adminClient = createClient<Database>(supabaseUrl, supabaseServiceKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      console.log("[SUPABASE] Server-side admin client initialized successfully");
      return adminClient;
    } catch (e) {
      console.error("[SUPABASE] Failed to initialize server-side admin client:", e);
      return null;
    }
  } else {
    console.warn("Attempted to use supabaseAdmin on the client side. This is not allowed.")
    // Return the regular client instead
    return supabase;
  }
}

// Export the client instances
export { supabase }

// Export the admin client getter function
export { getSupabaseAdmin }

// For backward compatibility, but will use the safe version on client side
let supabaseAdminInstance: ReturnType<typeof createClient<Database>> | null = null;

try {
  if (typeof window === 'undefined') {
    supabaseAdminInstance = getSupabaseAdmin();
  } else {
    supabaseAdminInstance = supabase;
  }
} catch (e) {
  console.error("[SUPABASE] Failed to initialize supabaseAdmin:", e);
  supabaseAdminInstance = null;
}

export const supabaseAdmin = supabaseAdminInstance;
