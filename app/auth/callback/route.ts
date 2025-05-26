import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  try {
    // If there's an error (like user denied access), redirect to login with error
    if (error) {
      console.error('OAuth error:', { error, errorDescription })
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${encodeURIComponent(errorDescription || 'Authentication failed')}`
      )
    }

    if (code) {
      const { error: authError, data: { session } } = await supabase.auth.exchangeCodeForSession(code)
      
      if (authError) {
        console.error('Error exchanging code for session:', authError)
        throw authError
      }

      if (!session) {
        throw new Error('No session returned after OAuth exchange')
      }

      // The auth state will be handled by the client-side AuthProvider
      // which will detect the new session and initialize tenant context
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(requestUrl.origin + "/dashboard")
  } catch (error) {
    console.error('Error in auth callback:', error)
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${encodeURIComponent('Authentication failed. Please try again.')}`
    )
  }
}

