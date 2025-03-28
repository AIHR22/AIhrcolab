"use client"

import { useState } from "react"
import { Calendar, Clock, Edit, Eye, MoreHorizontal, PlusCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for performance reviews
const reviewsData = [
  {
    id: 1,
    employeeId: "EMP001",
    employeeName: "John Smith",
    position: "Senior Developer",
    avatar: "/placeholder.svg?height=40&width=40",
    reviewType: "Annual",
    status: "Scheduled",
    scheduledDate: "Apr 15, 2025",
    manager: "Sarah Williams",
    lastReviewDate: "Apr 10, 2024",
  },
  {
    id: 2,
    employeeId: "EMP004",
    employeeName: "Jessica Davis",
    position: "HR Specialist",
    avatar: "/placeholder.svg?height=40&width=40",
    reviewType: "Quarterly",
    status: "In Progress",
    scheduledDate: "Apr 5, 2025",
    manager: "Lisa Martinez",
    lastReviewDate: "Jan 5, 2025",
  },
  {
    id: 3,
    employeeId: "EMP002",
    employeeName: "Emily Johnson",
    position: "Marketing Manager",
    avatar: "/placeholder.svg?height=40&width=40",
    reviewType: "Annual",
    status: "Completed",
    scheduledDate: "Mar 20, 2025",
    manager: "David Wilson",
    lastReviewDate: "Mar 15, 2024",
  },
  {
    id: 4,
    employeeId: "EMP008",
    employeeName: "Jennifer Anderson",
    position: "UI/UX Designer",
    avatar: "/placeholder.svg?height=40&width=40",
    reviewType: "Probation",
    status: "Scheduled",
    scheduledDate: "Apr 25, 2025",
    manager: "Michael Chen",
    lastReviewDate: "N/A",
  },
  {
    id: 5,
    employeeId: "EMP005",
    employeeName: "David Wilson",
    position: "Product Manager",
    avatar: "/placeholder.svg?height=40&width=40",
    reviewType: "Quarterly",
    status: "Overdue",
    scheduledDate: "Mar 30, 2025",
    manager: "Robert Johnson",
    lastReviewDate: "Dec 30, 2024",
  },
]

export function PerformanceReviews() {
  const [filter, setFilter] = useState("all")

  const filteredReviews =
    filter === "all"
      ? reviewsData
      : reviewsData.filter((review) => review.status.toLowerCase().replace(/\s+/g, "-") === filter)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reviews</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Schedule Review
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Review Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Scheduled Date</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Last Review</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={review.avatar} alt={review.employeeName} />
                      <AvatarFallback>
                        {review.employeeName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{review.employeeName}</div>
                      <div className="text-xs text-muted-foreground">{review.position}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{review.reviewType}</Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      review.status === "Completed"
                        ? "default"
                        : review.status === "In Progress"
                          ? "secondary"
                          : review.status === "Overdue"
                            ? "destructive"
                            : "outline"
                    }
                  >
                    {review.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{review.scheduledDate}</span>
                  </div>
                </TableCell>
                <TableCell>{review.manager}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{review.lastReviewDate}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      {review.status === "Completed" && (
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View review
                        </DropdownMenuItem>
                      )}
                      {(review.status === "Scheduled" || review.status === "Overdue") && (
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Start review
                        </DropdownMenuItem>
                      )}
                      {review.status === "In Progress" && (
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Continue review
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Calendar className="mr-2 h-4 w-4" />
                        Reschedule
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

