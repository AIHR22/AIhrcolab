"use client"

import { Session } from "@supabase/supabase-js"
import { createContext, useContext, useEffect, useState, ReactNode } from "react"
// Update import to use the consolidated client file
import { getSupabase } from "@/lib/supabaseClient"
import { Database } from "@/types/supabase"

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
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setLoading(false)
    }

    fetchSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
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

