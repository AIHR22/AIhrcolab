import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Settings,
  FileText,
} from "lucide-react"

const navItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Tenant Management",
    href: "/admin/tenants",
    icon: Building2,
  },
  {
    title: "Billing & Subscriptions",
    href: "/admin/billing",
    icon: CreditCard,
  },
  {
    title: "System Settings",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    title: "Audit & Logs",
    href: "/admin/audit",
    icon: FileText,
  },
]

export function SideNav() {
  const pathname = usePathname()

  return (
    <nav className="w-64 min-h-screen border-r bg-muted/20">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
