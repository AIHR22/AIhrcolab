"use client"

import { useState } from "react"
import { BookOpen, Clock, MoreHorizontal, PlusCircle, Search, Users } from "lucide-react"
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

// Mock data for learning courses
const coursesData = [
  {
    id: 1,
    title: "Introduction to Project Management",
    description: "Learn the fundamentals of project management methodologies and best practices",
    category: "Management",
    level: "Beginner",
    duration: "4 hours",
    enrolledCount: 45,
    completionRate: 78,
    image: "/placeholder.svg?height=100&width=180",
    instructor: {
      name: "Sarah Williams",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  },
  {
    id: 2,
    title: "Advanced JavaScript Programming",
    description: "Master advanced JavaScript concepts including closures, promises, and async/await",
    category: "Technical",
    level: "Advanced",
    duration: "8 hours",
    enrolledCount: 32,
    completionRate: 65,
    image: "/placeholder.svg?height=100&width=180",
    instructor: {
      name: "John Smith",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  },
  {
    id: 3,
    title: "Effective Communication Skills",
    description: "Develop essential communication skills for workplace success",
    category: "Soft Skills",
    level: "Intermediate",
    duration: "3 hours",
    enrolledCount: 78,
    completionRate: 92,
    image: "/placeholder.svg?height=100&width=180",
    instructor: {
      name: "Emily Johnson",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  },
  {
    id: 4,
    title: "UI/UX Design Principles",
    description: "Learn the core principles of user interface and user experience design",
    category: "Design",
    level: "Beginner",
    duration: "6 hours",
    enrolledCount: 56,
    completionRate: 81,
    image: "/placeholder.svg?height=100&width=180",
    instructor: {
      name: "Jennifer Anderson",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  },
  {
    id: 5,
    title: "Data Analysis with Python",
    description: "Learn how to analyze and visualize data using Python and popular libraries",
    category: "Technical",
    level: "Intermediate",
    duration: "10 hours",
    enrolledCount: 28,
    completionRate: 70,
    image: "/placeholder.svg?height=100&width=180",
    instructor: {
      name: "Michael Brown",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  },
]

export function LearningCourses() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [levelFilter, setLevelFilter] = useState("all")

  const filteredCourses = coursesData.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (categoryFilter === "all" || course.category === categoryFilter) &&
      (levelFilter === "all" || course.level === levelFilter),
  )

  // Get unique categories and levels for filters
  const categories = Array.from(new Set(coursesData.map((course) => course.category)))
  const levels = Array.from(new Set(coursesData.map((course) => course.level)))

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search courses..."
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
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {levels.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => (
          <div key={course.id} className="flex flex-col rounded-lg border overflow-hidden">
            <div className="relative h-[120px] w-full bg-muted">
              <img src={course.image || "/placeholder.svg"} alt={course.title} className="h-full w-full object-cover" />
              <Badge className="absolute top-2 right-2">{course.level}</Badge>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <div className="space-y-1">
                <h3 className="font-medium">{course.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{course.enrolledCount} enrolled</span>
                </div>
              </div>

              <div className="mt-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Completion Rate</span>
                  <span>{course.completionRate}%</span>
                </div>
                <Progress value={course.completionRate} className="mt-1" />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={course.instructor.avatar} alt={course.instructor.name} />
                    <AvatarFallback>
                      {course.instructor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs">{course.instructor.name}</span>
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
                      View course
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Assign to employees
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Users className="mr-2 h-4 w-4" />
                      View enrollments
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

