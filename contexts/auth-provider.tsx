"use client"

import { Session, AuthError } from "@supabase/supabase-js"
import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { getSupabase } from "@/lib/supabaseClient"
import { Database } from "@/types/supabase"
import { createTenantAwareClient, getCurrentTenantContext } from "@/lib/supabase/tenant-context"

interface AuthContextType {
  session: Session | null
  user: Session['user'] | null
  client: ReturnType<typeof getSupabase>
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<{ success: boolean, message: string }>
  signOut: () => Promise<void>
  error: Error | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Keep the base client immutable
const baseClient = getSupabase()

// Rate limiting map
const loginAttempts = new Map<string, { count: number; timestamp: number }>()
const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [client, setClient] = useState(baseClient)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const checkRateLimit = (email: string): boolean => {
    const now = Date.now()
    const userAttempts = loginAttempts.get(email)

    if (userAttempts) {
      if (now - userAttempts.timestamp < LOCKOUT_DURATION) {
        if (userAttempts.count >= MAX_ATTEMPTS) {
          throw new Error(`Too many login attempts. Please try again in ${Math.ceil((LOCKOUT_DURATION - (now - userAttempts.timestamp)) / 60000)} minutes.`)
        }
        userAttempts.count++
      } else {
        loginAttempts.set(email, { count: 1, timestamp: now })
      }
    } else {
      loginAttempts.set(email, { count: 1, timestamp: now })
    }

    return true
  }

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Check rate limiting
      checkRateLimit(email.toLowerCase())

      // First, try to sign in
      const { data, error } = await baseClient.auth.signInWithPassword({
        email: email.toLowerCase(),
        password
      })

      if (error) {
        if (error instanceof AuthError) {
          switch (error.status) {
            case 400:
              throw new Error('Invalid email or password')
            case 422:
              throw new Error('Email not verified. Please check your inbox.')
            default:
              throw new Error('Authentication failed. Please try again.')
          }
        }
        throw error
      }

      if (!data.session) throw new Error('No session after sign in')

      // Verify email is confirmed
      if (!data.user?.email_confirmed_at) {
        throw new Error('Please verify your email address before signing in')
      }

      // Set session first
      setSession(data.session)

      // Check user profile first - use single row select
      const { data: profile, error: profileError } = await baseClient
        .from('user_profiles')
        .select('*')
        .eq('user_id', data.session.user.id)
        .limit(1)
        .maybeSingle()

      if (profileError) {
        console.error('Error checking user profile:', profileError)
        throw new Error('Error verifying account status')
      }

      if (!profile) {
        throw new Error('User profile not found')
      }

      // Now check tenant associations
      const { data: tenantUsers, error: tenantError } = await baseClient
        .from('tenant_users')
        .select('tenant_id, role')
        .eq('user_id', data.session.user.id)
        .limit(1)
        .maybeSingle()

      if (tenantError) {
        console.error('Error checking tenant access:', tenantError)
        // Don't throw here - user might not have tenant yet
      }

      // If user has a tenant, set up tenant-aware client
      if (tenantUsers?.tenant_id) {
        try {
          const tenantClient = await createTenantAwareClient(tenantUsers.tenant_id)
          setClient(tenantClient)
        } catch (error) {
          console.error('Error setting up tenant client:', error)
          // Don't throw - fall back to base client
        }
      }

      // Reset login attempts on successful login
      loginAttempts.delete(email.toLowerCase())

      router.push('/dashboard')
    } catch (error) {
      console.error('Sign in error:', error)
      setError(error instanceof Error ? error : new Error('Failed to sign in'))
      setSession(null)
      setClient(baseClient)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // First create the user
      const { data, error } = await baseClient.auth.signUp({
        email: email.toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error
      if (!data.user) throw new Error('No user data after signup')

      // Create default tenant and membership using the API route
      const response = await fetch('/api/create-default-tenant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: data.user.id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Error setting up account: ${errorData.error}`)
      }

      return {
        success: true,
        message: 'Please check your email for verification link'
      }
    } catch (error) {
      console.error('Sign up error:', error)
      setError(error instanceof Error ? error : new Error('Failed to sign up'))
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to sign up'
      }
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setIsLoading(true)
      setError(null)
      await baseClient.auth.signOut()
      setSession(null)
      setClient(baseClient)
      router.push('/login')
    } catch (error) {
      console.error('Sign out error:', error)
      setError(error instanceof Error ? error : new Error('Failed to sign out'))
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Check for existing session on mount
    baseClient.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session)
        getCurrentTenantContext().then(tenantContext => {
          if (tenantContext?.tenantId) {
            createTenantAwareClient(tenantContext.tenantId).then(setClient)
          }
        })
      }
    })

    // Set up auth state listener
    const { data: { subscription } } = baseClient.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (event === 'SIGNED_OUT') {
          setSession(null)
          setClient(baseClient)
          router.push('/login')
        }
        // Only handle sign out - sign in is handled by the signIn function
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        client,
        signIn,
        signUp,
        signOut,
        error,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
