"use client"

import { Session } from "@supabase/supabase-js"
import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/types/supabase"
import { createTenantAwareClient, getCurrentTenantContext } from "@/lib/supabase/tenant-context"

// Define the shape of the context data
interface AuthContextType {
  session: Session | null
  user: Session['user'] | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createClient())
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const initializeTenantContextRef = useRef<((currentSession: Session | null) => Promise<void>) | null>(null)

  useEffect(() => {
    let mounted = true

    const initializeTenantContext = async (currentSession: Session | null) => {
      if (!mounted) return
      
      if (!currentSession) {
        if (process.env.NODE_ENV !== 'development') {
          setSession(null)
        }
        return
      }

      try {
        const tenantContext = await getCurrentTenantContext()
        if (!tenantContext) {
          console.error('No tenant context available')
          if (process.env.NODE_ENV === 'development') {
            setSession(currentSession)
          }
          return
        }

        if (tenantContext.role === 'platform_admin') {
          setSession(currentSession)
          return
        }

        const updatedSession = {
          ...currentSession,
          user: {
            ...currentSession.user,
            app_metadata: {
              ...(currentSession.user.app_metadata || {}),
              tenantId: tenantContext.tenantId
            }
          }
        }
        setSession(updatedSession)
      } catch (error) {
        console.error('Error initializing tenant context:', error)
        if (mounted) setSession(currentSession)
      }
    }

    initializeTenantContextRef.current = initializeTenantContext

    const fetchCurrentSession = async () => {
      if (!mounted) return
      
      try {
        const { data: { session: fetchedSession } } = await supabase.auth.getSession()
        if (mounted) {
          if (process.env.NODE_ENV === 'development' && fetchedSession) {
            setSession(fetchedSession)
          }
          await initializeTenantContext(fetchedSession)
        }
      } catch (error) {
        console.error('Error fetching session:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchCurrentSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return
      console.log('Auth state changed:', _event, 'Session:', newSession ? 'exists' : 'null')
      
      if (_event === 'SIGNED_OUT') {
        setSession(null)
        return
      }
      if (process.env.NODE_ENV === 'development' && newSession) {
        setSession(newSession)
      }
      await initializeTenantContext(newSession)
      setLoading(false)
    })

    return () => {
      mounted = false
      authListener?.subscription.unsubscribe()
    }
  }, [supabase])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      if (data.session && initializeTenantContextRef.current) {
      }
    } catch (error) {
      console.error("Sign in error:", error)
      setSession(null)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      setSession(null)
    } catch (error) {
      console.error("Sign out error:", error)
    } finally {
      setLoading(false)
    }
  }

  const value = {
    session,
    user: session?.user ?? null,
    signIn,
    signOut,
    loading,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
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

