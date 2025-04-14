import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Power, RefreshCcw, ExternalLink } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface IntegrationsListProps {
  integrations: any[]
  onActivate: (id: string, activate: boolean) => void
  onDelete: (id: string) => void
  onSync: (id: string) => void
  onEdit: (id: string) => void
}

export function IntegrationsList({ integrations, onActivate, onDelete, onSync, onEdit }: IntegrationsListProps) {
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

  const getSystemIcon = (systemType: string) => {
    // For a real implementation, you would use actual logos here
    return <ExternalLink className="h-4 w-4" />
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {integrations.map((integration) => {
        const isActive = integration.is_active
        const lastSync = integration.last_sync_at
          ? formatDistanceToNow(new Date(integration.last_sync_at), { addSuffix: true })
          : 'Never'
        const nextSync = integration.next_sync_at && isActive
          ? formatDistanceToNow(new Date(integration.next_sync_at), { addSuffix: true })
          : '-'

        return (
          <Card key={integration.id} className={isActive ? 'border-primary/25' : ''}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  {getSystemIcon(integration.system_type)}
                  <CardTitle className="ml-2">{integration.name}</CardTitle>
                </div>
                <Badge variant={isActive ? "default" : "outline"}>
                  {isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <CardDescription>{getSystemLabel(integration.system_type)}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Frequency</div>
                <div className="font-medium">
                  {integration.sync_frequency === 'manual' ? 'Manual' : 
                   integration.sync_frequency.charAt(0).toUpperCase() + integration.sync_frequency.slice(1)}
                </div>
                <div className="text-muted-foreground">Last Sync</div>
                <div className="font-medium">{lastSync}</div>
                <div className="text-muted-foreground">Next Sync</div>
                <div className="font-medium">{nextSync}</div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(integration.id)}>
                  <Pencil className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onActivate(integration.id, !isActive)}
                >
                  <Power className="h-4 w-4 mr-1" />
                  {isActive ? "Deactivate" : "Activate"}
                </Button>
              </div>
              <div className="flex space-x-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Integration</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this integration? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(integration.id)} className="bg-destructive text-destructive-foreground">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button variant="default" size="icon" onClick={() => onSync(integration.id)}>
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
