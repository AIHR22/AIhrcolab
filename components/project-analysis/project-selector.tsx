"use client"

import { useState } from "react"
import { Search, Filter, Clock, CheckCircle, AlertTriangle, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface Project {
  id: string
  name: string
  department: string
  status: "completed" | "in-progress" | "at-risk" | "not-started"
  dueDate: string
  progress: number
}

const sampleProjects: Project[] = [
  {
    id: "1",
    name: "Employee Onboarding Automation",
    department: "HR",
    status: "in-progress",
    dueDate: "2023-12-15",
    progress: 65,
  },
  {
    id: "2",
    name: "Performance Review System",
    department: "HR",
    status: "completed",
    dueDate: "2023-10-30",
    progress: 100,
  },
  {
    id: "3",
    name: "Compliance Training Program",
    department: "Legal",
    status: "at-risk",
    dueDate: "2023-11-20",
    progress: 40,
  },
  {
    id: "4",
    name: "Benefits Portal Update",
    department: "IT",
    status: "not-started",
    dueDate: "2024-01-15",
    progress: 0,
  },
  {
    id: "5",
    name: "Recruitment Process Optimization",
    department: "HR",
    status: "in-progress",
    dueDate: "2023-12-01",
    progress: 75,
  },
]

export function ProjectSelector() {
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredProjects = sampleProjects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDepartment = departmentFilter === "all" || project.department === departmentFilter
    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    return matchesSearch && matchesDepartment && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "in-progress":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "at-risk":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "not-started":
        return <X className="h-5 w-5 text-gray-500" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed"
      case "in-progress":
        return "In Progress"
      case "at-risk":
        return "At Risk"
      case "not-started":
        return "Not Started"
      default:
        return status
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search projects..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="HR">HR</SelectItem>
              <SelectItem value="IT">IT</SelectItem>
              <SelectItem value="Legal">Legal</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="at-risk">At Risk</SelectItem>
              <SelectItem value="not-started">Not Started</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredProjects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-2 w-full">
                  <div
                    className={cn(
                      "absolute h-full",
                      project.status === "completed"
                        ? "bg-green-500"
                        : project.status === "in-progress"
                          ? "bg-blue-500"
                          : project.status === "at-risk"
                            ? "bg-amber-500"
                            : "bg-gray-500",
                    )}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                <div className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <Badge variant="outline">{project.department}</Badge>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(project.status)}
                      <span className="text-xs font-medium">{getStatusText(project.status)}</span>
                    </div>
                  </div>
                  <h3 className="mb-2 font-semibold">{project.name}</h3>
                  <p className="text-sm text-muted-foreground">Due: {new Date(project.dueDate).toLocaleDateString()}</p>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/50 p-2">
                <Button variant="ghost" size="sm" className="w-full">
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">No projects found matching your filters</p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => {
                setSearchQuery("")
                setDepartmentFilter("all")
                setStatusFilter("all")
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

