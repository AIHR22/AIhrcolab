"use client"

import { useState } from "react"
import { format, differenceInCalendarDays } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash, Calendar } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useRealtime } from "@/hooks/use-realtime"

interface TimeOffRequest {
  id: string
  employee_id: string
  start_date: string
  end_date: string
  type: string
  reason: string
  notes?: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  updated_at: string
}

const supabase = createClient()

export function TimeOffList() {
  const [requestToCancel, setRequestToCancel] = useState<TimeOffRequest | null>(null)
  const { toast } = useToast()

  // In a real app, you'd get the current user's ID
  const currentUserId = "current-user-id"

  const {
    data: timeOffRequests,
    loading,
    error,
    setData,
  } = useRealtime<TimeOffRequest>("time_off_requests", [], { filterColumn: "employee_id", filterValue: currentUserId })

  const handleCancel = async () => {
    if (!requestToCancel) return

    try {
      const { error } = await supabase.from("time_off_requests").delete().eq("id", requestToCancel.id)

      if (error) throw error

      // Optimistically update the UI
      setData(timeOffRequests.filter((request) => request.id !== requestToCancel.id))

      toast({
        title: "Request cancelled",
        description: "Your time off request has been cancelled.",
      })
    } catch (error) {
      console.error("Error cancelling request:", error)
      toast({
        title: "Error",
        description: "Failed to cancel request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setRequestToCancel(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "vacation":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            Vacation
          </Badge>
        )
      case "sick":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
            Sick Leave
          </Badge>
        )
      case "personal":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
            Personal
          </Badge>
        )
      case "bereavement":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
            Bereavement
          </Badge>
        )
      default:
        return <Badge variant="outline">Other</Badge>
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>My Time Off Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading your requests...</div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md text-red-500">Error loading requests: {error.message}</div>
          ) : timeOffRequests.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">You don't have any time off requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {timeOffRequests
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((request) => {
                  const startDate = new Date(request.start_date)
                  const endDate = new Date(request.end_date)
                  const days = differenceInCalendarDays(endDate, startDate) + 1

                  return (
                    <Card key={request.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              {getTypeBadge(request.type)}
                              {getStatusBadge(request.status)}
                            </div>
                            <p className="font-medium">
                              {format(startDate, "MMM d, yyyy")} - {format(endDate, "MMM d, yyyy")}
                              <span className="text-sm text-muted-foreground ml-2">
                                ({days} {days === 1 ? "day" : "days"})
                              </span>
                            </p>
                            <p className="text-sm mt-1">{request.reason}</p>
                            {request.notes && <p className="text-sm text-muted-foreground mt-1">{request.notes}</p>}
                            <p className="text-xs text-muted-foreground mt-2">
                              Requested on {format(new Date(request.created_at), "MMM d, yyyy")}
                            </p>
                          </div>
                          {request.status === "pending" && (
                            <Button variant="ghost" size="icon" onClick={() => setRequestToCancel(request)}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!requestToCancel} onOpenChange={(open) => !open && setRequestToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Time Off Request?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your time off request. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Request</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-red-600">
              Cancel Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

