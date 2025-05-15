export const getAuthConfig = () => ({
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    flowType: 'pkce',
    detectSessionInUrl: true,
    cookieOptions: {
      name: 'sb-auth-token',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    }
  }
})

// Helper to determine if we're in a secure context
export const isSecureContext = () => {
  if (typeof window === 'undefined') {
    // Server-side
    return process.env.NODE_ENV === 'production'
  }
  // Client-side
  return window.location.protocol === 'https:'
}

// Get the base URL for auth redirects
export const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side
    return window.location.origin
  }
  // Server-side
  if (process.env.NODE_ENV === 'production') {
    return 'https://qwdekbxaigeajvbqvjha.supabase.co'
  }
  return 'http://localhost:3000'
} 