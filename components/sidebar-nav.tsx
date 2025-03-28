"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import { Users, UserPlus, DollarSign, BarChart, Heart, Shield, Plug, Settings, LayoutDashboard } from "lucide-react"

interface SidebarNavItem {
  title: string
  href: string
  icon: string
}

interface SidebarNavProps {
  items: SidebarNavItem[]
}

export function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname()

  // Map icon names to Lucide components
  const getIcon = (iconName: string): LucideIcon => {
    const iconMap: Record<string, LucideIcon> = {
      users: Users,
      "user-plus": UserPlus,
      "dollar-sign": DollarSign,
      "bar-chart": BarChart,
      heart: Heart,
      shield: Shield,
      plug: Plug,
      settings: Settings,
      dashboard: LayoutDashboard,
    }

    return iconMap[iconName] || Users
  }

  return (
    <nav className="grid items-start gap-2 p-4">
      {items.map((item) => {
        const IconComponent = getIcon(item.icon)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === item.href ? "bg-accent text-accent-foreground" : "transparent",
            )}
          >
            <IconComponent className="mr-2 h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}

