'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/hooks/use-toast"
import { TimeZoneSelector } from "@/components/settings/timezone-selector"

interface UserSettings {
  email_notifications: boolean
  notification_frequency: string
  timezone: string
  dark_mode: boolean
  language: string
  two_factor_auth: boolean
  [key: string]: any
}

const defaultSettings: UserSettings = {
  email_notifications: true,
  notification_frequency: 'daily',
  timezone: 'America/New_York',
  dark_mode: false,
  language: 'en',
  two_factor_auth: false
}

export default function UserSettingsPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  
  const [activeTab, setActiveTab] = useState('preferences')
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUserSettings() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }
        
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          throw error
        }
        
        setSettings({ ...defaultSettings, ...data })
      } catch (err) {
        console.error("Error fetching user settings:", err)
        setError("Failed to load user settings")
        toast({
          title: "Error",
          description: "Failed to load user settings",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserSettings()
  }, [supabase, router, toast])

  const handleChange = (name: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error("User not authenticated")
      }
      
      // First check if the user has settings already
      const { data: existingSettings, error: checkError } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', user.id)
        .single()
      
      let error
      
      if (!existingSettings) {
        // Insert new settings
        const { error: insertError } = await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            ...settings
          })
        error = insertError
      } else {
        // Update existing settings
        const { error: updateError } = await supabase
          .from('user_settings')
          .update(settings)
          .eq('user_id', user.id)
        error = updateError
      }
      
      if (error) throw error
      
      toast({
        title: "Success",
        description: "User settings saved successfully",
      })
    } catch (err) {
      console.error("Error saving user settings:", err)
      toast({
        title: "Error",
        description: "Failed to save user settings",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">Manage your personal preferences and account settings</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Display Preferences</CardTitle>
              <CardDescription>Customize how the application looks and behaves</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="block mb-1">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Toggle between light and dark theme</p>
                  </div>
                  <Switch
                    checked={settings.dark_mode}
                    onCheckedChange={(checked) => handleChange('dark_mode', checked)}
                  />
                </div>
              </div>

              <Separator />
              
              <div className="space-y-3">
                <Label>Language</Label>
                <select
                  name="language"
                  value={settings.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>

              <Separator />
              
              <div className="space-y-3">
                <Label>Time Zone</Label>
                <TimeZoneSelector
                  value={settings.timezone}
                  onChange={(timezone) => handleChange('timezone', timezone)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="block mb-1">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive important updates via email</p>
                  </div>
                  <Switch
                    checked={settings.email_notifications}
                    onCheckedChange={(checked) => handleChange('email_notifications', checked)}
                  />
                </div>
              </div>

              <Separator />
              
              <div className="space-y-3">
                <Label>Notification Frequency</Label>
                <select
                  name="notification_frequency"
                  value={settings.notification_frequency}
                  onChange={(e) => handleChange('notification_frequency', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  disabled={!settings.email_notifications}
                >
                  <option value="realtime">Real-time</option>
                  <option value="daily">Daily Digest</option>
                  <option value="weekly">Weekly Summary</option>
                </select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage account security and authentication options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="block mb-1">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch
                    checked={settings.two_factor_auth}
                    onCheckedChange={(checked) => handleChange('two_factor_auth', checked)}
                  />
                </div>
              </div>

              <Separator />
              
              <div className="space-y-3">
                <Label>Change Password</Label>
                <Button variant="outline" onClick={() => router.push('/reset-password')}>
                  Reset Password
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
