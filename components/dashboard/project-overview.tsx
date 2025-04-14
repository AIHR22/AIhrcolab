"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BarChart, LineChart, ResponsiveContainer, Bar, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ArrowRight, Clock, Users } from "lucide-react"

interface Project {
  id: string
  name: string
  description: string
  status: "planning" | "in-progress" | "completed" | "on-hold"
  progress: number
  startDate: Date
  endDate: Date
  budget: number
  spent: number
  teamSize: number
  teamMembers: {
    id: string
    name: string
    avatar: string
    initials: string
    role: string
  }[]
  risks: {
    level: "low" | "medium" | "high"
    count: number
  }
}

const projectsData: Project[] = [
  {
    id: "proj-1",
    name: "HR System Upgrade",
    description: "Upgrading the HR management system to improve efficiency and user experience",
    status: "in-progress",
    progress: 65,
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days from now
    budget: 120000,
    spent: 78000,
    teamSize: 8,
    teamMembers: [
      {
        id: "mem-1",
        name: "John Smith",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "JS",
        role: "Project Manager",
      },
      {
        id: "mem-2",
        name: "Sarah Johnson",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "SJ",
        role: "Frontend Developer",
      },
      {
        id: "mem-3",
        name: "Michael Brown",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "MB",
        role: "Backend Developer",
      },
    ],
    risks: {
      level: "medium",
      count: 3,
    },
  },
  {
    id: "proj-2",
    name: "Employee Onboarding Automation",
    description: "Automating the employee onboarding process to reduce manual work and improve consistency",
    status: "planning",
    progress: 25,
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15), // 15 days ago
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45), // 45 days from now
    budget: 85000,
    spent: 21250,
    teamSize: 5,
    teamMembers: [
      {
        id: "mem-4",
        name: "Emily Davis",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "ED",
        role: "Product Manager",
      },
      {
        id: "mem-5",
        name: "David Wilson",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "DW",
        role: "UX Designer",
      },
    ],
    risks: {
      level: "low",
      count: 1,
    },
  },
  {
    id: "proj-3",
    name: "Performance Review System",
    description: "Implementing a new performance review system with AI-powered insights",
    status: "in-progress",
    progress: 40,
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45), // 45 days ago
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15), // 15 days from now
    budget: 150000,
    spent: 60000,
    teamSize: 7,
    teamMembers: [
      {
        id: "mem-6",
        name: "Jessica Williams",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "JW",
        role: "Data Scientist",
      },
      {
        id: "mem-7",
        name: "Robert Chen",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "RC",
        role: "Backend Developer",
      },
    ],
    risks: {
      level: "high",
      count: 5,
    },
  },
]

const projectProgressData = [
  { name: "Week 1", planned: 10, actual: 8 },
  { name: "Week 2", planned: 20, actual: 18 },
  { name: "Week 3", planned: 30, actual: 25 },
  { name: "Week 4", planned: 40, actual: 32 },
  { name: "Week 5", planned: 50, actual: 45 },
  { name: "Week 6", planned: 60, actual: 58 },
  { name: "Week 7", planned: 70, actual: 65 },
  { name: "Week 8", planned: 80, actual: 70 },
  { name: "Week 9", planned: 90, actual: 75 },
  { name: "Week 10", planned: 100, actual: 80 },
]

const resourceAllocationData = [
  { name: "Engineering", allocation: 45 },
  { name: "Design", allocation: 20 },
  { name: "Product", allocation: 15 },
  { name: "QA", allocation: 10 },
  { name: "Management", allocation: 10 },
]

export function ProjectOverview() {
  const [projects] = useState<Project[]>(projectsData)

  const getStatusBadge = (status: Project["status"]) => {
    switch (status) {
      case "planning":
        return <Badge className="bg-blue-500">Planning</Badge>
      case "in-progress":
        return <Badge className="bg-amber-500">In Progress</Badge>
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>
      case "on-hold":
        return <Badge className="bg-gray-500">On Hold</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  const getRiskBadge = (level: Project["risks"]["level"]) => {
    switch (level) {
      case "low":
        return <Badge className="bg-green-500">Low Risk</Badge>
      case "medium":
        return <Badge className="bg-amber-500">Medium Risk</Badge>
      case "high":
        return <Badge className="bg-red-500">High Risk</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.filter((p) => p.status === "in-progress").length}</div>
            <p className="text-xs text-muted-foreground">{projects.length} total projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resource Utilization</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">$</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">65%</div>
            <p className="text-xs text-muted-foreground">$159,250 of $355,000</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{project.name}</CardTitle>
                  {getStatusBadge(project.status)}
                </div>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Timeline</p>
                      <div className="flex items-center text-sm">
                        <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                        <span>
                          {new Date(project.startDate).toLocaleDateString()} -{" "}
                          {new Date(project.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Budget</p>
                      <div className="flex items-center text-sm">
                        <span>
                          ${project.spent.toLocaleString()} of ${project.budget.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">Team ({project.teamSize})</p>
                      {getRiskBadge(project.risks.level)}
                    </div>
                    <div className="flex -space-x-2">
                      {project.teamMembers.map((member) => (
                        <Avatar key={member.id} className="border-2 border-background h-8 w-8">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>{member.initials}</AvatarFallback>
                        </Avatar>
                      ))}
                      {project.teamSize > project.teamMembers.length && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                          +{project.teamSize - project.teamMembers.length}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button variant="outline" className="w-full" asChild>
                    <a href={`/dashboard/projects/${project.id}`}>
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>Project Progress</CardTitle>
              <CardDescription>Planned vs. actual progress across all projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    planned: {
                      label: "Planned Progress",
                      color: "hsl(var(--chart-1))",
                    },
                    actual: {
                      label: "Actual Progress",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={projectProgressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="planned"
                        stroke="var(--color-planned)"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                      <Line type="monotone" dataKey="actual" stroke="var(--color-actual)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Resource Allocation</CardTitle>
              <CardDescription>Current allocation of resources by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    allocation: {
                      label: "Resource Allocation",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={resourceAllocationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="allocation" fill="var(--color-allocation)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

