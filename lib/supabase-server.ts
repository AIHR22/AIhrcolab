import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { Database } from "@/types/supabase"
import { getAuthConfig } from './supabase/auth-config'

export function createServerClient(req: NextApiRequest, res: NextApiResponse) {
  return createServerSupabaseClient<Database>({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    options: getAuthConfig(),
    req,
    res
  })
} 