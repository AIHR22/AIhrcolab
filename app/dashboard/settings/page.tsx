"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { getCompanySettings, updateCompanySettings } from "@/lib/supabase/api"
import { toast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { IntegrationsTab } from "@/components/settings/integrations-tab"
import { IntegrationProvider } from "@/contexts/integration-context"
import { isValidHexColor, hasGoodContrast, applyTheme } from "@/components/branding/company-branding"
import { ColorPreview } from "@/components/branding/color-preview"

interface Settings {
  company_name?: string
  logo_url?: string
  primary_color?: string
  secondary_color?: string
  notifications_onboarding?: boolean
  notifications_payroll?: boolean
  notifications_reviews?: boolean
  notifications_desktop?: boolean
  notifications_sound?: boolean
  [key: string]: any
}

const defaultSettings: Settings = {
  company_name: '',
  logo_url: '',
  primary_color: '#3b82f6',
  secondary_color: '#10b981',
  notifications_onboarding: true,
  notifications_payroll: true,
  notifications_reviews: true,
  notifications_desktop: false,
  notifications_sound: false
}

export default function SettingsPage() {
  // All hooks at the top
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get('tab') || 'general'
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const data = await getCompanySettings()
        setSettings({ ...defaultSettings, ...data })
      } catch (err) {
        console.error("Error fetching company settings:", err)
        setError("Failed to load company settings")
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', value)
    router.push(`?${params.toString()}`)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setSettings((prev: Settings) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setSettings((prev: Settings) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const validateBrandingColors = () => {
    let errors = [];

    // Validate primary color
    if (settings.primary_color) {
      if (!isValidHexColor(settings.primary_color)) {
        errors.push('Primary color must be a valid hex code (e.g., #3b82f6)')
      } else if (!hasGoodContrast(settings.primary_color)) {
        errors.push('Primary color should have good contrast against white and black backgrounds')
      }
    }

    // Validate secondary color
    if (settings.secondary_color) {
      if (!isValidHexColor(settings.secondary_color)) {
        errors.push('Secondary color must be a valid hex code (e.g., #10b981)')
      } else if (!hasGoodContrast(settings.secondary_color)) {
        errors.push('Secondary color should have good contrast against white and black backgrounds')
      }
    }

    // Check if both colors are too similar
    if (settings.primary_color && settings.secondary_color && 
        settings.primary_color.toLowerCase() === settings.secondary_color.toLowerCase()) {
      errors.push('Primary and secondary colors should be different')
    }

    return errors;
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      // Validate colors
      const validationErrors = validateBrandingColors()
      if (validationErrors.length > 0) {
        // Display validation errors
        validationErrors.forEach(error => {
          toast({
            title: "Validation Error",
            description: error,
            variant: "destructive",
          })
        })
        return
      }

      await updateCompanySettings(settings)
      
      // Apply theme immediately upon save
      if (settings.primary_color && settings.secondary_color) {
        applyTheme(settings.primary_color, settings.secondary_color)
      }
      
      toast({
        title: "Settings saved",
        description: "Your company settings have been updated",
      })
    } catch (err) {
      console.error("Error saving company settings:", err)
      toast({
        title: "Error",
        description: "Failed to save company settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            {/* API tab hidden for now */}
            {/* <TabsTrigger value="api">API</TabsTrigger> */}
          </TabsList>
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-24" />
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  if (error) {
    return <div className="bg-red-50 p-4 rounded-md text-red-500">{error}</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          {/* API tab hidden for now */}
          {/* <TabsTrigger value="api">API</TabsTrigger> */}
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your company's general information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name</Label>
                <Input id="name" name="name" value={settings.name} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={settings.email || ""} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" value={settings.phone || ""} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" value={settings.address || ""} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" name="website" value={settings.website || ""} onChange={handleChange} />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>Customize your company's branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="logo_url">Logo URL</Label>
                    <Input 
                      id="logo_url" 
                      name="logo_url" 
                      value={settings.logo_url || ""} 
                      onChange={handleChange} 
                      placeholder="https://example.com/logo.png"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter a URL to your company logo (transparent PNG or SVG recommended).
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primary_color">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primary_color"
                        name="primary_color"
                        value={settings.primary_color || "#3b82f6"}
                        onChange={handleChange}
                        className="font-mono"
                        maxLength={7}
                      />
                      <input
                        type="color"
                        value={settings.primary_color || "#3b82f6"}
                        onChange={(e) =>
                          handleChange({
                            target: { name: "primary_color", value: e.target.value },
                          } as React.ChangeEvent<HTMLInputElement>)
                        }
                        className="w-10 h-10 p-1 rounded border"
                        aria-label="Select primary color"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Used for primary buttons, links, and active elements.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondary_color">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondary_color"
                        name="secondary_color"
                        value={settings.secondary_color || "#10b981"}
                        onChange={handleChange}
                        className="font-mono"
                        maxLength={7}
                      />
                      <input
                        type="color"
                        value={settings.secondary_color || "#10b981"}
                        onChange={(e) =>
                          handleChange({
                            target: { name: "secondary_color", value: e.target.value },
                          } as React.ChangeEvent<HTMLInputElement>)
                        }
                        className="w-10 h-10 p-1 rounded border"
                        aria-label="Select secondary color"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Used for success states, secondary elements, and accents.
                    </p>
                  </div>

                  {/* Validation status messages */}
                  <div className="space-y-2">
                    {settings.primary_color && !isValidHexColor(settings.primary_color) && (
                      <p className="text-sm text-red-500">Primary color must be a valid hex code (e.g., #3b82f6)</p>
                    )}
                    {settings.primary_color && isValidHexColor(settings.primary_color) && !hasGoodContrast(settings.primary_color) && (
                      <p className="text-sm text-amber-500">Primary color may have contrast issues on light/dark backgrounds</p>
                    )}
                    {settings.secondary_color && !isValidHexColor(settings.secondary_color) && (
                      <p className="text-sm text-red-500">Secondary color must be a valid hex code (e.g., #10b981)</p>
                    )}
                    {settings.secondary_color && isValidHexColor(settings.secondary_color) && !hasGoodContrast(settings.secondary_color) && (
                      <p className="text-sm text-amber-500">Secondary color may have contrast issues on light/dark backgrounds</p>
                    )}
                    {settings.primary_color && settings.secondary_color && 
                     settings.primary_color.toLowerCase() === settings.secondary_color.toLowerCase() && (
                      <p className="text-sm text-red-500">Primary and secondary colors should be different</p>
                    )}
                  </div>
                </div>

                {/* Live preview section */}
                <div>
                  <ColorPreview 
                    primaryColor={isValidHexColor(settings.primary_color || "") ? (settings.primary_color || "#3b82f6") : "#3b82f6"} 
                    secondaryColor={isValidHexColor(settings.secondary_color || "") ? (settings.secondary_color || "#10b981") : "#10b981"} 
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div>
                <p className="text-xs text-muted-foreground">
                  These colors will be applied throughout the entire application.
                </p>
              </div>
              <Button 
                onClick={handleSave} 
                disabled={saving || (!isValidHexColor(settings.primary_color) || !isValidHexColor(settings.secondary_color))}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your security preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Security settings will be implemented in a future update.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage your notification preferences and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Email Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Employee Onboarding</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications about new employee onboarding</p>
                    </div>
                    <input
                      type="checkbox"
                      name="notifications_onboarding"
                      checked={settings?.notifications_onboarding}
                      onChange={(e) => handleCheckboxChange(e.target.name, e.target.checked)}
                      className="h-6 w-6"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Payroll Processing</Label>
                      <p className="text-sm text-muted-foreground">Get alerts when payroll processing is complete</p>
                    </div>
                    <input
                      type="checkbox"
                      name="notifications_payroll"
                      checked={settings?.notifications_payroll}
                      onChange={(e) => handleCheckboxChange(e.target.name, e.target.checked)}
                      className="h-6 w-6"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Performance Reviews</Label>
                      <p className="text-sm text-muted-foreground">Notifications about upcoming and completed reviews</p>
                    </div>
                    <input
                      type="checkbox"
                      name="notifications_reviews"
                      checked={settings?.notifications_reviews}
                      onChange={(e) => handleCheckboxChange(e.target.name, e.target.checked)}
                      className="h-6 w-6"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">In-App Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Desktop Notifications</Label>
                      <p className="text-sm text-muted-foreground">Show notifications on your desktop</p>
                    </div>
                    <input
                      type="checkbox"
                      name="notifications_desktop"
                      checked={settings?.notifications_desktop}
                      onChange={(e) => handleCheckboxChange(e.target.name, e.target.checked)}
                      className="h-6 w-6"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Sound Alerts</Label>
                      <p className="text-sm text-muted-foreground">Play a sound when receiving notifications</p>
                    </div>
                    <input
                      type="checkbox"
                      name="notifications_sound"
                      checked={settings?.notifications_sound}
                      onChange={(e) => handleCheckboxChange(e.target.name, e.target.checked)}
                      className="h-6 w-6"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationProvider>
            <Card>
              <CardHeader>
                <CardTitle>Integration Settings</CardTitle>
                <CardDescription>Manage your ERP and CRM integrations</CardDescription>
              </CardHeader>
              <CardContent>
                <IntegrationsTab />
              </CardContent>
            </Card>
          </IntegrationProvider>
        </TabsContent>

        {/* API tab content hidden for now */}
        {/* <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Settings</CardTitle>
              <CardDescription>Manage your API keys and access</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">API settings will be implemented in a future update.</p>
            </CardContent>
          </Card>
        </TabsContent> */}
      </Tabs>
    </div>
  )
}