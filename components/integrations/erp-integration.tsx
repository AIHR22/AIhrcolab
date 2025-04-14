"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, RefreshCw, Link } from "lucide-react"

interface IntegrationProps {
  name: string
  description: string
  status: "connected" | "disconnected" | "error"
  logo: string
  lastSync?: string
}

const integrations: IntegrationProps[] = [
  {
    name: "SAP SuccessFactors",
    description: "Employee data and organizational structure",
    status: "connected",
    logo: "/placeholder.svg?height=40&width=40",
    lastSync: "2023-03-12T14:30:00Z",
  },
  {
    name: "Workday",
    description: "Payroll and benefits management",
    status: "disconnected",
    logo: "/placeholder.svg?height=40&width=40",
  },
  {
    name: "Oracle HCM",
    description: "Performance management and learning",
    status: "error",
    logo: "/placeholder.svg?height=40&width=40",
    lastSync: "2023-03-10T09:15:00Z",
  },
  {
    name: "ADP",
    description: "Payroll and tax filing",
    status: "connected",
    logo: "/placeholder.svg?height=40&width=40",
    lastSync: "2023-03-13T08:45:00Z",
  },
]

export function ERPIntegration() {
  const [activeTab, setActiveTab] = useState("configured")

  return (
    <div>
      <Tabs defaultValue="configured" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="configured">Configured</TabsTrigger>
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="configured">
          <div className="grid gap-4 md:grid-cols-2">
            {integrations.map((integration) => (
              <IntegrationCard key={integration.name} integration={integration} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="available">
          <div className="grid gap-4 md:grid-cols-2">
            <AvailableIntegrationCard
              name="Microsoft Dynamics 365"
              description="HR, finance, and operations management"
              logo="/placeholder.svg?height=40&width=40"
            />
            <AvailableIntegrationCard
              name="BambooHR"
              description="Employee records and onboarding"
              logo="/placeholder.svg?height=40&width=40"
            />
            <AvailableIntegrationCard
              name="Sage People"
              description="Global workforce management"
              logo="/placeholder.svg?height=40&width=40"
            />
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
              <CardDescription>Configure global settings for all integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sync-frequency">Sync Frequency</Label>
                <Select defaultValue="daily">
                  <SelectTrigger id="sync-frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-key">Global API Key</Label>
                <Input id="api-key" type="password" value="••••••••••••••••" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-sync">Automatic Sync</Label>
                  <p className="text-sm text-muted-foreground">Automatically sync data on schedule</p>
                </div>
                <Switch id="auto-sync" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="error-notifications">Error Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications for sync errors</p>
                </div>
                <Switch id="error-notifications" defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function IntegrationCard({ integration }: { integration: IntegrationProps }) {
  const [syncing, setSyncing] = useState(false)

  const handleSync = () => {
    setSyncing(true)
    setTimeout(() => setSyncing(false), 2000)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return <Badge className="bg-green-100 text-green-800">Connected</Badge>
      case "disconnected":
        return <Badge variant="outline">Disconnected</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      default:
        return null
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "disconnected":
        return <Link className="h-5 w-5 text-muted-foreground" />
      case "error":
        return <XCircle className="h-5 w-5 text-destructive" />
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <img src={integration.logo || "/placeholder.svg"} alt={integration.name} className="h-10 w-10 rounded" />
            <div>
              <CardTitle className="text-base">{integration.name}</CardTitle>
              <CardDescription>{integration.description}</CardDescription>
            </div>
          </div>
          {getStatusIcon(integration.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <span>Status:</span>
            {getStatusBadge(integration.status)}
          </div>
          {integration.lastSync && (
            <span className="text-muted-foreground">Last sync: {new Date(integration.lastSync).toLocaleString()}</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm">
          Configure
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleSync}
          disabled={integration.status === "disconnected" || syncing}
        >
          {syncing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Now
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

function AvailableIntegrationCard({ name, description, logo }: { name: string; description: string; logo: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <img src={logo || "/placeholder.svg"} alt={name} className="h-10 w-10 rounded" />
          <div>
            <CardTitle className="text-base">{name}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Connect to import and synchronize data from {name}.</p>
      </CardContent>
      <CardFooter>
        <Button>Connect</Button>
      </CardFooter>
    </Card>
  )
}

