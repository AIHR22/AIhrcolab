import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const cookieStore = cookies()
    // Initialize the client without explicit options, as it will infer settings
    // and handle cookie exchange automatically with the provided cookieStore.
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore,
      // Removed explicit options:
      // options: {
      //   auth: {
      //     flowType: 'pkce',
      //     cookieOptions: {
      //       secure: process.env.NODE_ENV === 'production',
      //       sameSite: 'lax',
      //       path: '/',
      //       ...(process.env.NODE_ENV === 'production' && {
      //         domain: '.qwdekbxaigeajvbqvjha.supabase.co'
      //       })
      //     }
      //   }
      // }
    })
    
    // Exchange the code for a session. The Supabase client will
    // automatically set the auth cookie upon successful exchange.
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error.message)
      // It's good practice to include the error message in the redirect for debugging
      return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_callback_error&message=${encodeURIComponent(error.message)}`)
    }

    // If no error, the session is set, and the cookie should be in the response.
    // Redirect to the dashboard or intended page.
    return NextResponse.redirect(requestUrl.origin + "/dashboard")
  }

  // If there's no code, redirect to an error page or login page
  console.warn('No code found in auth callback request')
  return NextResponse.redirect(`${requestUrl.origin}/login?error=no_code_provided`)
}

