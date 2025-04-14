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
import { useIntegration } from "@/contexts/integration-context"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

interface IntegrationProps {
  id: string
  name: string
  system_type: string
  description?: string
  is_active: boolean
  last_sync_at?: string
  logo?: string
}

const systemDescriptions: Record<string, string> = {
  sap: "Employee data and organizational structure",
  workday: "Payroll and benefits management",
  oracle: "Performance management and learning",
  microsoft_dynamics: "HR and workforce management",
  generic_rest: "Custom REST API integration",
  csv_file: "CSV file import"
}

export function ERPIntegration() {
  const [activeTab, setActiveTab] = useState("configured")
  const { integrations, isLoading, error, refreshIntegrations, triggerSync, toggleIntegrationStatus } = useIntegration()
  const { toast } = useToast()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}
          <Button variant="outline" size="sm" className="mt-2" onClick={refreshIntegrations}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

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
              <IntegrationCard 
                key={integration.id} 
                integration={integration}
                onSync={triggerSync}
                onStatusToggle={toggleIntegrationStatus}
              />
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
                <Input id="api-key" type="password" defaultValue="••••••••••••••••" />
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

function IntegrationCard({ integration, onSync, onStatusToggle }: { integration: IntegrationProps; onSync?: (id: string) => void; onStatusToggle?: (id: string) => void }) {
  const [syncing, setSyncing] = useState(false)

  const handleSync = () => {
    setSyncing(true)
    if (onSync) {
      onSync(integration.id)
    }
    setTimeout(() => setSyncing(false), 2000)
  }

  const handleStatusToggle = () => {
    if (onStatusToggle) {
      onStatusToggle(integration.id)
    }
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
            <img 
              src={integration.logo || `/placeholder.svg?system=${integration.system_type}`} 
              alt={integration.name} 
              className="h-10 w-10 rounded" 
            />
            <div>
              <CardTitle className="text-base">{integration.name}</CardTitle>
              <CardDescription>{systemDescriptions[integration.system_type] || integration.description}</CardDescription>
            </div>
          </div>
          {getStatusIcon(integration.is_active)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <span>Status:</span>
            {getStatusBadge(integration.is_active)}
          </div>
          {integration.last_sync_at && (
            <span className="text-muted-foreground">
              Last sync: {new Date(integration.last_sync_at).toLocaleString()}
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSync}
          disabled={!integration.is_active || syncing}
        >
          {syncing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-1" />
              Sync Now
            </>
          )}
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleStatusToggle}
          >
            {integration.is_active ? 'Deactivate' : 'Activate'}
          </Button>
          <Button variant="ghost" size="sm">
            Configure
          </Button>
        </div>
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

