"use client"

import { Session } from "@supabase/supabase-js"
import { createContext, useContext, useEffect, useState, ReactNode } from "react"
// Update import to use the consolidated client file
import { getSupabase } from "@/lib/supabaseClient"
import { Database } from "@/types/supabase"
import { createTenantAwareClient, getCurrentTenantContext } from "@/lib/supabase/tenant-context"

// Define the shape of the context data
interface AuthContextType {
  session: Session | null
  user: Session['user'] | null
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
    const initializeTenantContext = async (currentSession: Session | null) => {
      if (currentSession) {
        try {
          const tenantContext = await getCurrentTenantContext()
          if (tenantContext) {
            // For platform admin, we don't need tenant-specific client
            if (tenantContext.role === 'platform_admin') {
              setSession(currentSession)
              return
            }
            // For regular users, set up tenant-aware client
            const client = createTenantAwareClient(tenantContext.tenantId)
            if (client.fetch) {
              supabase.fetch = client.fetch.bind(client)
            }
            setSession(currentSession)
          } else {
            console.error('No tenant context available')
            await signOut()
            window.location.href = '/login'
            return
          }
        } catch (error) {
          console.error('Error initializing tenant context:', error)
          await signOut()
          window.location.href = '/login'
          return
        }
      } else {
        setSession(null)
      }
    }

    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      await initializeTenantContext(session)
      setLoading(false)
    }

    fetchSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await initializeTenantContext(session)
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [supabase]) // Add supabase as a dependency

  const signOut = async () => {
    await supabase.auth.signOut()
    setSession(null) // Clear session locally on sign out
  }

  // Memoize the context value to prevent unnecessary re-renders
  const value = {
    session,
    user: session?.user ?? null,
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

