"use client"

import { Session } from "@supabase/supabase-js"
import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { getSupabase } from "@/lib/supabaseClient"
import { Database } from "@/types/supabase"
import { createTenantAwareClient, getCurrentTenantContext } from "@/lib/supabase/tenant-context"

interface AuthContextType {
  session: Session | null
  user: Session['user'] | null
  client: ReturnType<typeof getSupabase>
  signIn: (email: string, password: string) => Promise<Session>
  signUp: (email: string, password: string) => Promise<{ success: boolean, message: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Keep the base client immutable
const baseClient = getSupabase()

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [tenantClient, setTenantClient] = useState(baseClient)
  const [shouldRedirect, setShouldRedirect] = useState<string | null>(null)

  const initializeTenantContext = async (currentSession: Session | null) => {
    console.log('Initializing tenant context with session:', currentSession?.user?.email);
    
    if (!currentSession) {
      console.log('No session provided, resetting to base client');
      setSession(null)
      setTenantClient(baseClient)
      return
    }

    try {
      console.log('Fetching tenant context...');
      const tenantContext = await getCurrentTenantContext()
      console.log('Tenant context:', tenantContext);
      
      if (!tenantContext) {
        const errorMsg = 'No tenant context available';
        console.error(errorMsg);
        await baseClient.auth.signOut()
        setSession(null)
        setTenantClient(baseClient)
        setError(new Error(errorMsg));
        setShouldRedirect('/login')
        return
      }

      // For platform admin, keep using base client
      if (tenantContext.role === 'platform_admin') {
        setSession(currentSession)
        setTenantClient(baseClient)
        return
      }

      // For regular users, set up tenant-aware client
      const client = createTenantAwareClient(tenantContext.tenantId)
      setTenantClient(client)
      setSession(currentSession)
    } catch (error) {
      console.error('Error initializing tenant context:', error)
      await baseClient.auth.signOut()
      setSession(null)
      setTenantClient(baseClient)
      setError(error instanceof Error ? error : new Error('Failed to initialize tenant context'))
      setShouldRedirect('/login')
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('Starting sign in process for:', email);
    setLoading(true);
    setError(null);
    
    try {
      // First check if the email exists and is verified
      const { data: existingUser, error: lookupError } = await baseClient
        .from('user_profiles')
        .select('user_id, role, email_verified')
        .eq('email', email.toLowerCase())
        .single();

      if (lookupError) {
        if (lookupError.code === 'PGRST116') {
          console.log('No existing user profile found, will create new one');
        } else {
          console.error('Error checking user status:', lookupError);
          throw new Error('Error checking user status');
        }
      } else {
        console.log('Found existing user profile:', existingUser);
      }

      // Attempt to sign in
      const { data, error } = await baseClient.auth.signInWithPassword({
        email: email.toLowerCase(),
        password
      });

      if (error) throw error;

      if (!data.session) {
        console.error('No session returned after sign in');
        throw new Error('No session after sign in');
      }
      
      console.log('Successfully authenticated, session:', data.session);

      // If this is a new user, wait for profile creation
      if (!existingUser) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Initialize tenant context with the new session
      console.log('Initializing tenant context...');
      await initializeTenantContext(data.session);
      console.log('Tenant context initialized');
      
      return data.session;
    } catch (error) {
      console.error('Sign in error:', error);
      setError(error instanceof Error ? error : new Error('Failed to sign in'));
      throw error; // Re-throw to be caught by the login page
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Check if email already exists
      const { data: existingUser } = await baseClient
        .from('user_profiles')
        .select('user_id')
        .eq('email', email.toLowerCase())
        .single();

      if (existingUser) {
        throw new Error('Email already registered');
      }

      // Sign up with email verification
      const { data, error } = await baseClient.auth.signUp({
        email: email.toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (error) throw error;

      return {
        success: true,
        message: 'Please check your email to verify your account'
      };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await baseClient.auth.signOut()
    setSession(null)
    setTenantClient(baseClient)
    setShouldRedirect('/login')
  }

  // Handle redirects in a separate effect
  useEffect(() => {
    if (shouldRedirect) {
      router.push(shouldRedirect);
      setShouldRedirect(null);
    }
  }, [shouldRedirect, router]);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setError(null)
        const { data: { session } } = await baseClient.auth.getSession()
        await initializeTenantContext(session)
      } catch (err) {
        console.error('Failed to fetch session:', err)
        setError(err instanceof Error ? err : new Error('Failed to fetch session'))
      } finally {
        setLoading(false)
      }
    }

    fetchSession()

    const { data: authListener } = baseClient.auth.onAuthStateChange(async (_event, newSession) => {
      // Only reinitialize if the user has actually changed
      const currentUser = session?.user?.id
      const newUser = newSession?.user?.id
      
      if (currentUser !== newUser) {
        await initializeTenantContext(newSession)
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [session]) // Include session since we use it in auth state change

  const value = {
    session,
    user: session?.user ?? null,
    client: tenantClient,
    signIn,
    signUp,
    signOut,
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md p-6 rounded-lg bg-card border border-border shadow-lg">
          <h2 className="text-xl font-semibold text-foreground mb-2">Authentication Error</h2>
          <p className="text-muted-foreground mb-4">{error.message}</p>
          <button
            onClick={() => {
              setError(null)
              window.location.reload()
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
            <div className="w-4 h-4 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
            <div className="w-4 h-4 rounded-full bg-primary animate-bounce" />
          </div>
        </div>
      )}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
