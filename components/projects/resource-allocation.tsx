"use client"

import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { AlertCircle, Search, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for resource allocation
const employeesData = [
  {
    id: "EMP001",
    name: "John Smith",
    position: "Senior Developer",
    avatar: "/placeholder.svg?height=40&width=40",
    department: "Engineering",
    utilization: 85,
    projects: [
      { id: "PRJ-2025-001", name: "E-commerce Platform Redesign", allocation: 50 },
      { id: "PRJ-2025-004", name: "CRM Integration", allocation: 35 },
    ],
    skills: ["JavaScript", "React", "Node.js", "TypeScript"],
  },
  {
    id: "EMP002",
    name: "Emily Johnson",
    position: "Marketing Manager",
    avatar: "/placeholder.svg?height=40&width=40",
    department: "Marketing",
    utilization: 70,
    projects: [{ id: "PRJ-2025-001", name: "E-commerce Platform Redesign", allocation: 70 }],
    skills: ["Marketing Strategy", "Content Marketing", "SEO", "Analytics"],
  },
  {
    id: "EMP003",
    name: "Michael Brown",
    position: "Financial Analyst",
    avatar: "/placeholder.svg?height=40&width=40",
    department: "Finance",
    utilization: 60,
    projects: [{ id: "PRJ-2025-003", name: "Data Analytics Dashboard", allocation: 60 }],
    skills: ["Financial Analysis", "Data Analysis", "Python", "Excel"],
  },
  {
    id: "EMP004",
    name: "Jessica Davis",
    position: "HR Specialist",
    avatar: "/placeholder.svg?height=40&width=40",
    department: "Human Resources",
    utilization: 90,
    projects: [{ id: "PRJ-2025-004", name: "CRM Integration", allocation: 90 }],
    skills: ["Recruitment", "Employee Relations", "Training", "Compliance"],
  },
  {
    id: "EMP005",
    name: "David Wilson",
    position: "Product Manager",
    avatar: "/placeholder.svg?height=40&width=40",
    department: "Product",
    utilization: 75,
    projects: [
      { id: "PRJ-2025-001", name: "E-commerce Platform Redesign", allocation: 40 },
      { id: "PRJ-2025-002", name: "Mobile App Development", allocation: 35 },
    ],
    skills: ["Product Management", "Agile", "User Research", "Roadmapping"],
  },
]

// Prepare data for department utilization chart
const departmentUtilizationData = [
  { department: "Engineering", utilization: 85 },
  { department: "Design", utilization: 70 },
  { department: "Product", utilization: 75 },
  { department: "Marketing", utilization: 65 },
  { department: "Finance", utilization: 60 },
  { department: "HR", utilization: 90 },
]

export function ResourceAllocation() {
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")

  const filteredEmployees = employeesData.filter(
    (employee) =>
      (employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      (departmentFilter === "all" || employee.department === departmentFilter),
  )

  // Get unique departments for filter
  const departments = Array.from(new Set(employeesData.map((employee) => employee.department)))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-medium">Resource Allocation</h3>
          <p className="text-sm text-muted-foreground">View and manage employee workload and project assignments</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search employees or skills..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((department) => (
                <SelectItem key={department} value={department}>
                  {department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h4 className="mb-4 font-medium">Department Utilization</h4>
          <div className="h-[300px]">
            <ChartContainer
              config={{
                utilization: {
                  label: "Utilization",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={departmentUtilizationData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis domain={[0, 100]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="utilization" fill="var(--color-utilization)" name="Utilization %" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <h4 className="mb-4 font-medium">Resource Allocation Summary</h4>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Overall Team Utilization</p>
                <p className="text-sm text-muted-foreground">
                  The team is currently at 75% utilization across all projects.
                </p>
                <Progress value={75} className="mt-2 h-2" />
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-full bg-yellow-100 p-2 text-yellow-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Overallocated Resources</p>
                <p className="text-sm text-muted-foreground">
                  2 team members are allocated at over 90% capacity and at risk of burnout.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-full bg-green-100 p-2 text-green-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Available Capacity</p>
                <p className="text-sm text-muted-foreground">
                  There is approximately 25% capacity available for new projects.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Employee Allocation</h4>
        {filteredEmployees.map((employee) => (
          <div key={employee.id} className="rounded-lg border p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={employee.avatar} alt={employee.name} />
                  <AvatarFallback>
                    {employee.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h5 className="font-medium">{employee.name}</h5>
                  <p className="text-sm text-muted-foreground">
                    {employee.position} • {employee.department}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {employee.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Utilization:</span>
                  <Badge
                    variant={
                      employee.utilization > 90 ? "destructive" : employee.utilization > 75 ? "secondary" : "outline"
                    }
                  >
                    {employee.utilization}%
                  </Badge>
                </div>
                <Button variant="outline" size="sm" className="mt-2">
                  Manage Allocation
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-sm font-medium">Project Allocation:</p>
              <div className="space-y-3">
                {employee.projects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-primary" />
                      <span className="text-sm">{project.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={project.allocation} className="h-2 w-24" />
                      <span className="text-xs">{project.allocation}%</span>
                    </div>
                  </div>
                ))}

                {employee.utilization < 100 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-muted" />
                      <span className="text-sm text-muted-foreground">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={100 - employee.utilization} className="h-2 w-24 bg-muted" />
                      <span className="text-xs">{100 - employee.utilization}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

