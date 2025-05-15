"use client"

import { useState } from "react"
import { Calendar, Clock, Edit, MoreHorizontal, Search, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data for projects
const projectsData = [
  {
    id: "PRJ-2025-001",
    name: "E-commerce Platform Redesign",
    status: "In Progress",
    startDate: "Feb 15, 2025",
    endDate: "Jun 30, 2025",
    progress: 35,
    budget: "$450,000",
    manager: {
      name: "Emily Johnson",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    team: [
      { name: "John Smith", avatar: "/placeholder.svg?height=32&width=32" },
      { name: "Michael Brown", avatar: "/placeholder.svg?height=32&width=32" },
      { name: "Jessica Davis", avatar: "/placeholder.svg?height=32&width=32" },
      { name: "David Wilson", avatar: "/placeholder.svg?height=32&width=32" },
    ],
    skills: ["React", "Node.js", "UI/UX Design", "PostgreSQL"],
  },
  {
    id: "PRJ-2025-002",
    name: "Mobile App Development",
    status: "Planning",
    startDate: "Apr 1, 2025",
    endDate: "Sep 30, 2025",
    progress: 10,
    budget: "$380,000",
    manager: {
      name: "David Wilson",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    team: [
      { name: "Sarah Martinez", avatar: "/placeholder.svg?height=32&width=32" },
      { name: "Jennifer Anderson", avatar: "/placeholder.svg?height=32&width=32" },
    ],
    skills: ["React Native", "TypeScript", "Firebase", "UI/UX Design"],
  },
  {
    id: "PRJ-2025-003",
    name: "Data Analytics Dashboard",
    status: "Approved",
    startDate: "May 15, 2025",
    endDate: "Aug 15, 2025",
    progress: 0,
    budget: "$250,000",
    manager: {
      name: "Michael Brown",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    team: [],
    skills: ["Python", "Data Science", "React", "D3.js"],
  },
  {
    id: "PRJ-2025-004",
    name: "CRM Integration",
    status: "Completed",
    startDate: "Jan 10, 2025",
    endDate: "Mar 20, 2025",
    progress: 100,
    budget: "$180,000",
    manager: {
      name: "Jessica Davis",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    team: [
      { name: "John Smith", avatar: "/placeholder.svg?height=32&width=32" },
      { name: "Robert Taylor", avatar: "/placeholder.svg?height=32&width=32" },
      { name: "Lisa Rodriguez", avatar: "/placeholder.svg?height=32&width=32" },
    ],
    skills: ["Salesforce", "API Integration", "JavaScript", "Node.js"],
  },
]

export function ProjectsList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredProjects = projectsData.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === "all" || project.status.toLowerCase().replace(/\s+/g, "-") === statusFilter),
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search projects..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Timeline</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Team</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <div className="font-medium">{project.name}</div>
                    <div className="text-xs text-muted-foreground">{project.id}</div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {project.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      project.status === "Completed"
                        ? "default"
                        : project.status === "In Progress"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {project.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>Start: {project.startDate}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>End: {project.endDate}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="w-[100px]">
                    <div className="flex items-center justify-between text-xs">
                      <span>{project.progress}%</span>
                      <span>{project.budget}</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <Avatar className="h-7 w-7 border-2 border-background">
                        <AvatarImage src={project.manager.avatar} alt={project.manager.name} />
                        <AvatarFallback>
                          {project.manager.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {project.team.slice(0, 3).map((member, index) => (
                        <Avatar key={index} className="h-7 w-7 border-2 border-background">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {project.team.length > 3 && (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                          +{project.team.length - 3}
                        </div>
                      )}
                    </div>
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
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit project
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Users className="mr-2 h-4 w-4" />
                        Manage team
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Clock className="mr-2 h-4 w-4" />
                        View timeline
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

