import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient as createClientNoSSR } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

export function createClient() {
  const cookieStore = cookies()
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Cookie cannot be set inside a try/catch block in middleware
            // https://github.com/vercel/next.js/discussions/49245
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Cookie cannot be removed inside a try/catch block in middleware
          }
        },
      },
    }
  )
}

// For cases where we need admin access (like server actions or API routes)
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }
  
  return createClientNoSSR<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
} 