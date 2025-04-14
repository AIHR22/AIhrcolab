import { NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    // Log all environment variables (excluding sensitive values)
    const envVars = Object.keys(process.env).reduce((acc, key) => {
      if (key.startsWith('NEXT_PUBLIC_') || key.startsWith('SUPABASE_')) {
        acc[key] = key.includes('KEY') ? '[HIDDEN]' : process.env[key] || ''
      }
      return acc
    }, {} as Record<string, string>)
    
    console.log('[TEST] Environment variables:', envVars)

    // Get Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Test connection
    const { data, error } = await supabase
      .from('employees')
      .select('count')
      .limit(1)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        supabaseUrl,
        hasServiceKey: !!supabaseKey,
        testQuery: data
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error: any) {
    console.error('[TEST] Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.details || error.hint || null,
      code: error.code || null
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}
