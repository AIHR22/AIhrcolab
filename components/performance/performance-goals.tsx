"use client"

import { useState } from "react"
import { CheckCircle2, Circle, Edit, MoreHorizontal, PlusCircle, Trash2 } from "lucide-react"
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

// Mock data for performance goals
const goalsData = [
  {
    id: 1,
    title: "Improve customer satisfaction score by 15%",
    description: "Work with the support team to identify and address key customer pain points",
    employeeId: "EMP001",
    employeeName: "John Smith",
    avatar: "/placeholder.svg?height=40&width=40",
    category: "Customer Success",
    status: "In Progress",
    progress: 65,
    dueDate: "Jun 30, 2025",
    alignedWith: "Company",
  },
  {
    id: 2,
    title: "Complete Advanced Project Management certification",
    description: "Enroll and complete the APM certification to enhance project management skills",
    employeeId: "EMP004",
    employeeName: "Jessica Davis",
    avatar: "/placeholder.svg?height=40&width=40",
    category: "Professional Development",
    status: "In Progress",
    progress: 40,
    dueDate: "Aug 15, 2025",
    alignedWith: "Department",
  },
  {
    id: 3,
    title: "Reduce department expenses by 10%",
    description: "Identify cost-saving opportunities and implement efficiency measures",
    employeeId: "EMP002",
    employeeName: "Emily Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    category: "Financial",
    status: "Not Started",
    progress: 0,
    dueDate: "Sep 30, 2025",
    alignedWith: "Department",
  },
  {
    id: 4,
    title: "Launch new product feature",
    description: "Lead the development and launch of the new analytics dashboard feature",
    employeeId: "EMP005",
    employeeName: "David Wilson",
    avatar: "/placeholder.svg?height=40&width=40",
    category: "Product Development",
    status: "Completed",
    progress: 100,
    dueDate: "Mar 15, 2025",
    alignedWith: "Team",
  },
  {
    id: 5,
    title: "Mentor two junior team members",
    description: "Provide regular guidance and support to help junior team members develop their skills",
    employeeId: "EMP008",
    employeeName: "Jennifer Anderson",
    avatar: "/placeholder.svg?height=40&width=40",
    category: "Leadership",
    status: "In Progress",
    progress: 75,
    dueDate: "Dec 31, 2025",
    alignedWith: "Individual",
  },
]

export function PerformanceGoals() {
  const [filter, setFilter] = useState("all")

  const filteredGoals =
    filter === "all" ? goalsData : goalsData.filter((goal) => goal.status.toLowerCase().replace(/\s+/g, "-") === filter)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Goals</SelectItem>
            <SelectItem value="not-started">Not Started</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Goal
        </Button>
      </div>

      <div className="space-y-4">
        {filteredGoals.map((goal) => (
          <div key={goal.id} className="rounded-lg border p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {goal.status === "Completed" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : goal.status === "In Progress" ? (
                    <Circle className="h-5 w-5 text-blue-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-300" />
                  )}
                  <h3 className="font-medium">{goal.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{goal.description}</p>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Badge variant="outline">{goal.category}</Badge>
                  <Badge variant="outline">Due: {goal.dueDate}</Badge>
                  <Badge variant="outline">Aligned: {goal.alignedWith}</Badge>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={goal.avatar} alt={goal.employeeName} />
                  <AvatarFallback>
                    {goal.employeeName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{goal.employeeName}</span>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-2 h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit goal
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Update progress
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete goal
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span>{goal.progress}%</span>
              </div>
              <Progress value={goal.progress} className="mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

