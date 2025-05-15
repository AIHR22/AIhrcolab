"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CourseCard } from "./course-card"
import { AddCourseDialog } from "./add-course-dialog"
import { AssignCourseDialog } from "./assign-course-dialog"
import { useCourses } from "@/hooks/use-courses"
import type { Course } from "@/types/learning"

export function Courses() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [level, setLevel] = useState("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  const { courses, isLoading, error } = useCourses()

  const filteredCourses = courses?.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === "all" || course.category === category
    const matchesLevel = level === "all" || course.level === level
    return matchesSearch && matchesCategory && matchesLevel
  })

  const handleAssignCourse = (course: Course) => {
    setSelectedCourse(course)
    setShowAssignDialog(true)
  }

  if (isLoading) {
    return <div>Loading courses...</div>
  }

  if (error) {
    return <div>Error loading courses: {error.message}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Management">Management</SelectItem>
              <SelectItem value="Technology">Technology</SelectItem>
              <SelectItem value="Soft Skills">Soft Skills</SelectItem>
            </SelectContent>
          </Select>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAssignDialog(true)}>
            Assign Course
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>Add Course</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses?.map((course) => (
          <CourseCard key={course.id} course={course} onAssign={() => handleAssignCourse(course)} />
        ))}
      </div>

      <AddCourseDialog open={showAddDialog} onOpenChange={setShowAddDialog} />

      <AssignCourseDialog open={showAssignDialog} onOpenChange={setShowAssignDialog} course={selectedCourse} />
    </div>
  )
}

