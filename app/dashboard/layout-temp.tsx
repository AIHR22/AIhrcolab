import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { UserNav } from "@/components/user-nav"
import { NotificationsPopover } from "@/components/notifications/notifications-popover"
import { ModeToggle } from "@/components/mode-toggle"

export const dynamic = "force-dynamic"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
              <SidebarTrigger />
              <div className="flex flex-1 items-center justify-between">
                <h1 className="text-xl font-semibold">HR Suite</h1>
                <div className="flex items-center gap-4">
                  {/* API Status Indicator removed */}
                  <NotificationsPopover />
                  <ModeToggle />
                  <UserNav />
                </div>
              </div>
            </header>
            <main className="flex-1 p-6">{children}</main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

