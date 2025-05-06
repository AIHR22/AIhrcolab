import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

const mockAuditLogs = {
  adminActions: [
    {
      id: "log-1",
      action: "Tenant Created",
      admin: "John Administrator",
      tenant: "Acme Corporation",
      timestamp: "2025-04-16T14:22:00Z",
      details: "Created new tenant organization",
      severity: "info",
    },
    {
      id: "log-2",
      action: "Settings Updated",
      admin: "Sarah Admin",
      tenant: "System",
      timestamp: "2025-04-16T12:15:00Z",
      details: "Updated system security settings",
      severity: "info",
    },
  ],
  tenantActions: [
    {
      id: "log-3",
      action: "User Added",
      admin: "Tenant Admin",
      tenant: "TechSolutions Inc.",
      timestamp: "2025-04-16T11:10:00Z",
      details: "Added 2 new employees",
      severity: "info",
    },
    {
      id: "log-4",
      action: "Module Enabled",
      admin: "Tenant Admin",
      tenant: "TechSolutions Inc.",
      timestamp: "2025-04-16T10:45:00Z",
      details: "Enabled Payroll module",
      severity: "info",
    },
  ],
  securityEvents: [
    {
      id: "log-5",
      action: "Failed Login Attempt",
      admin: "System",
      tenant: "Acme Corporation",
      timestamp: "2025-04-16T09:30:00Z",
      details: "Multiple failed login attempts detected",
      severity: "warning",
    },
    {
      id: "log-6",
      action: "MFA Disabled",
      admin: "John Administrator",
      tenant: "StartupCo",
      timestamp: "2025-04-16T08:15:00Z",
      details: "Disabled MFA for user account",
      severity: "warning",
    },
  ],
}

function LogEntry({
  log,
}: {
  log: {
    action: string
    admin: string
    tenant: string
    timestamp: string
    details: string
    severity: string
  }
}) {
  return (
    <div className="flex items-start space-x-4 rounded-lg border p-4">
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{log.action}</p>
          <Badge
            variant={
              log.severity === "warning"
                ? "destructive"
                : log.severity === "info"
                ? "secondary"
                : "default"
            }
          >
            {log.severity}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{log.details}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{log.admin}</span>
          <span>•</span>
          <span>{log.tenant}</span>
          <span>•</span>
          <span>{new Date(log.timestamp).toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

export function AuditLogs() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search logs..."
          className="max-w-sm"
        />
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="24h">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="admin" className="space-y-6">
        <TabsList>
          <TabsTrigger value="admin">Admin Actions</TabsTrigger>
          <TabsTrigger value="tenant">Tenant Actions</TabsTrigger>
          <TabsTrigger value="security">Security Events</TabsTrigger>
        </TabsList>

        <TabsContent value="admin">
          <Card>
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {mockAuditLogs.adminActions.map((log) => (
                    <LogEntry key={log.id} log={log} />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tenant">
          <Card>
            <CardHeader>
              <CardTitle>Tenant Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {mockAuditLogs.tenantActions.map((log) => (
                    <LogEntry key={log.id} log={log} />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {mockAuditLogs.securityEvents.map((log) => (
                    <LogEntry key={log.id} log={log} />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
