"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, RefreshCcw, Clock, Database, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { NewIntegrationDialog } from "../../components/integrations/new-integration-dialog"
import { IntegrationsList } from "../../components/integrations/integrations-list"
import { SyncLogsList } from "../../components/integrations/sync-logs-list"

export default function IntegrationsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [integrations, setIntegrations] = useState<any[]>([])
  const [syncLogs, setSyncLogs] = useState<any[]>([])
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("integrations")
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadIntegrations()
    loadSyncLogs()
  }, [])

  const loadIntegrations = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/integrations")
      if (!response.ok) {
        throw new Error("Failed to load integrations")
      }
      const data = await response.json()
      setIntegrations(data)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading integrations",
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadSyncLogs = async () => {
    try {
      const response = await fetch("/api/integrations/sync-logs?limit=20")
      if (!response.ok) {
        throw new Error("Failed to load sync logs")
      }
      const data = await response.json()
      setSyncLogs(data)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading sync logs",
        description: error.message,
      })
    }
  }

  const handleActivateIntegration = async (id: string, activate: boolean) => {
    try {
      const response = await fetch(`/api/integrations/${id}?action=activate`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: activate }),
      })

      if (!response.ok) {
        throw new Error("Failed to update integration status")
      }

      toast({
        title: `Integration ${activate ? "activated" : "deactivated"} successfully`,
        description: activate 
          ? "The system will now sync data according to the configured schedule" 
          : "The integration has been paused"
      })

      loadIntegrations()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating integration",
        description: error.message,
      })
    }
  }

  const handleDeleteIntegration = async (id: string) => {
    try {
      const response = await fetch(`/api/integrations/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete integration")
      }

      toast({
        title: "Integration deleted successfully",
      })

      loadIntegrations()
      loadSyncLogs()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting integration",
        description: error.message,
      })
    }
  }

  const handleSyncNow = async (id: string) => {
    try {
      const response = await fetch(`/api/integrations?action=sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          integration_id: id,
          options: {
            entities: ["employees", "departments"],
            full_sync: false,
            delete_missing: false,
            batch_size: 100,
            test_mode: false
          }
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to start sync")
      }

      toast({
        title: "Sync started successfully",
        description: "You can view the progress in the Sync Logs tab"
      })

      // Set active tab to sync logs
      setActiveTab("sync-logs")
      // Refresh sync logs after a brief delay
      setTimeout(() => {
        loadSyncLogs()
      }, 2000)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error starting sync",
        description: error.message,
      })
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground">
            Connect to your ERP, HRIS, and other enterprise systems to sync employee data
          </p>
        </div>
        <Button onClick={() => setShowNewDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Integration
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="integrations">
            <Database className="mr-2 h-4 w-4" />
            Configured Integrations
          </TabsTrigger>
          <TabsTrigger value="sync-logs">
            <Clock className="mr-2 h-4 w-4" />
            Sync Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="integrations">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-9 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : integrations.length === 0 ? (
            <Alert>
              <AlertTitle>No integrations configured</AlertTitle>
              <AlertDescription>
                Get started by clicking the "New Integration" button to connect your enterprise systems.
              </AlertDescription>
            </Alert>
          ) : (
            <IntegrationsList 
              integrations={integrations} 
              onActivate={handleActivateIntegration}
              onDelete={handleDeleteIntegration}
              onSync={handleSyncNow}
              onEdit={(id) => router.push(`/integrations/${id}`)}
            />
          )}
        </TabsContent>

        <TabsContent value="sync-logs">
          <SyncLogsList 
            logs={syncLogs} 
            isLoading={false} 
            onRefresh={loadSyncLogs} 
          />
        </TabsContent>
      </Tabs>

      <NewIntegrationDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        onSuccess={(newIntegration) => {
          setShowNewDialog(false)
          loadIntegrations()
          toast({
            title: "Integration created successfully",
            description: `${newIntegration.name} has been set up and is ready to use`
          })
        }}
      />
    </div>
  )
}
