"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for time off requests
const timeOffRequestsData = [
  {
    id: 1,
    employeeId: "EMP001",
    employeeName: "John Smith",
    avatar: "/placeholder.svg?height=32&width=32",
    type: "Vacation",
    startDate: "Apr 5, 2025",
    endDate: "Apr 9, 2025",
    duration: "5 days",
    status: "Pending",
    requestDate: "Mar 15, 2025",
  },
  {
    id: 2,
    employeeId: "EMP004",
    employeeName: "Jessica Davis",
    avatar: "/placeholder.svg?height=32&width=32",
    type: "Sick Leave",
    startDate: "Apr 7, 2025",
    endDate: "Apr 7, 2025",
    duration: "1 day",
    status: "Approved",
    requestDate: "Apr 6, 2025",
  },
  {
    id: 3,
    employeeId: "EMP006",
    employeeName: "Sarah Martinez",
    avatar: "/placeholder.svg?height=32&width=32",
    type: "Personal",
    startDate: "Apr 12, 2025",
    endDate: "Apr 12, 2025",
    duration: "1 day",
    status: "Pending",
    requestDate: "Mar 28, 2025",
  },
  {
    id: 4,
    employeeId: "EMP008",
    employeeName: "Jennifer Anderson",
    avatar: "/placeholder.svg?height=32&width=32",
    type: "Vacation",
    startDate: "Apr 15, 2025",
    endDate: "Apr 19, 2025",
    duration: "5 days",
    status: "Pending",
    requestDate: "Mar 20, 2025",
  },
  {
    id: 5,
    employeeId: "EMP002",
    employeeName: "Emily Johnson",
    avatar: "/placeholder.svg?height=32&width=32",
    type: "Vacation",
    startDate: "May 1, 2025",
    endDate: "May 5, 2025",
    duration: "5 days",
    status: "Approved",
    requestDate: "Mar 25, 2025",
  },
]

export function TimeOffRequests() {
  const [filter, setFilter] = useState("all")

  const filteredRequests =
    filter === "all"
      ? timeOffRequestsData
      : timeOffRequestsData.filter((request) => request.status.toLowerCase() === filter)

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Requests</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="denied">Denied</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={request.avatar} alt={request.employeeName} />
                      <AvatarFallback>
                        {request.employeeName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span>{request.employeeName}</span>
                  </div>
                </TableCell>
                <TableCell>{request.type}</TableCell>
                <TableCell>
                  {request.startDate === request.endDate
                    ? request.startDate
                    : `${request.startDate} - ${request.endDate}`}
                </TableCell>
                <TableCell>{request.duration}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      request.status === "Approved"
                        ? "default"
                        : request.status === "Pending"
                          ? "outline"
                          : "destructive"
                    }
                  >
                    {request.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {request.status === "Pending" && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Deny
                      </Button>
                      <Button size="sm">Approve</Button>
                    </div>
                  )}
                  {request.status !== "Pending" && (
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

