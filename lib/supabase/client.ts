import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { type Database } from '@/types/supabase'

// Client-side Supabase client (to be used in components)
export const createClient = () => {
  return createClientComponentClient<Database>({
    // URL and Key are automatically picked up from environment variables:
    // NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
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

// Admin client for server-side operations that need elevated privileges
export const createAdminClient = () => {
  if (typeof window !== 'undefined') {
    throw new Error('Admin client cannot be created on the client side')
  }

  // For admin operations, we use the direct Supabase client with service role key
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
} 