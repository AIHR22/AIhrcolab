"use client"

import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { Search, User } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface SkillMatchingResultsProps {
  data: any
}

export function SkillMatchingResults({ data }: SkillMatchingResultsProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Filter skills based on search term
  const filteredSkills =
    data?.skillMatching?.matchedEmployees.filter((skill: any) =>
      skill.skill.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || []

  // Prepare data for the chart
  const chartData = filteredSkills.map((skill: any) => ({
    name: skill.skill,
    available: skill.matchedCount,
    required: skill.totalRequired,
    gap: Math.max(0, skill.totalRequired - skill.matchedCount),
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-medium">Skill Matching Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Comparing required skills with available employee capabilities
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search skills..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Overall Skill Match</h4>
          <Badge variant={data?.skillMatching?.overallMatch > 70 ? "default" : "outline"}>
            {data?.skillMatching?.overallMatch}% Match
          </Badge>
        </div>
        <Progress value={data?.skillMatching?.overallMatch} className="mt-2" />
        <p className="mt-2 text-sm text-muted-foreground">
          {data?.skillMatching?.overallMatch > 70
            ? "Good skill coverage. Most required skills are available in-house."
            : "Skill gaps detected. Consider hiring or training to fill the gaps."}
        </p>
      </div>

      <div className="h-[300px] w-full">
        <ChartContainer
          config={{
            available: {
              label: "Available",
              color: "hsl(var(--chart-1))",
            },
            required: {
              label: "Required",
              color: "hsl(var(--chart-2))",
            },
            gap: {
              label: "Gap",
              color: "hsl(var(--chart-3))",
            },
          }}
          className="h-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="available" fill="var(--color-available)" name="Available" />
              <Bar dataKey="required" fill="var(--color-required)" name="Required" />
              <Bar dataKey="gap" fill="var(--color-gap)" name="Gap" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Skill Details</h4>
        {filteredSkills.map((skill: any) => (
          <div key={skill.skill} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h5 className="font-medium">{skill.skill}</h5>
              <Badge variant={skill.matchedCount >= skill.totalRequired ? "default" : "outline"}>
                {skill.matchedCount}/{skill.totalRequired} Available
              </Badge>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-sm text-muted-foreground">Available Employees with this Skill:</p>
              {skill.availableEmployees.map((employee: any) => (
                <div key={employee.id} className="flex items-center justify-between rounded-md bg-muted p-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`/placeholder.svg?height=32&width=32`} alt={employee.name} />
                      <AvatarFallback>
                        {employee.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{employee.name}</p>
                      <p className="text-xs text-muted-foreground">{employee.currentProjects} active projects</p>
                    </div>
                  </div>
                  <Badge variant="outline">{employee.matchScore}% Match</Badge>
                </div>
              ))}

              {skill.matchedCount < skill.totalRequired && (
                <div className="flex items-center justify-between rounded-md border border-dashed p-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {skill.totalRequired - skill.matchedCount} more {skill.skill} specialists needed
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Find Candidates
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

