import { supabase } from "@/lib/supabaseClient"

export async function makePostgrestRequest(method: string, path: string, body?: any) {
  // Get the current session
  const { data: { session } } = await supabase.auth.getSession()
  
  // Get the anon key from the environment
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Prepare headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': anonKey || '', // Add the anon key as apikey header
    'Prefer': 'return=minimal'
  }

  // If we have a session, add the auth header
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }

  // Make the request
  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  })

  // Parse the response
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to make PostgREST request')
  }

  // Return the response
  return response.headers.get('content-type')?.includes('application/json')
    ? response.json()
    : response.text()
} 