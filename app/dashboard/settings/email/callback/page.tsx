'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useToast } from '@/hooks/use-toast'

export default function EmailCallbackPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) throw error

        if (session?.provider_token) {
          // Store the provider token for future use
          const { error: updateError } = await supabase
            .from('user_email_integration')
            .upsert({
              user_id: session.user.id,
              provider: session.provider_token ? 'google' : 'outlook',
              access_token: session.provider_token,
              updated_at: new Date().toISOString(),
            })

          if (updateError) throw updateError

          toast({
            title: 'Success',
            description: 'Email account connected successfully!',
          })
        }

        // Redirect back to email settings
        router.push('/settings/email')
      } catch (error) {
        console.error('Error in callback:', error)
        toast({
          title: 'Error',
          description: 'Failed to complete email integration. Please try again.',
          variant: 'destructive',
        })
        router.push('/settings/email')
      }
    }

    handleCallback()
  }, [router, supabase, toast])

  return (
    <div className="container mx-auto py-10 text-center">
      <h2 className="text-xl font-semibold mb-4">Completing Integration...</h2>
      <p className="text-muted-foreground">Please wait while we finish setting up your email integration.</p>
    </div>
  )
}