import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"

interface SyncLogsListProps {
  logs: any[]
  isLoading: boolean
  onRefresh: () => void
}

export function SyncLogsList({ logs, isLoading, onRefresh }: SyncLogsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-20" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No sync logs found</CardTitle>
          <CardDescription>
            Sync logs will appear here once you start synchronizing data from your integrated systems.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pt-4">
          <Button onClick={onRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </CardContent>
      </Card>
    )
  }

  const formatDuration = (startTime: string, endTime: string | null) => {
    if (!endTime) return 'In progress...'
    
    const start = new Date(startTime).getTime()
    const end = new Date(endTime).getTime()
    const durationMs = end - start
    
    // Format duration
    if (durationMs < 1000) return `${durationMs}ms`
    if (durationMs < 60000) return `${Math.floor(durationMs / 1000)}s`
    if (durationMs < 3600000) return `${Math.floor(durationMs / 60000)}m ${Math.floor((durationMs % 60000) / 1000)}s`
    return `${Math.floor(durationMs / 3600000)}h ${Math.floor((durationMs % 3600000) / 60000)}m`
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-destructive" />
      case 'partial':
        return <AlertCircle className="h-4 w-4 text-amber-500" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500">Success</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      case 'partial':
        return <Badge variant="outline" className="text-amber-500 border-amber-500">Partial</Badge>
      default:
        return <Badge variant="outline">In Progress</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Recent Sync Activities</h3>
        <Button onClick={onRefresh} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {logs.map((log) => {
        const date = new Date(log.start_time)

        return (
          <Card key={log.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(log.status)}
                  <CardTitle className="text-base">
                    {log.sync_type === 'full' ? 'Full Sync' : 
                     log.sync_type.split(',').map((t: string) => t.trim())
                       .map((t: string) => t.charAt(0).toUpperCase() + t.slice(1))
                       .join(' & ')} Sync
                  </CardTitle>
                </div>
                {getStatusBadge(log.status)}
              </div>
              <CardDescription>
                {format(date, 'PPpp')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Duration</div>
                  <div className="font-medium">{formatDuration(log.start_time, log.end_time)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Processed</div>
                  <div className="font-medium">{log.records_processed}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Created</div>
                  <div className="font-medium text-green-600">{log.records_created}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Updated</div>
                  <div className="font-medium text-blue-600">{log.records_updated}</div>
                </div>
              </div>
              
              {log.error_message && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
                  <div className="font-semibold">Error:</div>
                  <div>{log.error_message}</div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
