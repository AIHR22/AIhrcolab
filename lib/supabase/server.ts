import { createServerSupabaseClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from "@/types/supabase"
import type { NextApiRequest, NextApiResponse } from 'next'
import { cookies } from 'next/headers'

// Server-side Supabase client for API routes
export function createServerClient(req: NextApiRequest, res: NextApiResponse) {
  return createServerSupabaseClient<Database>({ 
    req, 
    res,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!
  })
}

// New function for Server Components
export const createSupabaseServerComponentClient = () => {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({
    // URL and Key are automatically picked up from environment variables
    cookies: () => cookieStore,
    cookieOptions: {
      name: 'sb-auth-token',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      domain: process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_COOKIE_DOMAIN
        ? process.env.NEXT_PUBLIC_COOKIE_DOMAIN
        : undefined, // Let browser default for localhost or if no domain specified
    }
    // Other Supabase client options can be added here if needed
  })
}

// Admin client (service role key) - server-side only
export function createAdminSupabase() {
  // This function should only be called on the server side.
  if (typeof window !== "undefined") {
    console.error(
      "Security Alert: createAdminSupabase() was called on the client-side!"
    )
    throw new Error("Cannot initialize admin client on the client-side.")
  }

  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!url || !supabaseServiceKey) {
    console.error(
      "Missing Supabase URL or Service Role Key for admin client. Check environment variables."
    )
    throw new Error("Supabase admin client cannot be initialized.")
  }

  return createServerSupabaseClient<Database>({
    supabaseUrl: url,
    supabaseKey: supabaseServiceKey,
    options: {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  })
} 