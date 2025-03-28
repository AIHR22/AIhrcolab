"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

type AuthContextType = {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// This function ensures we always have a Supabase client available
const getSupabaseClient = () => {
  // If the singleton client is available, use it
  if (supabase) return supabase
  
  // Otherwise, create a temporary client for this component
  // This is a fallback in case the singleton is not initialized
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials not found. Please check your environment variables.')
  }
  
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabaseClient, setSupabaseClient] = useState<ReturnType<typeof getSupabaseClient> | null>(null)

  useEffect(() => {
    // Initialize Supabase client on mount
    try {
      const client = getSupabaseClient()
      setSupabaseClient(client)
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error)
      setLoading(false)
      return
    }
  }, [])

  useEffect(() => {
    // Only proceed if we have a Supabase client
    if (!supabaseClient) return

    // Check for existing session
    const checkUser = async () => {
      try {
        const { data } = await supabaseClient.auth.getSession()
        setUser(data.session?.user || null)
      } catch (error) {
        console.error('Failed to get session:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabaseClient])

  const signIn = async (email: string, password: string) => {
    if (!supabaseClient) throw new Error("Supabase client not available")
    
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signOut = async () => {
    if (!supabaseClient) throw new Error("Supabase client not available")
    
    try {
      // Use the API endpoint for sign-out
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to sign out');
      }
      
      // Force refresh the page to clear any client-side state
      window.location.href = '/login';
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signOut }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

