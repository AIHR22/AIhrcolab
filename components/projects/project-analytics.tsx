"use client"

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data for project analytics
const projectTrendsData = [
  { month: "Jan", completed: 4, inProgress: 8, planned: 3 },
  { month: "Feb", completed: 6, inProgress: 7, planned: 4 },
  { month: "Mar", completed: 5, inProgress: 9, planned: 2 },
  { month: "Apr", completed: 7, inProgress: 8, planned: 5 },
  { month: "May", completed: 8, inProgress: 7, planned: 6 },
  { month: "Jun", completed: 9, inProgress: 6, planned: 4 },
]

const resourceUtilizationData = [
  { department: "Engineering", utilization: 85, headcount: 45 },
  { department: "Design", utilization: 70, headcount: 12 },
  { department: "Product", utilization: 75, headcount: 18 },
  { department: "Marketing", utilization: 65, headcount: 20 },
  { department: "Finance", utilization: 60, headcount: 15 },
  { department: "HR", utilization: 90, headcount: 10 },
]

const projectStatusData = [
  { name: "Completed", value: 12 },
  { name: "In Progress", value: 8 },
  { name: "Planning", value: 5 },
  { name: "On Hold", value: 2 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

const budgetPerformanceData = [
  { project: "E-commerce Platform", budget: 450000, actual: 425000, variance: 25000 },
  { project: "Mobile App", budget: 380000, actual: 390000, variance: -10000 },
  { project: "Data Analytics", budget: 250000, actual: 240000, variance: 10000 },
  { project: "CRM Integration", budget: 180000, actual: 185000, variance: -5000 },
  { project: "Website Redesign", budget: 120000, actual: 115000, variance: 5000 },
]

export function ProjectAnalytics() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="resources">Resource Utilization</TabsTrigger>
          <TabsTrigger value="budget">Budget Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">27</div>
                <p className="text-xs text-muted-foreground">+4 from last quarter</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">-2 from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">On-time Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85%</div>
                <p className="text-xs text-muted-foreground">+5% from last quarter</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Budget Variance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+2.5%</div>
                <p className="text-xs text-muted-foreground">Within target range</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Trends</CardTitle>
                <CardDescription>Monthly project status distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer
                    config={{
                      completed: {
                        label: "Completed",
                        color: "hsl(var(--chart-1))",
                      },
                      inProgress: {
                        label: "In Progress",
                        color: "hsl(var(--chart-2))",
                      },
                      planned: {
                        label: "Planned",
                        color: "hsl(var(--chart-3))",
                      },
                    }}
                    className="h-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={projectTrendsData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="completed" stackId="a" fill="var(--color-completed)" name="Completed" />
                        <Bar dataKey="inProgress" stackId="a" fill="var(--color-inProgress)" name="In Progress" />
                        <Bar dataKey="planned" stackId="a" fill="var(--color-planned)" name="Planned" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Status</CardTitle>
                <CardDescription>Current distribution of project statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={projectStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {projectStatusData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}\`} fill={COLORS[index % COLORS  index) => (
                          <Cell key={\`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resource Utilization by Department</CardTitle>
              <CardDescription>Current utilization rates across departments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ChartContainer
                  config={{
                    utilization: {
                      label: "Utilization",
                      color: "hsl(var(--chart-1))",
                    },
                    headcount: {
                      label: "Headcount",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={resourceUtilizationData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="utilization" fill="var(--color-utilization)" name="Utilization %" />
                      <Bar yAxisId="right" dataKey="headcount" fill="var(--color-headcount)" name="Headcount" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget vs. Actual Spending</CardTitle>
              <CardDescription>Financial performance of active projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ChartContainer
                  config={{
                    budget: {
                      label: "Budget",
                      color: "hsl(var(--chart-1))",
                    },
                    actual: {
                      label: "Actual",
                      color: "hsl(var(--chart-2))",
                    },
                    variance: {
                      label: "Variance",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                  className="h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={budgetPerformanceData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="project" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="budget" fill="var(--color-budget)" name="Budget" />
                      <Bar dataKey="actual" fill="var(--color-actual)" name="Actual" />
                      <Bar dataKey="variance" fill="var(--color-variance)" name="Variance" />
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

