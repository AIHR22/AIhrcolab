"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"
import { AlertCircle, CheckCircle, Clock, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface CapacityAnalysisResultsProps {
  data: any
}

export function CapacityAnalysisResults({ data }: CapacityAnalysisResultsProps) {
  const capacityData = data?.capacityAnalysis

  // Prepare data for the pie chart
  const pieData = [
    { name: "Available", value: capacityData?.availableCapacity || 0 },
    { name: "Gap", value: capacityData?.capacityGap || 0 },
  ]

  // Prepare data for the department chart
  const departmentData = capacityData?.teamAvailability || []

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Capacity Analysis</h3>
        <p className="text-sm text-muted-foreground">Analyzing current team capacity against project requirements</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <h4 className="font-medium">Required Resources</h4>
          </div>
          <p className="mt-2 text-3xl font-bold">{capacityData?.totalRequired || 0}</p>
          <p className="text-sm text-muted-foreground">Full-time equivalents</p>
        </div>

        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <h4 className="font-medium">Available Resources</h4>
          </div>
          <p className="mt-2 text-3xl font-bold">{capacityData?.availableCapacity || 0}</p>
          <p className="text-sm text-muted-foreground">Full-time equivalents</p>
        </div>

        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            <h4 className="font-medium">Capacity Gap</h4>
          </div>
          <p className="mt-2 text-3xl font-bold">{capacityData?.capacityGap || 0}</p>
          <p className="text-sm text-muted-foreground">Additional resources needed</p>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Current Team Utilization</h4>
          <Badge variant={capacityData?.utilizationRate > 90 ? "destructive" : "outline"}>
            {capacityData?.utilizationRate || 0}%
          </Badge>
        </div>
        <Progress value={capacityData?.utilizationRate || 0} className="mt-2" />
        <p className="mt-2 text-sm text-muted-foreground">
          {capacityData?.utilizationRate > 90
            ? "Team is currently over-utilized. Adding this project will cause burnout."
            : capacityData?.utilizationRate > 75
              ? "Team is highly utilized. Consider adding resources for this project."
              : "Team has some capacity, but not enough for this project."}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h4 className="mb-4 font-medium">Resource Distribution</h4>
          <div className="h-[200px]">
            <ChartContainer
              config={{
                Available: {
                  label: "Available",
                  color: "hsl(var(--chart-1))",
                },
                Gap: {
                  label: "Gap",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell fill="var(--color-Available)" />
                    <Cell fill="var(--color-Gap)" />
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <h4 className="mb-4 font-medium">Department Capacity</h4>
          <div className="space-y-4">
            {departmentData.map((dept: any) => (
              <div key={dept.department} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{dept.department}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {dept.available}/{dept.required}
                    </Badge>
                    {dept.available >= dept.required ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                </div>
                <Progress value={(dept.available / dept.required) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <h4 className="font-medium">Capacity Analysis Summary</h4>
        <div className="mt-4 flex items-start gap-4">
          <div className="rounded-full bg-yellow-100 p-2 text-yellow-600">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium">Insufficient Capacity</p>
            <p className="text-sm text-muted-foreground">
              Your current team does not have sufficient capacity to take on this project. You need{" "}
              {capacityData?.capacityGap || 0} additional resources to meet the project requirements.
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-start gap-4">
          <div className="rounded-full bg-blue-100 p-2 text-blue-600">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium">Timeline Impact</p>
            <p className="text-sm text-muted-foreground">
              Without additional resources, the project timeline would need to be extended by approximately
              {Math.round((capacityData?.capacityGap || 0) * 1.5)} weeks.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

