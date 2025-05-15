"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { TopBar } from "@/components/top-bar"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const router = useRouter()

  return (
    <div className="flex h-screen bg-background">
      <div
        className={cn(
          "fixed inset-y-0 z-50 flex h-full flex-col border-r bg-background transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
        )}
      >
        <AppSidebar isCollapsed={isCollapsed} />
      </div>
      <div className={cn("flex flex-col flex-1 transition-all duration-300", isCollapsed ? "ml-16" : "ml-64")}>
        <TopBar onToggleSidebar={() => setIsCollapsed(!isCollapsed)} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
