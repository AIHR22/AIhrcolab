"use client"

import { useState } from "react"
import { BookOpen, ChevronRight, Clock, MoreHorizontal, Search, Users } from "lucide-react"
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// Mock data for learning paths
const learningPathsData = [
  {
    id: 1,
    title: "Project Management Career Path",
    description: "Comprehensive learning path for aspiring project managers",
    category: "Management",
    enrolledCount: 32,
    completionRate: 65,
    estimatedTime: "40 hours",
    courses: [
      {
        id: 101,
        title: "Introduction to Project Management",
        duration: "4 hours",
        status: "Required",
      },
      {
        id: 102,
        title: "Agile Methodologies",
        duration: "6 hours",
        status: "Required",
      },
      {
        id: 103,
        title: "Project Planning and Scheduling",
        duration: "5 hours",
        status: "Required",
      },
      {
        id: 104,
        title: "Risk Management",
        duration: "4 hours",
        status: "Required",
      },
      {
        id: 105,
        title: "Project Management Tools",
        duration: "3 hours",
        status: "Optional",
      },
    ],
  },
  {
    id: 2,
    title: "Full-Stack Developer Path",
    description: "Complete learning journey to become a full-stack developer",
    category: "Technical",
    enrolledCount: 48,
    completionRate: 58,
    estimatedTime: "60 hours",
    courses: [
      {
        id: 201,
        title: "HTML & CSS Fundamentals",
        duration: "6 hours",
        status: "Required",
      },
      {
        id: 202,
        title: "JavaScript Essentials",
        duration: "8 hours",
        status: "Required",
      },
      {
        id: 203,
        title: "React Framework",
        duration: "10 hours",
        status: "Required",
      },
      {
        id: 204,
        title: "Node.js Backend Development",
        duration: "8 hours",
        status: "Required",
      },
      {
        id: 205,
        title: "Database Design and Management",
        duration: "6 hours",
        status: "Required",
      },
    ],
  },
  {
    id: 3,
    title: "Leadership Development",
    description: "Essential skills for current and aspiring leaders",
    category: "Leadership",
    enrolledCount: 56,
    completionRate: 72,
    estimatedTime: "30 hours",
    courses: [
      {
        id: 301,
        title: "Effective Communication for Leaders",
        duration: "4 hours",
        status: "Required",
      },
      {
        id: 302,
        title: "Team Building and Motivation",
        duration: "5 hours",
        status: "Required",
      },
      {
        id: 303,
        title: "Conflict Resolution",
        duration: "4 hours",
        status: "Required",
      },
      {
        id: 304,
        title: "Strategic Thinking",
        duration: "6 hours",
        status: "Required",
      },
      {
        id: 305,
        title: "Coaching and Mentoring",
        duration: "5 hours",
        status: "Optional",
      },
    ],
  },
]

export function LearningPaths() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const filteredPaths = learningPathsData.filter(
    (path) =>
      path.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (categoryFilter === "all" || path.category === categoryFilter),
  )

  // Get unique categories for filter
  const categories = Array.from(new Set(learningPathsData.map((path) => path.category)))

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search learning paths..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline">Create Path</Button>
      </div>

      <div className="space-y-4">
        {filteredPaths.map((path) => (
          <div key={path.id} className="rounded-lg border overflow-hidden">
            <div className="flex flex-col p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{path.title}</h3>
                  <Badge>{path.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{path.description}</p>
              </div>

              <div className="mt-4 flex items-center gap-4 sm:mt-0">
                <div className="flex items-center gap-1 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{path.estimatedTime}</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{path.enrolledCount}</span>
                </div>
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
                      <BookOpen className="mr-2 h-4 w-4" />
                      View path details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Users className="mr-2 h-4 w-4" />
                      Assign to employees
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <ChevronRight className="mr-2 h-4 w-4" />
                      Edit path
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="px-4 pb-2">
              <div className="flex items-center justify-between text-sm">
                <span>Completion Rate</span>
                <span>{path.completionRate}%</span>
              </div>
              <Progress value={path.completionRate} className="mt-1" />
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="courses">
                <AccordionTrigger className="px-4">Courses in this path</AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-2">
                    {path.courses.map((course) => (
                      <div key={course.id} className="flex items-center justify-between rounded-md border p-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <span>{course.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={course.status === "Required" ? "default" : "outline"}>{course.status}</Badge>
                          <span className="text-sm text-muted-foreground">{course.duration}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  )
}

