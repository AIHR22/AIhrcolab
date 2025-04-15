"use client"

import { Session } from "@supabase/supabase-js"
import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react"
// Update import to use the consolidated client file
import { getSupabase } from "@/lib/supabaseClient"
import { Database } from "@/types/supabase"
import { createTenantAwareClient, getCurrentTenantContext } from "@/lib/supabase/tenant-context"

// Define the shape of the context data
interface AuthContextType {
  session: Session | null
  user: Session['user'] | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// This function ensures we always have a Supabase client available
const getSupabaseClient = () => {
  // Use the exported function from the consolidated client file
  return getSupabase()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = getSupabaseClient() // Get the client instance
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true;

    const initializeTenantContext = async (currentSession: Session | null) => {
      if (!mounted) return
      
      if (!currentSession) {
        setSession(null)
        return
      }

      try {
        const tenantContext = await getCurrentTenantContext()
        if (!tenantContext) {
          console.error('No tenant context available')
          return
        }

        // For platform admin, we don't need tenant-specific client
        if (tenantContext.role === 'platform_admin') {
          setSession(currentSession)
          return
        }

        // Create a tenant-aware client and use it for subsequent requests
        const client = createTenantAwareClient(tenantContext.tenantId)
        
        // Update session with tenant context
        const updatedSession = {
          ...currentSession,
          user: {
            ...currentSession.user,
            app_metadata: {
              ...currentSession.user.app_metadata,
              tenantId: tenantContext.tenantId
            }
          }
        }
        setSession(updatedSession)
      } catch (error) {
        console.error('Error initializing tenant context:', error)
        // Don't automatically sign out on tenant context error
        // Just log the error and keep the session
      }
    }

    // Store the initializeTenantContext function in the ref
    initializeTenantContextRef.current = initializeTenantContext

    const fetchSession = async () => {
      if (!mounted) return
      
      try {
        const { data: { session } } = await supabase.auth.getSession()
        await initializeTenantContext(session)
      } catch (error) {
        console.error('Error fetching session:', error)
        // Don't clear session on fetch error
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, 'Session:', session ? 'exists' : 'null')
      if (event === 'SIGNED_OUT') {
        setSession(null)
        return
      }
      await initializeTenantContext(session)
    })

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe()
    }
  }, [supabase]) // Add supabase as a dependency

  const initializeTenantContextRef = useRef<((session: Session | null) => Promise<void>) | null>(null)
  const [signInFn, setSignInFn] = useState<((email: string, password: string) => Promise<void>) | null>(null)

  const signOut = async () => {
    await supabase.auth.signOut()
    setSession(null) // Clear session locally on sign out
  }

  // Set up the signIn function
  useEffect(() => {
    setSignInFn(() => async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (initializeTenantContextRef.current) {
        await initializeTenantContextRef.current(data.session)
      }
    })
  }, [supabase])

  // Memoize the context value to prevent unnecessary re-renders
  const value = {
    session,
    user: session?.user ?? null,
    signIn: signInFn || (async () => { throw new Error('Auth not initialized') }),
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <div>Loading auth...</div>} 
    </AuthContext.Provider>
  )
}

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

