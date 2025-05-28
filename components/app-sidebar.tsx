"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Briefcase,
  UserPlus,
  UserCog,
  DollarSign,
  TrendingUp,
  Heart,
  ShieldCheck,
  Layers,
  MessageSquare,
  BarChart2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed?: boolean
}

export function AppSidebar({ className, isCollapsed = false }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="py-4">
        <div className="px-3 py-2">
          <h2 className={cn("text-lg font-semibold tracking-tight", isCollapsed && "sr-only")}>HR Suite</h2>
          <p className={cn("text-sm text-muted-foreground", isCollapsed && "sr-only")}>AI-Powered HR Management</p>
        </div>
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 py-2">
          <SidebarItem
            icon={LayoutDashboard}
            title="Dashboard"
            href="/dashboard"
            isActive={pathname === "/dashboard"}
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            icon={Users}
            title="Employees"
            href="/dashboard/employees"
            isActive={pathname.startsWith("/dashboard/employees")}
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            icon={Layers}
            title="Organization"
            href="/dashboard/organization"
            isActive={pathname.startsWith("/dashboard/organization")}
            isCollapsed={isCollapsed}
          />
          {/* <SidebarItem
            icon={DollarSign}
            title="Payroll"
            href="/dashboard/payroll"
            isActive={pathname.startsWith("/dashboard/payroll")}
            isCollapsed={isCollapsed}
          /> */}
          <SidebarItem
            icon={Briefcase}
            title="Workforce Planning"
            href="/dashboard/workforce"
            isActive={pathname.startsWith("/dashboard/workforce")}
            isCollapsed={isCollapsed}
          />
          {/* <SidebarItem
            icon={TrendingUp}
            title="Strategic Growth Planner"
            href="/strategic-planning/growth-scenarios"
            isActive={pathname.startsWith("/strategic-planning/growth-scenarios")}
            isCollapsed={isCollapsed}
          /> */}
          <SidebarItem
            icon={TrendingUp}
            title="Revenue Forecasting"
            href="/dashboard/revenue"
            isActive={pathname.startsWith("/dashboard/revenue")}
            isCollapsed={isCollapsed}
          />

          {/* <SidebarItem
            icon={FileText}
            title="Reports"
            href="/dashboard/reports"
            isActive={pathname.startsWith("/dashboard/reports")}
            isCollapsed={isCollapsed}
          /> */}
          <SidebarItem
            icon={MessageSquare}
            title="HR Assistant"
            href="/dashboard/assistant"
            isActive={pathname.startsWith("/dashboard/assistant")}
            isCollapsed={isCollapsed}
            isBeta={true}
          />
          <SidebarItem
            icon={Settings}
            title="Settings"
            href="/dashboard/settings"
            isActive={pathname.startsWith("/dashboard/settings")}
            isCollapsed={isCollapsed}
          />
        </div>
      </ScrollArea>
    </div>
  )
}

interface SidebarItemProps {
  icon: React.ElementType
  title: string
  href: string
  isActive?: boolean
  isCollapsed?: boolean
  isBeta?: boolean
}

function SidebarItem({ icon: Icon, title, href, isActive, isCollapsed, isBeta }: SidebarItemProps) {
  return (
    <Button
      asChild
      variant={isActive ? "secondary" : "ghost"}
      size={isCollapsed ? "icon" : "default"}
      className={cn(
        "w-full justify-start transition-all duration-200",
        isCollapsed ? "px-2" : "px-3",
        isActive && "bg-primary/10 text-primary",
      )}
    >
      <Link href={href} className="flex items-center justify-between w-full">
        <div className="flex items-center">
          <Icon className={cn("h-5 w-5", isCollapsed ? "" : "mr-2")} />
          {!isCollapsed && <span>{title}</span>}
        </div>
        {isBeta && !isCollapsed && (
          <Badge variant="outline" className="ml-auto text-xs bg-blue-500 text-white dark:bg-blue-700 dark:text-blue-100">
            Beta
          </Badge>
        )}
      </Link>
    </Button>
  )
}
