"use client"

import { useState } from "react"
import { DollarSign, TrendingUp, BarChart2, Download, RefreshCw, Calculator, Users, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

// Mock data for revenue forecasting
const revenueData = [
  { month: "Jan", actual: 1200000, projected: 1250000 },
  { month: "Feb", actual: 1250000, projected: 1300000 },
  { month: "Mar", actual: 1300000, projected: 1350000 },
  { month: "Apr", actual: 1350000, projected: 1400000 },
  { month: "May", actual: 1400000, projected: 1450000 },
  { month: "Jun", actual: 1450000, projected: 1500000 },
  { month: "Jul", actual: 1500000, projected: 1550000 },
  { month: "Aug", actual: 1550000, projected: 1600000 },
  { month: "Sep", actual: 1600000, projected: 1650000 },
  { month: "Oct", actual: 1650000, projected: 1700000 },
  { month: "Nov", actual: 1700000, projected: 1750000 },
  { month: "Dec", actual: 1750000, projected: 1800000 },
]

const departmentRevenueData = [
  { department: "Engineering", revenue: 650000, headcount: 65, revenuePerEmployee: 10000 },
  { department: "Sales", revenue: 480000, headcount: 40, revenuePerEmployee: 12000 },
  { department: "Marketing", revenue: 250000, headcount: 25, revenuePerEmployee: 10000 },
  { department: "Product", revenue: 220000, headcount: 20, revenuePerEmployee: 11000 },
  { department: "Design", revenue: 150000, headcount: 15, revenuePerEmployee: 10000 },
  { department: "Finance", revenue: 100000, headcount: 10, revenuePerEmployee: 10000 },
  { department: "HR", revenue: 50000, headcount: 5, revenuePerEmployee: 10000 },
]

export default function RevenueForecasting() {
  const [employeeCount, setEmployeeCount] = useState(180)
  const [avgSalary, setAvgSalary] = useState(95000)
  const [revenuePerEmployee, setRevenuePerEmployee] = useState(10000)
  const [growthRate, setGrowthRate] = useState(5)
  const [timeframe, setTimeframe] = useState("12months")
  const [isCalculating, setIsCalculating] = useState(false)

  // Calculate projected revenue
  const monthlyRevenue = employeeCount * revenuePerEmployee
  const annualRevenue = monthlyRevenue * 12
  const projectedRevenue = annualRevenue * (1 + growthRate / 100)

  // Calculate profitability
  const totalSalaries = employeeCount * avgSalary
  const profitMargin = ((annualRevenue - totalSalaries) / annualRevenue) * 100

  const handleCalculate = () => {
    setIsCalculating(true)
    setTimeout(() => {
      setIsCalculating(false)
    }, 1500)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Revenue Forecasting</h1>
        <p className="text-muted-foreground">Project future revenue based on workforce changes and growth trends.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
              <span className="text-green-500">+{growthRate}%</span> projected growth
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Revenue</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${annualRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">Based on current workforce</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projected Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${projectedRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">With {growthRate}% growth rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profitMargin.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground flex items-center">After salary expenses</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Projection Model</CardTitle>
            <CardDescription>Adjust parameters to forecast revenue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employee-count">Employee Count</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="employee-count"
                  type="number"
                  value={employeeCount}
                  onChange={(e) => setEmployeeCount(Number.parseInt(e.target.value) || 0)}
                  className="flex-1"
                />
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avg-salary">Average Salary ($)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="avg-salary"
                  type="number"
                  value={avgSalary}
                  onChange={(e) => setAvgSalary(Number.parseInt(e.target.value) || 0)}
                  className="flex-1"
                />
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="revenue-per-employee">Monthly Revenue per Employee ($)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="revenue-per-employee"
                  type="number"
                  value={revenuePerEmployee}
                  onChange={(e) => setRevenuePerEmployee(Number.parseInt(e.target.value) || 0)}
                  className="flex-1"
                />
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </div>
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
              <Label htmlFor="timeframe">Projection Timeframe</Label>
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

            <Button
              onClick={handleCalculate}
              className="w-full transition-all duration-300 hover:translate-y-[-2px]"
              disabled={isCalculating}
            >
              {isCalculating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="mr-2 h-4 w-4" />
                  Calculate Projections
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
            <CardDescription>Actual vs. projected revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  actual: {
                    label: "Actual",
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
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="var(--color-actual)"
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
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profitability Simulator</CardTitle>
          <CardDescription>Adjust hiring/firing decisions and see revenue impact in real time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Department</th>
                  <th className="text-center py-3 px-4">Headcount</th>
                  <th className="text-center py-3 px-4">Revenue per Employee</th>
                  <th className="text-center py-3 px-4">Total Revenue</th>
                  <th className="text-center py-3 px-4">Adjust Headcount</th>
                  <th className="text-center py-3 px-4">Impact</th>
                </tr>
              </thead>
              <tbody>
                {departmentRevenueData.map((dept, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 font-medium">{dept.department}</td>
                    <td className="text-center py-3 px-4">{dept.headcount}</td>
                    <td className="text-center py-3 px-4">${dept.revenuePerEmployee.toLocaleString()}</td>
                    <td className="text-center py-3 px-4">${dept.revenue.toLocaleString()}</td>
                    <td className="text-center py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          -
                        </Button>
                        <span className="w-8 text-center">{dept.headcount}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          +
                        </Button>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <Badge className="bg-green-500">+$0</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Projected Impact:</span>
            <Badge className="bg-green-500">+$0 Revenue</Badge>
          </div>
          <Button>Apply Changes</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revenue by Department</CardTitle>
          <CardDescription>Breakdown of revenue contribution by department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ChartContainer
              config={{
                revenue: {
                  label: "Revenue",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="revenue" fill="var(--color-revenue)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="ml-auto">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

