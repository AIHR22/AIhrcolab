"use client"

import { useEffect } from "react"

import { useState } from "react"

import { format, differenceInCalendarDays } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabaseClient"
import { useRealtime } from "@/hooks/use-realtime"

interface TimeOffRequest {
  id: string
  employee_id: string
  employee_name: string
  start_date: string
  end_date: string
  type: string
  reason: string
  notes?: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  updated_at: string
}

export function TimeOffApprovals() {
  const { toast } = useToast()

  // In a real app, you'd filter by the current user's managed employees
  const {
    data: pendingRequests,
    loading,
    error,
    setData,
  } = useRealtime<TimeOffRequest>("time_off_requests", [], { filterColumn: "status", filterValue: "pending" })

  const [employeeMap, setEmployeeMap] = useState<Record<string, string>>({})

  // Fetch employee names
  useEffect(() => {
    const fetchEmployeeNames = async () => {
      const { data, error } = await supabase.from("employees").select("id, name")

      if (!error && data) {
        const map: Record<string, string> = {}
        data.forEach((emp) => {
          map[emp.id] = emp.name
        })
        setEmployeeMap(map)
      }
    }

    fetchEmployeeNames()
  }, [])

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from("time_off_requests")
        .update({
          status: "approved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error

      // Optimistically update the UI
      setData(pendingRequests.filter((request) => request.id !== id))

      toast({
        title: "Request approved",
        description: "The time off request has been approved.",
      })
    } catch (error) {
      console.error("Error approving request:", error)
      toast({
        title: "Error",
        description: "Failed to approve request. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from("time_off_requests")
        .update({
          status: "rejected",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error

      // Optimistically update the UI
      setData(pendingRequests.filter((request) => request.id !== id))

      toast({
        title: "Request rejected",
        description: "The time off request has been rejected.",
      })
    } catch (error) {
      console.error("Error rejecting request:", error)
      toast({
        title: "Error",
        description: "Failed to reject request. Please try again.",
        variant: "destructive",
      })
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
    <Card>
      <CardHeader>
        <CardTitle>Pending Approvals</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading pending requests...</div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md text-red-500">Error loading requests: {error.message}</div>
        ) : pendingRequests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No pending time off requests to approve</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests
              .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
              .map((request) => {
                const startDate = new Date(request.start_date)
                const endDate = new Date(request.end_date)
                const days = differenceInCalendarDays(endDate, startDate) + 1

                return (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">{getTypeBadge(request.type)}</div>
                          <p className="font-medium">{employeeMap[request.employee_id] || "Employee"}</p>
                          <p className="text-sm">
                            {format(startDate, "MMM d, yyyy")} - {format(endDate, "MMM d, yyyy")}
                            <span className="text-sm text-muted-foreground ml-2">
                              ({days} {days === 1 ? "day" : "days"})
                            </span>
                          </p>
                          <p className="text-sm mt-1">{request.reason}</p>
                          {request.notes && <p className="text-sm text-muted-foreground mt-1">{request.notes}</p>}
                        </div>
                        <div className="flex gap-2 md:self-center">
                          <Button
                            variant="outline"
                            className="border-green-500 text-green-500 hover:bg-green-50"
                            onClick={() => handleApprove(request.id)}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            className="border-red-500 text-red-500 hover:bg-red-50"
                            onClick={() => handleReject(request.id)}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

