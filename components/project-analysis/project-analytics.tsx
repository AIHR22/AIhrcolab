"use client"

import { useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Sample data
const taskProgressData = [
  { name: "Planning", completed: 20, inProgress: 10, notStarted: 5 },
  { name: "Design", completed: 15, inProgress: 8, notStarted: 2 },
  { name: "Development", completed: 10, inProgress: 15, notStarted: 10 },
  { name: "Testing", completed: 5, inProgress: 10, notStarted: 15 },
  { name: "Deployment", completed: 2, inProgress: 5, notStarted: 18 },
]

const resourceAllocationData = [
  { name: "HR Team", value: 30 },
  { name: "IT Support", value: 25 },
  { name: "Management", value: 20 },
  { name: "Finance", value: 15 },
  { name: "Operations", value: 10 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export function ProjectAnalytics() {
  const [timeRange, setTimeRange] = useState("month")

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Project Analytics</CardTitle>
          <CardDescription>Detailed analysis of project performance and resource allocation</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="quarter">Last Quarter</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tasks">
          <TabsList className="mb-4">
            <TabsTrigger value="tasks">Task Progress</TabsTrigger>
            <TabsTrigger value="resources">Resource Allocation</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>
          <TabsContent value="tasks" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskProgressData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" stackId="a" fill="#4CAF50" name="Completed" />
                <Bar dataKey="inProgress" stackId="a" fill="#2196F3" name="In Progress" />
                <Bar dataKey="notStarted" stackId="a" fill="#9E9E9E" name="Not Started" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="resources" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={resourceAllocationData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {resourceAllocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} hours`, "Allocation"]} />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="timeline" className="flex h-[400px] items-center justify-center">
            <p className="text-muted-foreground">Timeline visualization coming soon</p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

