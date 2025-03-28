"use client"

import { useState } from "react"
import { Clock, Edit, Eye, MoreHorizontal, PlusCircle, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for feedback requests
const feedbackData = [
  {
    id: 1,
    employeeId: "EMP001",
    employeeName: "John Smith",
    position: "Senior Developer",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "In Progress",
    requestDate: "Mar 25, 2025",
    dueDate: "Apr 8, 2025",
    respondents: 8,
    responsesReceived: 5,
    progress: 62,
  },
  {
    id: 2,
    employeeId: "EMP004",
    employeeName: "Jessica Davis",
    position: "HR Specialist",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "Completed",
    requestDate: "Mar 10, 2025",
    dueDate: "Mar 24, 2025",
    respondents: 6,
    responsesReceived: 6,
    progress: 100,
  },
  {
    id: 3,
    employeeId: "EMP005",
    employeeName: "David Wilson",
    position: "Product Manager",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "Draft",
    requestDate: "N/A",
    dueDate: "N/A",
    respondents: 7,
    responsesReceived: 0,
    progress: 0,
  },
  {
    id: 4,
    employeeId: "EMP008",
    employeeName: "Jennifer Anderson",
    position: "UI/UX Designer",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "In Progress",
    requestDate: "Mar 20, 2025",
    dueDate: "Apr 3, 2025",
    respondents: 5,
    responsesReceived: 2,
    progress: 40,
  },
]

export function FeedbackRequests() {
  const [filter, setFilter] = useState("all")

  const filteredFeedback =
    filter === "all"
      ? feedbackData
      : feedbackData.filter((feedback) => feedback.status.toLowerCase().replace(/\s+/g, "-") === filter)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Requests</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Feedback Request
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {filteredFeedback.map((feedback) => (
          <div key={feedback.id} className="rounded-lg border p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={feedback.avatar} alt={feedback.employeeName} />
                  <AvatarFallback>
                    {feedback.employeeName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{feedback.employeeName}</h3>
                  <p className="text-sm text-muted-foreground">{feedback.position}</p>
                </div>
              </div>

              <Badge
                variant={
                  feedback.status === "Completed"
                    ? "default"
                    : feedback.status === "In Progress"
                      ? "secondary"
                      : "outline"
                }
              >
                {feedback.status}
              </Badge>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Requested: {feedback.requestDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Due: {feedback.dueDate}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Respondents: {feedback.respondents}</span>
                </div>
                <span>
                  Responses: {feedback.responsesReceived}/{feedback.respondents}
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span>{feedback.progress}%</span>
                </div>
                <Progress value={feedback.progress} className="mt-2" />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  {feedback.status === "Draft" && (
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit request
                    </DropdownMenuItem>
                  )}
                  {feedback.status === "In Progress" && (
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View progress
                    </DropdownMenuItem>
                  )}
                  {feedback.status === "Completed" && (
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View results
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Users className="mr-2 h-4 w-4" />
                    Manage respondents
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

