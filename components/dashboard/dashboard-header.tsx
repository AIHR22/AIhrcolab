"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { UserNav } from "@/components/user-nav"
import { NotificationsPopover } from "@/components/notifications/notifications-popover"
import { ModeToggle } from "@/components/mode-toggle"
import { APIStatusIndicator } from "@/components/api/api-status-indicator"

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
      <SidebarTrigger />
      <div className="flex flex-1 items-center justify-between">
        <h1 className="text-xl font-semibold">HR Suite</h1>
        <div className="flex items-center gap-4">
          <APIStatusIndicator />
          <NotificationsPopover />
          <ModeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  )
}

