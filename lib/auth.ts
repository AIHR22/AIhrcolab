import { redirect } from "next/navigation"

// A flag to allow bypassing authentication in development mode
const BYPASS_AUTH = process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true'

// Log if auth bypass is enabled
if (BYPASS_AUTH) {
  console.warn('⚠️ Auth bypass is enabled. This should only be used in development.')
}

export async function getSession() {
  // If bypass is enabled, return a mock session
  if (BYPASS_AUTH) {
    return {
      user: {
        id: 'dev-user-id',
        email: 'dev@example.com',
        role: 'admin',
      }
    }
  }

  const { cookies } = await import('next/headers')
  const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs')
  
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

export async function requireAuth() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return session
}

