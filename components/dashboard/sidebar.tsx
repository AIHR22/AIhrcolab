"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Users,
  Briefcase,
  UserPlus,
  DollarSign,
  BarChart2,
  Heart,
  Shield,
  Link2,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Home,
  Settings,
} from "lucide-react"

interface SidebarItemProps {
  icon: React.ReactNode
  title: string
  href: string
  active?: boolean
  subItems?: { title: string; href: string }[]
}

const SidebarItem = ({ icon, title, href, active, subItems }: SidebarItemProps) => {
  const [expanded, setExpanded] = useState(false)

  const hasSubItems = subItems && subItems.length > 0

  return (
    <div>
      {hasSubItems ? (
        <button
          onClick={() => setExpanded(!expanded)}
          className={`flex w-full items-center p-2 rounded-lg mb-1 ${
            active ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          <div className="mr-3">{icon}</div>
          <span className="flex-1 text-left">{title}</span>
          <div className="ml-2">{expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</div>
        </button>
      ) : (
        <Link
          href={href}
          className={`flex items-center p-2 rounded-lg mb-1 ${
            active ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          <div className="mr-3">{icon}</div>
          <span className="flex-1">{title}</span>
        </Link>
      )}

      {hasSubItems && expanded && (
        <div className="ml-6 space-y-1 mt-1">
          {subItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="flex items-center p-2 rounded-lg text-sm hover:bg-accent hover:text-accent-foreground"
            >
              {item.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-background border-r border-border flex-shrink-0 h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold">HR Suite</h2>
      </div>

      <div className="p-4 space-y-1">
        <SidebarItem icon={<Home size={20} />} title="Dashboard" href="/dashboard" active={pathname === "/dashboard"} />

        <SidebarItem
          icon={<Users size={20} />}
          title="Workforce Planning"
          href="/dashboard/workforce"
          active={pathname.startsWith("/dashboard/workforce")}
          subItems={[
            { title: "Projects", href: "/dashboard/workforce/projects" },
            { title: "Skills", href: "/dashboard/workforce/skills" },
            { title: "Allocations", href: "/dashboard/workforce/allocations" },
            { title: "Reports", href: "/dashboard/workforce/reports" },
          ]}
        />

        <SidebarItem
          icon={<Briefcase size={20} />}
          title="Recruitment"
          href="/dashboard/recruitment"
          active={pathname.startsWith("/dashboard/recruitment")}
          subItems={[
            { title: "Job Postings", href: "/dashboard/recruitment/jobs" },
            { title: "Candidates", href: "/dashboard/recruitment/candidates" },
            { title: "Applications", href: "/dashboard/recruitment/applications" },
            { title: "Interviews", href: "/dashboard/recruitment/interviews" },
          ]}
        />

        <SidebarItem
          icon={<UserPlus size={20} />}
          title="Onboarding"
          href="/dashboard/onboarding"
          active={pathname.startsWith("/dashboard/onboarding")}
          subItems={[
            { title: "Tasks", href: "/dashboard/onboarding/tasks" },
            { title: "Employees", href: "/dashboard/onboarding/employees" },
            { title: "Documents", href: "/dashboard/onboarding/documents" },
          ]}
        />

        <SidebarItem
          icon={<DollarSign size={20} />}
          title="Compensation"
          href="/dashboard/compensation"
          active={pathname.startsWith("/dashboard/compensation")}
          subItems={[
            { title: "Salary", href: "/dashboard/compensation/salary" },
            { title: "Benefits", href: "/dashboard/compensation/benefits" },
            { title: "Payroll", href: "/dashboard/compensation/payroll" },
          ]}
        />

        <SidebarItem
          icon={<BarChart2 size={20} />}
          title="Performance"
          href="/dashboard/performance"
          active={pathname.startsWith("/dashboard/performance")}
          subItems={[
            { title: "Reviews", href: "/dashboard/performance/reviews" },
            { title: "Goals", href: "/dashboard/performance/goals" },
            { title: "Metrics", href: "/dashboard/performance/metrics" },
            { title: "Training", href: "/dashboard/performance/training" },
          ]}
        />

        <SidebarItem
          icon={<Heart size={20} />}
          title="Engagement"
          href="/dashboard/engagement"
          active={pathname.startsWith("/dashboard/engagement")}
          subItems={[
            { title: "Surveys", href: "/dashboard/engagement/surveys" },
            { title: "Feedback", href: "/dashboard/engagement/feedback" },
            { title: "Retention", href: "/dashboard/engagement/retention" },
            { title: "Wellness", href: "/dashboard/engagement/wellness" },
          ]}
        />

        <SidebarItem
          icon={<Shield size={20} />}
          title="Compliance"
          href="/dashboard/compliance"
          active={pathname.startsWith("/dashboard/compliance")}
          subItems={[
            { title: "Policies", href: "/dashboard/compliance/policies" },
            { title: "Documents", href: "/dashboard/compliance/documents" },
            { title: "Audits", href: "/dashboard/compliance/audits" },
          ]}
        />

        <SidebarItem
          icon={<Link2 size={20} />}
          title="Integrations"
          href="/dashboard/integrations"
          active={pathname.startsWith("/dashboard/integrations")}
        />

        <SidebarItem
          icon={<MessageSquare size={20} />}
          title="HR Assistant"
          href="/dashboard/assistant"
          active={pathname.startsWith("/dashboard/assistant")}
        />

        <div className="pt-4 mt-4 border-t border-gray-200">
          <SidebarItem
            icon={<Settings size={20} />}
            title="Settings"
            href="/dashboard/settings"
            active={pathname.startsWith("/dashboard/settings")}
          />
        </div>
      </div>
    </div>
  )
}

