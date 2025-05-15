"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Clock, CheckCircle, AlertTriangle, X, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

interface Project {
  id: string
  name: string
  department: string
  status: "completed" | "in-progress" | "at-risk" | "not-started"
  dueDate: string
  progress: number
}

interface ProjectSelectorProps {
  onSelectProject?: (projectId: string) => void
}

export function ProjectSelector({ onSelectProject }: ProjectSelectorProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [departments, setDepartments] = useState<string[]>([])

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        // In a real implementation, this would fetch from your API
        // For now, we'll use the sample data
        setProjects(sampleProjects)
        
        // Extract unique departments
        const uniqueDepartments = Array.from(
          new Set(sampleProjects.map(project => project.department))
        )
        setDepartments(uniqueDepartments)
      } catch (error) {
        console.error("Error fetching projects:", error)
        toast({
          title: "Error",
          description: "Failed to load projects",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const filteredProjects = projects.filter((project) => {
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

  const handleSelectProject = (projectId: string) => {
    if (onSelectProject) {
      onSelectProject(projectId)
    } else {
      router.push(`/dashboard/workforce/project-feasibility/${projectId}`)
    }
  }

  const handleCreateNewProject = () => {
    router.push("/dashboard/projects/new")
  }

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Select a Project</h3>
            <Button size="sm" onClick={handleCreateNewProject}>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
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
          
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-4">Loading projects...</div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-4">No projects found</div>
            ) : (
              filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-md border cursor-pointer hover:bg-muted/50 transition-colors",
                    "border-border"
                  )}
                  onClick={() => handleSelectProject(project.id)}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(project.status)}
                    <div>
                      <div className="font-medium">{project.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {project.department} • Due {new Date(project.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-normal">
                      {getStatusText(project.status)}
                    </Badge>
                    <div className="text-sm font-medium">{project.progress}%</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Sample data for demonstration
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