import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from "@/types/supabase"
import { getAuthConfig } from './supabase/auth-config'

export const supabase = createBrowserSupabaseClient<Database>({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  options: getAuthConfig()
}) 