'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useNotifications } from '@/contexts/notification-provider'

export function NotificationSettings() {
  const { preferences, updatePreferences } = useNotifications()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>
          Manage how you want to receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
            <span>Email Notifications</span>
            <span className="font-normal text-sm text-muted-foreground">
              Receive notifications via email
            </span>
          </Label>
          <Switch
            id="email-notifications"
            checked={preferences.email_notifications}
            onCheckedChange={(checked) =>
              updatePreferences({ email_notifications: checked })
            }
          />
        </div>
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="in-app-notifications" className="flex flex-col space-y-1">
            <span>In-App Notifications</span>
            <span className="font-normal text-sm text-muted-foreground">
              Receive notifications within the application
            </span>
          </Label>
          <Switch
            id="in-app-notifications"
            checked={preferences.in_app_notifications}
            onCheckedChange={(checked) =>
              updatePreferences({ in_app_notifications: checked })
            }
          />
        </div>
      </CardContent>
    </Card>
  )
}