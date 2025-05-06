import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const mockTenantDetails = {
  id: "t-28c7ef",
  company: {
    name: "Acme Corporation",
    industry: "Manufacturing",
    size: "100-500",
    created: "2023-11-15T10:30:00Z",
    address: "123 Business Ave, Metropolis, CA 90210",
    phone: "+1 (555) 123-4567",
    website: "https://acmecorp.com",
  },
  subscription: {
    plan: "Enterprise",
    status: "Active",
    startDate: "2023-11-15T10:30:00Z",
    renewalDate: "2024-11-15T10:30:00Z",
    seats: 150,
    usedSeats: 124,
  },
  admins: [
    {
      id: "u-a45e2c",
      name: "John Smith",
      email: "john@acmecorp.com",
      role: "Owner",
      lastLogin: "2025-04-17T08:22:00Z",
    },
    {
      id: "u-b32f6d",
      name: "Sarah Johnson",
      email: "sarah@acmecorp.com",
      role: "Admin",
      lastLogin: "2025-04-16T15:40:00Z",
    },
  ],
  modules: {
    dashboard: { enabled: true, usage: "High" },
    employees: { enabled: true, usage: "High" },
    organization: { enabled: true, usage: "Medium" },
    payroll: { enabled: true, usage: "Medium" },
    workforcePlanning: { enabled: true, usage: "Low" },
    strategicGrowth: { enabled: false, usage: "None" },
  },
  activity: [
    {
      action: "Settings Updated",
      user: "John Smith",
      timestamp: "2025-04-17T08:22:00Z",
      details: "Updated notification settings",
    },
    {
      action: "User Added",
      user: "Sarah Johnson",
      timestamp: "2025-04-16T11:10:00Z",
      details: "Added 2 new employees",
    },
  ],
}

export function TenantDetails({ id }: { id: string }) {
  const tenant = mockTenantDetails

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Company Name</p>
              <p className="text-sm text-muted-foreground">{tenant.company.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Industry</p>
              <p className="text-sm text-muted-foreground">
                {tenant.company.industry}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Size</p>
              <p className="text-sm text-muted-foreground">{tenant.company.size}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Created</p>
              <p className="text-sm text-muted-foreground">
                {new Date(tenant.company.created).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium">Address</p>
            <p className="text-sm text-muted-foreground">
              {tenant.company.address}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Phone</p>
              <p className="text-sm text-muted-foreground">
                {tenant.company.phone}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Website</p>
              <p className="text-sm text-muted-foreground">
                {tenant.company.website}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Plan</p>
              <p className="text-sm text-muted-foreground">
                {tenant.subscription.plan}
              </p>
            </div>
            <Badge>{tenant.subscription.status}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Start Date</p>
              <p className="text-sm text-muted-foreground">
                {new Date(tenant.subscription.startDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Renewal Date</p>
              <p className="text-sm text-muted-foreground">
                {new Date(tenant.subscription.renewalDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium">Seat Usage</p>
            <p className="text-sm text-muted-foreground">
              {tenant.subscription.usedSeats} of {tenant.subscription.seats} seats used
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tenant.admins.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarFallback>
                      {admin.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{admin.name}</p>
                    <p className="text-sm text-muted-foreground">{admin.email}</p>
                  </div>
                </div>
                <Badge variant="outline">{admin.role}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {tenant.activity.map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{item.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.user} - {item.details}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Enabled Modules & Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(tenant.modules).map(([name, module]) => (
              <div key={name} className="flex items-center justify-between space-x-2">
                <div className="flex-1">
                  <p className="text-sm font-medium capitalize">
                    {name.replace(/([A-Z])/g, " $1").trim()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Usage: {module.usage}
                  </p>
                </div>
                <Switch checked={module.enabled} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
