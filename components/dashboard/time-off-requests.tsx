"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import { format } from "date-fns"
import { getPendingTimeOffRequests, updateTimeOffRequest } from "@/lib/supabase/api"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"

interface TimeOffRequest {
  id: string
  type: "vacation" | "sick" | "personal" | "other"
  start_date: string
  end_date: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  employees: {
    id: string
    name: string
    avatar_url: string | null
  }
}

export function TimeOffRequests() {
  const [requests, setRequests] = useState<TimeOffRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    fetchRequests()
  }, [])

  async function fetchRequests() {
    try {
      const data = await getPendingTimeOffRequests(4)
      setRequests(data)
    } catch (err) {
      console.error("Error fetching time off requests:", err)
      setError("Failed to load time off requests")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      setProcessing(id)
      await updateTimeOffRequest(id, "approved")
      setRequests((prev) => prev.filter((request) => request.id !== id))
      toast({
        title: "Request approved",
        description: "The time off request has been approved",
      })
    } catch (err) {
      console.error("Error approving request:", err)
      toast({
        title: "Error",
        description: "Failed to approve the request",
        variant: "destructive",
      })
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (id: string) => {
    try {
      setProcessing(id)
      await updateTimeOffRequest(id, "rejected")
      setRequests((prev) => prev.filter((request) => request.id !== id))
      toast({
        title: "Request rejected",
        description: "The time off request has been rejected",
      })
    } catch (err) {
      console.error("Error rejecting request:", err)
      toast({
        title: "Error",
        description: "Failed to reject the request",
        variant: "destructive",
      })
    } finally {
      setProcessing(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-start gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="bg-red-50 p-4 rounded-md text-red-500">{error}</div>
  }

  if (requests.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">No pending time off requests</div>
  }

  const getRequestTypeBadge = (type: TimeOffRequest["type"]) => {
    switch (type) {
      case "vacation":
        return <Badge className="bg-blue-500">Vacation</Badge>
      case "sick":
        return <Badge className="bg-red-500">Sick</Badge>
      case "personal":
        return <Badge className="bg-purple-500">Personal</Badge>
      case "other":
        return <Badge>Other</Badge>
      default:
        return <Badge>Time Off</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div key={request.id} className="flex items-start gap-4">
          <Avatar>
            <AvatarImage
              src={request.employees.avatar_url || "/placeholder.svg?height=32&width=32"}
              alt={request.employees.name}
            />
            <AvatarFallback>
              {request.employees.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium leading-none">{request.employees.name}</p>
              {getRequestTypeBadge(request.type)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="mr-1 h-3 w-3" />
              {format(new Date(request.start_date), "MMM d")} - {format(new Date(request.end_date), "MMM d, yyyy")}
            </div>
            <p className="text-xs text-muted-foreground">
              Requested {format(new Date(request.created_at), "MMM d, yyyy")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 bg-green-500/10 hover:bg-green-500/20 text-green-500 border-green-500/20"
              onClick={() => handleApprove(request.id)}
              disabled={processing === request.id}
            >
              {processing === request.id ? "Processing..." : "Approve"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/20"
              onClick={() => handleReject(request.id)}
              disabled={processing === request.id}
            >
              {processing === request.id ? "Processing..." : "Reject"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

