'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function EmailSettingsPage() {
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false)
  const [isConnectingOutlook, setIsConnectingOutlook] = useState(false)
  const [emailPreferences, setEmailPreferences] = useState({
    systemUpdates: true,
    taskNotifications: true,
    employeeUpdates: true,
  })
  
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  const handleGoogleConnect = async () => {
    setIsConnectingGoogle(true)
    try {
      // Redirect to Google OAuth flow
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'email https://www.googleapis.com/auth/gmail.send',
          redirectTo: `${window.location.origin}/settings/email/callback`,
        },
      })

      if (error) throw error
    } catch (error) {
      console.error('Error connecting Google:', error)
      toast({
        title: 'Error',
        description: 'Failed to connect Google account. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsConnectingGoogle(false)
    }
  }

  const handleOutlookConnect = async () => {
    setIsConnectingOutlook(true)
    try {
      // Redirect to Microsoft OAuth flow
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          scopes: 'email Mail.Send',
          redirectTo: `${window.location.origin}/settings/email/callback`,
        },
      })

      if (error) throw error
    } catch (error) {
      console.error('Error connecting Outlook:', error)
      toast({
        title: 'Error',
        description: 'Failed to connect Outlook account. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsConnectingOutlook(false)
    }
  }

  const handlePreferenceChange = async (key: string, value: boolean) => {
    setEmailPreferences(prev => ({ ...prev, [key]: value }))
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          email_preferences: { ...emailPreferences, [key]: value },
        })

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Email preferences updated successfully.',
      })
    } catch (error) {
      console.error('Error updating preferences:', error)
      toast({
        title: 'Error',
        description: 'Failed to update preferences. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Email Settings</h1>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Integration</CardTitle>
            <CardDescription>Connect your email account to receive notifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Google Account</Label>
                <p className="text-sm text-muted-foreground">Connect your Gmail account</p>
              </div>
              <Button
                onClick={handleGoogleConnect}
                disabled={isConnectingGoogle}
              >
                {isConnectingGoogle ? 'Connecting...' : 'Connect Gmail'}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Microsoft Account</Label>
                <p className="text-sm text-muted-foreground">Connect your Outlook account</p>
              </div>
              <Button
                onClick={handleOutlookConnect}
                disabled={isConnectingOutlook}
              >
                {isConnectingOutlook ? 'Connecting...' : 'Connect Outlook'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>Choose which notifications you want to receive via email.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="system-updates">System Updates</Label>
              <Switch
                id="system-updates"
                checked={emailPreferences.systemUpdates}
                onCheckedChange={(checked) => handlePreferenceChange('systemUpdates', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="task-notifications">Task Notifications</Label>
              <Switch
                id="task-notifications"
                checked={emailPreferences.taskNotifications}
                onCheckedChange={(checked) => handlePreferenceChange('taskNotifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="employee-updates">Employee Updates</Label>
              <Switch
                id="employee-updates"
                checked={emailPreferences.employeeUpdates}
                onCheckedChange={(checked) => handlePreferenceChange('employeeUpdates', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}