import { Metadata } from "next"
import { SystemSettings } from "@/components/admin/system-settings"

export const metadata: Metadata = {
  title: "System Settings - HR Suite",
  description: "Configure global system settings",
}

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
        <p className="text-muted-foreground">
          Configure global system settings and defaults
        </p>
      </div>
      <SystemSettings />
    </div>
  )
}
