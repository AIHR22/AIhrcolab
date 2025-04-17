import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const activities = [
  {
    action: "Tenant Created",
    tenant: "Acme Corporation",
    timestamp: "2025-04-16T14:22:00Z",
    admin: "John Administrator",
    initials: "JA",
  },
  {
    action: "Subscription Upgraded",
    tenant: "TechSolutions Inc.",
    timestamp: "2025-04-15T09:45:00Z",
    admin: "System",
    initials: "SY",
  },
  {
    action: "Tenant Deactivated",
    tenant: "Old Company LLC",
    timestamp: "2025-04-14T16:30:00Z",
    admin: "Sarah Admin",
    initials: "SA",
  },
]

export function RecentActivity() {
  return (
    <div className="space-y-8">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{activity.initials}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {activity.action}
            </p>
            <p className="text-sm text-muted-foreground">
              {activity.tenant} by {activity.admin}
            </p>
          </div>
          <div className="ml-auto text-sm text-muted-foreground">
            {new Date(activity.timestamp).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  )
}
