'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useTenant } from "@/contexts/tenant-context"
import { GeneralSettings } from "@/components/settings/general-settings"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const { currentTenantId } = useTenant()

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="space-y-6">
        {currentTenantId && (
          <Card>
            <CardHeader>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>Manage your organization's team members.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push('/settings/team')}
                className="w-full"
              >
                Manage Team
              </Button>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how the app looks and feels.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <Switch
                id="dark-mode"
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>
          </CardContent>
        </Card>

        <GeneralSettings />
      </div>
    </div>
  )
}