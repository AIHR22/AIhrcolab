"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for skills gap analysis
const skillsGapData = [
  {
    skill: "JavaScript",
    currentLevel: 3.5,
    requiredLevel: 4.5,
    gap: 1.0,
  },
  {
    skill: "React",
    currentLevel: 3.2,
    requiredLevel: 4.0,
    gap: 0.8,
  },
  {
    skill: "Node.js",
    currentLevel: 2.8,
    requiredLevel: 4.0,
    gap: 1.2,
  },
  {
    skill: "Python",
    currentLevel: 2.5,
    requiredLevel: 3.5,
    gap: 1.0,
  },
  {
    skill: "Data Analysis",
    currentLevel: 2.0,
    requiredLevel: 3.0,
    gap: 1.0,
  },
  {
    skill: "Project Management",
    currentLevel: 3.8,
    requiredLevel: 4.0,
    gap: 0.2,
  },
]

// Mock data for recommended courses
const recommendedCoursesData = [
  {
    id: 1,
    title: "Advanced JavaScript Programming",
    skill: "JavaScript",
    level: "Advanced",
    duration: "8 hours",
    match: "High",
  },
  {
    id: 2,
    title: "React Hooks and Context API",
    skill: "React",
    level: "Intermediate",
    duration: "6 hours",
    match: "High",
  },
  {
    id: 3,
    title: "Node.js API Development",
    skill: "Node.js",
    level: "Intermediate",
    duration: "10 hours",
    match: "High",
  },
  {
    id: 4,
    title: "Python for Data Science",
    skill: "Python",
    level: "Intermediate",
    duration: "12 hours",
    match: "Medium",
  },
  {
    id: 5,
    title: "Data Analysis Fundamentals",
    skill: "Data Analysis",
    level: "Beginner",
    duration: "6 hours",
    match: "Medium",
  },
]

export function SkillsGap() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-medium">Skills Gap Analysis</h3>
          <p className="text-sm text-muted-foreground">Identify skill gaps and recommended learning opportunities</p>
        </div>

        <div className="flex items-center gap-2">
          <Select defaultValue="department">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select scope" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="team">Team</SelectItem>
              <SelectItem value="department">Department</SelectItem>
              <SelectItem value="company">Company</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="engineering">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="engineering">Engineering</SelectItem>
              <SelectItem value="product">Product</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="hr">Human Resources</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <h4 className="mb-4 font-medium">Current vs. Required Skills</h4>
        <ChartContainer
          config={{
            currentLevel: {
              label: "Current Level",
              color: "hsl(var(--chart-1))",
            },
            requiredLevel: {
              label: "Required Level",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={skillsGapData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="skill" />
              <YAxis domain={[0, 5]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="currentLevel" fill="var(--color-currentLevel)" name="Current Level" />
              <Bar dataKey="requiredLevel" fill="var(--color-requiredLevel)" name="Required Level" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <div>
        <h4 className="mb-4 font-medium">AI-Recommended Learning</h4>
        <div className="space-y-3">
          {recommendedCoursesData.map((course) => (
            <div key={course.id} className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-1">
                <h5 className="font-medium">{course.title}</h5>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Badge variant="outline">{course.skill}</Badge>
                  <Badge variant="outline">{course.level}</Badge>
                  <span className="text-muted-foreground">{course.duration}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={course.match === "High" ? "default" : course.match === "Medium" ? "secondary" : "outline"}
                >
                  {course.match} Match
                </Badge>
                <Button size="sm">Enroll</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

