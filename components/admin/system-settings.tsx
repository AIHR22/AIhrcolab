import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

const mockSystemSettings = {
  defaultTenantConfig: {
    modules: {
      dashboard: true,
      employees: true,
      organization: true,
      payroll: true,
      workforcePlanning: true,
      strategicGrowth: false,
      revenueForecasting: false,
    },
    permissions: {
      canInviteUsers: true,
      canConfigureIntegrations: true,
      canAccessBilling: true,
    },
  },
  security: {
    password: {
      minLength: 12,
      requireSpecialChar: true,
      requireNumbers: true,
      requireUppercase: true,
      expirationDays: 90,
    },
    mfaRequired: {
      systemAdmins: true,
      tenantAdmins: true,
      allUsers: false,
    },
    sessionTimeout: 30,
  },
  emailTemplates: [
    {
      id: "welcome",
      name: "Welcome Email",
      subject: "Welcome to HR Suite!",
      lastEdited: "2025-03-12T14:30:00Z",
    },
    {
      id: "passwordReset",
      name: "Password Reset",
      subject: "Reset Your HR Suite Password",
      lastEdited: "2025-02-08T11:15:00Z",
    },
  ],
}

export function SystemSettings() {
  return (
    <Tabs defaultValue="tenant" className="space-y-6">
      <TabsList>
        <TabsTrigger value="tenant">Default Tenant Config</TabsTrigger>
        <TabsTrigger value="security">Security Settings</TabsTrigger>
        <TabsTrigger value="email">Email Templates</TabsTrigger>
      </TabsList>

      <TabsContent value="tenant">
        <Card>
          <CardHeader>
            <CardTitle>Default Module Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(mockSystemSettings.defaultTenantConfig.modules).map(
                ([module, enabled]) => (
                  <div
                    key={module}
                    className="flex items-center justify-between space-x-2"
                  >
                    <Label htmlFor={module} className="flex flex-col space-y-1">
                      <span className="capitalize">
                        {module.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                    </Label>
                    <Switch id={module} checked={enabled as boolean} />
                  </div>
                )
              )}
            </div>
            <Separator />
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Default Permissions</h4>
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(
                  mockSystemSettings.defaultTenantConfig.permissions
                ).map(([permission, enabled]) => (
                  <div
                    key={permission}
                    className="flex items-center justify-between space-x-2"
                  >
                    <Label htmlFor={permission} className="flex flex-col space-y-1">
                      <span className="capitalize">
                        {permission.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                    </Label>
                    <Switch id={permission} checked={enabled} />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="security">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Password Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="minLength">Minimum Length</Label>
                  <Input
                    id="minLength"
                    type="number"
                    value={mockSystemSettings.security.password.minLength.toString()}
                  />
                </div>
                <div className="space-y-4">
                  {Object.entries(mockSystemSettings.security.password)
                    .filter(([key, value]) => typeof value === "boolean")
                    .map(([requirement, enabled]) => (
                      <div
                        key={requirement}
                        className="flex items-center justify-between space-x-2"
                      >
                        <Label htmlFor={requirement}>
                          {requirement.replace(/([A-Z])/g, " $1").trim()}
                        </Label>
                        <Switch id={requirement} checked={enabled as boolean} />
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>MFA Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(mockSystemSettings.security.mfaRequired).map(
                ([role, required]) => (
                  <div
                    key={role}
                    className="flex items-center justify-between space-x-2"
                  >
                    <Label htmlFor={role}>
                      {role.replace(/([A-Z])/g, " $1").trim()}
                    </Label>
                    <Switch id={role} checked={required} />
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="email">
        <Card>
          <CardHeader>
            <CardTitle>Email Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockSystemSettings.emailTemplates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between space-x-4 rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{template.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {template.subject}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last edited:{" "}
                      {new Date(template.lastEdited).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="outline">Edit Template</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
