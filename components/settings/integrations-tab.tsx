"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { ExternalLink, RefreshCw, PlusCircle, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export function IntegrationsTab() {
  const [integrations, setIntegrations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchIntegrations()
  }, [])

  const fetchIntegrations = async () => {
    try {
      setIsLoading(true)
      setIsError(false)
      const response = await fetch("/api/integrations/simplified")
      
      if (!response.ok) {
        throw new Error("Failed to fetch integrations")
      }

      const data = await response.json()
      setIntegrations(data)
    } catch (error) {
      console.error("Error fetching integrations:", error)
      setIsError(true)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load integrations. Please try again."
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getSystemLabel = (systemType: string) => {
    const systemMap: Record<string, string> = {
      'sap': 'SAP SuccessFactors',
      'oracle': 'Oracle HCM Cloud',
      'workday': 'Workday',
      'microsoft_dynamics': 'Microsoft Dynamics 365',
      'generic_rest': 'REST API',
      'csv_file': 'CSV File Import'
    }
    return systemMap[systemType] || systemType
  }

  const triggerSync = async (id: string) => {
    try {
      const response = await fetch(`/api/integrations/simplified?action=sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          integration_id: id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to start synchronization")
      }

      toast({
        title: "Synchronization started",
        description: "The system will begin updating employees and departments."
      })
    } catch (error) {
      console.error("Error triggering sync:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start synchronization. Please try again."
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">ERP & HRIS Integrations</h3>
            <p className="text-sm text-muted-foreground">Sync employee and department data from external systems</p>
          </div>
          <Skeleton className="h-9 w-24" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-32 rounded-md" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Failed to load integrations</AlertTitle>
        <AlertDescription>
          There was an error loading your integrations. Please refresh the page or try again later.
          <Button variant="outline" size="sm" className="mt-2" onClick={fetchIntegrations}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">ERP & HRIS Integrations</h3>
          <p className="text-sm text-muted-foreground">Sync employee and department data from external systems</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchIntegrations}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
          <Button size="sm" onClick={() => router.push('/integrations')}>
            <Settings className="h-4 w-4 mr-1" /> Manage Integrations
          </Button>
        </div>
      </div>

      {integrations.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No integrations configured</CardTitle>
            <CardDescription>
              Connect your HR systems to automatically sync employee and department data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Integrating with your existing ERP or HRIS systems allows automatic synchronization of:
            </p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1 mb-4">
              <li>Employee profiles and contact information</li>
              <li>Department structure and hierarchy</li>
              <li>Job positions and titles</li>
              <li>Reporting relationships</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push('/integrations')}>
              <PlusCircle className="h-4 w-4 mr-1" /> Add Integration
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {integrations.map((integration) => (
              <Card key={integration.id} className={integration.is_active ? 'border-primary/25' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{integration.name}</CardTitle>
                    <Badge variant={integration.is_active ? "default" : "outline"}>
                      {integration.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <CardDescription>{getSystemLabel(integration.system_type)}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-sm grid grid-cols-2 gap-x-4 gap-y-1">
                    <div className="text-muted-foreground">Last Sync:</div>
                    <div>
                      {integration.last_sync_at 
                        ? new Date(integration.last_sync_at).toLocaleDateString() 
                        : 'Never'}
                    </div>
                    <div className="text-muted-foreground">Frequency:</div>
                    <div className="capitalize">{integration.sync_frequency}</div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => triggerSync(integration.id)}
                    disabled={!integration.is_active}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" /> Sync Now
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    asChild
                  >
                    <Link href={`/integrations/${integration.id}`}>
                      <Settings className="h-3 w-3 mr-1" /> Configure
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
            
            <Card className="border-dashed border-2 flex flex-col items-center justify-center p-6 hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => router.push('/integrations')}>
              <PlusCircle className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Add New Integration</p>
              <p className="text-xs text-muted-foreground mt-1">Connect to another system</p>
            </Card>
          </div>
          
          <div className="flex justify-end">
            <Button variant="outline" size="sm" asChild>
              <Link href="/integrations/sync-logs">
                View Sync History
              </Link>
            </Button>
          </div>
        </div>
      )}
      
      <Alert>
        <AlertTitle>Automatic Updates</AlertTitle>
        <AlertDescription>
          When an integration is active, employee and department data will be automatically synchronized based on the configured schedule.
          You can also trigger a manual sync at any time.
        </AlertDescription>
      </Alert>
    </div>
  )
}
