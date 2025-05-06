"use client"

import { Clock, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { Course } from "@/types/learning"

interface CourseCardProps {
  course: Course
  onAssign: () => void
}

export function CourseCard({ course, onAssign }: CourseCardProps) {
  return (
    <Card>
      <CardHeader className="relative">
        <img
          src={course.thumbnail_url || "/placeholder.svg"}
          alt={course.title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <div className="absolute top-4 right-4 bg-background/90 px-2 py-1 rounded text-sm">{course.level}</div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardTitle>{course.title}</CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{course.duration_hours} hours</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>45 enrolled</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Completion Rate</span>
            <span>78%</span>
          </div>
          <Progress value={78} />
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={onAssign}>
            Assign Course
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

