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
      
      const isDev = process.env.NODE_ENV === 'development';
      console.debug('[Auth Debug] initializeTenantContext called', { 
        hasSession: !!currentSession,
        isDev,
        currentUserId: currentSession?.user?.id
      });
      
      // In development, don't clear session if tenant context isn't available yet
      if (!currentSession) {
        if (!isDev) {
          console.debug('[Auth Debug] Clearing session in production due to no current session');
          setSession(null)
        } else {
          console.debug('[Auth Debug] Preserving session in development despite no current session');
        }
        return
      }

      try {
        const tenantContext = await getCurrentTenantContext()
        if (!tenantContext) {
          console.error('[Auth Debug] No tenant context available')
          // In development, keep the session even without tenant context
          if (process.env.NODE_ENV === 'development') {
            console.debug('[Auth Debug] Preserving session in development despite no tenant context');
            setSession(currentSession)
          } else {
            console.debug('[Auth Debug] Would clear session in production due to no tenant context');
          }
          return
        }
        console.debug('[Auth Debug] Tenant context found:', { 
          role: tenantContext.role,
          tenantId: tenantContext.tenantId 
        });

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
        console.debug('[Auth Debug] Fetching session...');
        const { data: { session } } = await supabase.auth.getSession()
        
        console.debug('[Auth Debug] Session fetch result:', { 
          hasSession: !!session,
          userId: session?.user?.id,
          isDev: process.env.NODE_ENV === 'development'
        });
        
        // In development, set session immediately
        if (process.env.NODE_ENV === 'development' && session) {
          console.debug('[Auth Debug] Setting session immediately in development');
          setSession(session)
        }
        
        await initializeTenantContext(session)
      } catch (error) {
        console.error('[Auth Debug] Error fetching session:', error)
        // Don't clear session on fetch error
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const isDev = process.env.NODE_ENV === 'development';
      console.debug('[Auth Debug] Auth state changed:', { 
        event, 
        hasSession: !!session,
        userId: session?.user?.id,
        isDev
      });
      
      // Only clear session on explicit sign out in development mode
      if (event === 'SIGNED_OUT') {
        if (!isDev || event === 'SIGNED_OUT') {
          console.debug('[Auth Debug] Clearing session on sign out');
          setSession(null)
        } else {
          console.debug('[Auth Debug] Preserving session in development despite SIGNED_OUT event');
        }
        return
      }

      // In development, set session immediately before tenant context
      if (isDev && session) {
        console.debug('[Auth Debug] Setting session immediately in development');
        setSession(session)
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
    console.debug('[Auth Debug] Signing out...');
    await supabase.auth.signOut()
    console.debug('[Auth Debug] Clearing session on explicit sign out');
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

