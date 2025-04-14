"use client"

import { useState } from "react"
import { Users, TrendingUp, TrendingDown, UserPlus, UserMinus, Download, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"

// Mock data for workforce planning
const headcountData = [
  { month: "Jan", current: 120, projected: 125 },
  { month: "Feb", current: 125, projected: 130 },
  { month: "Mar", current: 130, projected: 135 },
  { month: "Apr", current: 140, projected: 145 },
  { month: "May", current: 145, projected: 150 },
  { month: "Jun", current: 150, projected: 155 },
  { month: "Jul", current: 155, projected: 160 },
  { month: "Aug", current: 160, projected: 165 },
  { month: "Sep", current: 165, projected: 170 },
  { month: "Oct", current: 170, projected: 175 },
  { month: "Nov", current: 175, projected: 180 },
  { month: "Dec", current: 180, projected: 185 },
]

const departmentData = [
  { name: "Engineering", value: 65, growth: 10 },
  { name: "Sales", value: 40, growth: 5 },
  { name: "Marketing", value: 25, growth: 8 },
  { name: "Product", value: 20, growth: 15 },
  { name: "Design", value: 15, growth: 7 },
  { name: "Finance", value: 10, growth: 2 },
  { name: "HR", value: 5, growth: 0 },
]

const attritionData = [
  { month: "Jan", rate: 2.1 },
  { month: "Feb", rate: 1.8 },
  { month: "Mar", rate: 2.3 },
  { month: "Apr", rate: 1.9 },
  { month: "May", rate: 2.0 },
  { month: "Jun", rate: 2.2 },
  { month: "Jul", rate: 2.5 },
  { month: "Aug", rate: 2.7 },
  { month: "Sep", rate: 2.4 },
  { month: "Oct", rate: 2.2 },
  { month: "Nov", rate: 2.0 },
  { month: "Dec", rate: 1.8 },
]

const hiringRecommendations = [
  { department: "Engineering", current: 65, recommended: 72, priority: "high" },
  { department: "Sales", current: 40, recommended: 42, priority: "medium" },
  { department: "Marketing", current: 25, recommended: 27, priority: "medium" },
  { department: "Product", current: 20, recommended: 23, priority: "high" },
  { department: "Design", current: 15, recommended: 16, priority: "low" },
  { department: "Finance", current: 10, recommended: 10, priority: "low" },
  { department: "HR", current: 5, recommended: 6, priority: "medium" },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FF6B6B"]

export default function WorkforcePlanningPage() {
  const [timeframe, setTimeframe] = useState("12months")
  const [growthRate, setGrowthRate] = useState(5)
  const [attritionRate, setAttritionRate] = useState(2)
  const [isSimulating, setIsSimulating] = useState(false)

  const totalCurrentHeadcount = departmentData.reduce((sum, dept) => sum + dept.value, 0)
  const totalRecommendedHires = hiringRecommendations.reduce((sum, dept) => sum + (dept.recommended - dept.current), 0)

  const handleSimulate = () => {
    setIsSimulating(true)
    setTimeout(() => {
      setIsSimulating(false)
    }, 1500)
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-500">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-500">Medium</Badge>
      case "low":
        return <Badge className="bg-green-500">Low</Badge>
      default:
        return <Badge>{priority}</Badge>
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Workforce Planning</h1>
        <p className="text-muted-foreground">
          Plan and forecast your workforce needs based on growth and attrition trends.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Headcount</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCurrentHeadcount}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
              <span className="text-green-500">+5.2%</span> from last quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attrition Rate</CardTitle>
            <UserMinus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attritionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingDown className="mr-1 h-4 w-4 text-green-500" />
              <span className="text-green-500">-0.3%</span> from last quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recommended Hires</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecommendedHires}</div>
            <p className="text-xs text-muted-foreground flex items-center">Based on growth projections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projected Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{growthRate}%</div>
            <p className="text-xs text-muted-foreground flex items-center">Annual growth rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Headcount Planning Tool</CardTitle>
            <CardDescription>Adjust parameters to forecast workforce needs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="timeframe">Timeframe</Label>
                <span className="text-sm">{timeframe === "12months" ? "12 Months" : "24 Months"}</span>
              </div>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6months">6 Months</SelectItem>
                  <SelectItem value="12months">12 Months</SelectItem>
                  <SelectItem value="24months">24 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="growth-rate">Growth Rate (%)</Label>
                <span className="text-sm">{growthRate}%</span>
              </div>
              <Slider
                id="growth-rate"
                min={0}
                max={20}
                step={0.5}
                value={[growthRate]}
                onValueChange={(value) => setGrowthRate(value[0])}
                className="transition-all"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="attrition-rate">Attrition Rate (%)</Label>
                <span className="text-sm">{attritionRate}%</span>
              </div>
              <Slider
                id="attrition-rate"
                min={0}
                max={10}
                step={0.1}
                value={[attritionRate]}
                onValueChange={(value) => setAttritionRate(value[0])}
                className="transition-all"
              />
            </div>

            <Button
              onClick={handleSimulate}
              className="w-full transition-all duration-300 hover:translate-y-[-2px]"
              disabled={isSimulating}
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Simulating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Run Simulation
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Headcount Forecast</CardTitle>
            <CardDescription>Current vs. projected headcount</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  current: {
                    label: "Current",
                    color: "hsl(var(--chart-1))",
                  },
                  projected: {
                    label: "Projected",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={headcountData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="current"
                      stroke="var(--color-current)"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="projected"
                      stroke="var(--color-projected)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
            <CardDescription>Current workforce allocation by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attrition Trends</CardTitle>
            <CardDescription>Monthly attrition rate over the past year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  rate: {
                    label: "Attrition Rate",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={attritionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      stroke="var(--color-rate)"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hiring Recommendations</CardTitle>
          <CardDescription>AI-powered hiring suggestions based on growth trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Department</th>
                  <th className="text-center py-3 px-4">Current Headcount</th>
                  <th className="text-center py-3 px-4">Recommended Headcount</th>
                  <th className="text-center py-3 px-4">New Hires Needed</th>
                  <th className="text-center py-3 px-4">Priority</th>
                </tr>
              </thead>
              <tbody>
                {hiringRecommendations.map((dept, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 font-medium">{dept.department}</td>
                    <td className="text-center py-3 px-4">{dept.current}</td>
                    <td className="text-center py-3 px-4">{dept.recommended}</td>
                    <td className="text-center py-3 px-4">{dept.recommended - dept.current}</td>
                    <td className="text-center py-3 px-4">{getPriorityBadge(dept.priority)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Recommendations
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

