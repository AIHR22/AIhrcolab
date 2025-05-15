"use client"

import { useState } from "react"
import { FileText, Download, BarChart2, RefreshCw, Clock, Users, DollarSign, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer } from "@/components/ui/chart"
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

// Mock data for reports
const availableReports = [
  {
    id: "1",
    name: "Monthly Payroll Report",
    description: "Summary of all payroll transactions for the month",
    category: "payroll",
    lastGenerated: "2023-11-30",
    formats: ["PDF", "CSV", "Excel"],
  },
  {
    id: "2",
    name: "Employee Performance Summary",
    description: "Overview of employee performance ratings and trends",
    category: "performance",
    lastGenerated: "2023-11-15",
    formats: ["PDF", "Excel"],
  },
  {
    id: "3",
    name: "Attrition Analysis",
    description: "Detailed analysis of employee turnover and reasons",
    category: "workforce",
    lastGenerated: "2023-10-31",
    formats: ["PDF", "CSV", "Excel"],
  },
  {
    id: "4",
    name: "Hiring Trends Report",
    description: "Analysis of hiring patterns and recruitment metrics",
    category: "recruitment",
    lastGenerated: "2023-11-20",
    formats: ["PDF", "Excel"],
  },
  {
    id: "5",
    name: "Department Expense Report",
    description: "Breakdown of expenses by department",
    category: "finance",
    lastGenerated: "2023-11-30",
    formats: ["PDF", "CSV", "Excel"],
  },
  {
    id: "6",
    name: "Revenue Forecast",
    description: "Projected revenue based on current workforce and growth trends",
    category: "finance",
    lastGenerated: "2023-11-25",
    formats: ["PDF", "Excel"],
  },
  {
    id: "7",
    name: "Benefits Utilization Report",
    description: "Analysis of employee benefits usage and costs",
    category: "benefits",
    lastGenerated: "2023-10-15",
    formats: ["PDF", "CSV"],
  },
  {
    id: "8",
    name: "Training Compliance Report",
    description: "Overview of employee training completion and compliance",
    category: "compliance",
    lastGenerated: "2023-11-10",
    formats: ["PDF", "Excel"],
  },
]

// Mock data for analytics
const employeeGrowthData = [
  { month: "Jan", count: 120 },
  { month: "Feb", count: 125 },
  { month: "Mar", count: 130 },
  { month: "Apr", count: 140 },
  { month: "May", count: 145 },
  { month: "Jun", count: 150 },
  { month: "Jul", count: 155 },
  { month: "Aug", count: 160 },
  { month: "Sep", count: 165 },
  { month: "Oct", count: 170 },
  { month: "Nov", count: 175 },
  { month: "Dec", count: 180 },
]

const departmentDistributionData = [
  { name: "Engineering", value: 65 },
  { name: "Sales", value: 40 },
  { name: "Marketing", value: 25 },
  { name: "Product", value: 20 },
  { name: "Design", value: 15 },
  { name: "Finance", value: 10 },
  { name: "HR", value: 5 },
]

const salaryDistributionData = [
  { range: "0-50k", count: 15 },
  { range: "50k-75k", count: 35 },
  { range: "75k-100k", count: 60 },
  { range: "100k-125k", count: 40 },
  { range: "125k-150k", count: 20 },
  { range: "150k+", count: 10 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FF6B6B"]

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectedKPIs, setSelectedKPIs] = useState<string[]>(["headcount", "salary", "turnover"])
  const [isGenerating, setIsGenerating] = useState(false)

  // Filter reports based on search term and category
  const filteredReports = availableReports.filter((report) => {
    const matchesSearch =
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || report.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const handleGenerateReport = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
    }, 2000)
  }

  const handleKPIToggle = (kpi: string) => {
    setSelectedKPIs((prev) => (prev.includes(kpi) ? prev.filter((k) => k !== kpi) : [...prev, kpi]))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Reports & Insights</h1>
        <p className="text-muted-foreground">Generate reports, analyze data, and gain insights into your workforce.</p>
      </div>

      <Tabs defaultValue="reports" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reports">Standard Reports</TabsTrigger>
          <TabsTrigger value="analytics">Custom Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="mt-6 space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Search reports..."
                  className="w-full md:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="payroll">Payroll</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="workforce">Workforce</SelectItem>
                  <SelectItem value="recruitment">Recruitment</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="benefits">Benefits</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredReports.map((report) => (
              <Card key={report.id} className="transition-all duration-300 hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{report.name}</span>
                    <Badge variant="outline" className="capitalize">
                      {report.category}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Last generated: {new Date(report.lastGenerated).toLocaleDateString()}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {report.formats.map((format, index) => (
                      <Badge key={index} variant="secondary">
                        {format}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <Clock className="mr-2 h-4 w-4" />
                    Schedule
                  </Button>
                  <Button size="sm" onClick={handleGenerateReport}>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom Analytics Dashboard</CardTitle>
              <CardDescription>Select KPIs and generate custom graphs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Select KPIs</h3>
                  <ScrollArea className="h-[300px] rounded-md border p-4">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="headcount"
                          checked={selectedKPIs.includes("headcount")}
                          onCheckedChange={() => handleKPIToggle("headcount")}
                        />
                        <Label htmlFor="headcount">Employee Headcount</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="salary"
                          checked={selectedKPIs.includes("salary")}
                          onCheckedChange={() => handleKPIToggle("salary")}
                        />
                        <Label htmlFor="salary">Salary Distribution</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="turnover"
                          checked={selectedKPIs.includes("turnover")}
                          onCheckedChange={() => handleKPIToggle("turnover")}
                        />
                        <Label htmlFor="turnover">Employee Turnover</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="department"
                          checked={selectedKPIs.includes("department")}
                          onCheckedChange={() => handleKPIToggle("department")}
                        />
                        <Label htmlFor="department">Department Distribution</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="performance"
                          checked={selectedKPIs.includes("performance")}
                          onCheckedChange={() => handleKPIToggle("performance")}
                        />
                        <Label htmlFor="performance">Performance Ratings</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="revenue"
                          checked={selectedKPIs.includes("revenue")}
                          onCheckedChange={() => handleKPIToggle("revenue")}
                        />
                        <Label htmlFor="revenue">Revenue per Employee</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hiring"
                          checked={selectedKPIs.includes("hiring")}
                          onCheckedChange={() => handleKPIToggle("hiring")}
                        />
                        <Label htmlFor="hiring">Hiring Trends</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="training"
                          checked={selectedKPIs.includes("training")}
                          onCheckedChange={() => handleKPIToggle("training")}
                        />
                        <Label htmlFor="training">Training Completion</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="benefits"
                          checked={selectedKPIs.includes("benefits")}
                          onCheckedChange={() => handleKPIToggle("benefits")}
                        />
                        <Label htmlFor="benefits">Benefits Utilization</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="attendance"
                          checked={selectedKPIs.includes("attendance")}
                          onCheckedChange={() => handleKPIToggle("attendance")}
                        />
                        <Label htmlFor="attendance">Attendance & Time Off</Label>
                      </div>
                    </div>
                  </ScrollArea>

                  <div className="space-y-2">
                    <Label htmlFor="timeframe">Timeframe</Label>
                    <Select defaultValue="12months">
                      <SelectTrigger>
                        <SelectValue placeholder="Select timeframe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3months">Last 3 Months</SelectItem>
                        <SelectItem value="6months">Last 6 Months</SelectItem>
                        <SelectItem value="12months">Last 12 Months</SelectItem>
                        <SelectItem value="ytd">Year to Date</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    className="w-full transition-all duration-300 hover:translate-y-[-2px]"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <BarChart2 className="mr-2 h-4 w-4" />
                        Generate Dashboard
                      </>
                    )}
                  </Button>
                </div>

                <div className="md:col-span-2 space-y-6">
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    {selectedKPIs.includes("headcount") && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Employee Headcount Trend</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[200px]">
                          <ChartContainer
                            config={{
                              count: {
                                label: "Headcount",
                                color: "hsl(var(--chart-1))",
                              },
                            }}
                            className="h-[200px]"
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsLineChart data={employeeGrowthData}>
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Line
                                  type="monotone"
                                  dataKey="count"
                                  stroke="var(--color-count)"
                                  strokeWidth={2}
                                  dot={false}
                                />
                              </RechartsLineChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </CardContent>
                      </Card>
                    )}

                    {selectedKPIs.includes("department") && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Department Distribution</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[200px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={departmentDistributionData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={60}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                              >
                                {departmentDistributionData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )}

                    {selectedKPIs.includes("salary") && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Salary Distribution</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[200px]">
                          <ChartContainer
                            config={{
                              count: {
                                label: "Employees",
                                color: "hsl(var(--chart-2))",
                              },
                            }}
                            className="h-[200px]"
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsBarChart data={salaryDistributionData}>
                                <XAxis dataKey="range" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="var(--color-count)" />
                              </RechartsBarChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>AI-Generated Insights</CardTitle>
                      <CardDescription>Automated analysis based on selected KPIs</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Headcount Growth</p>
                            <p className="text-sm text-muted-foreground">
                              Employee headcount has grown by 50% over the past 12 months, with the Engineering
                              department showing the highest growth rate at 15%.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Salary Distribution</p>
                            <p className="text-sm text-muted-foreground">
                              The majority of employees (60) fall within the $75k-$100k salary range, which is 10% above
                              industry average for similar roles.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                            <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Department Balance</p>
                            <p className="text-sm text-muted-foreground">
                              Engineering represents 36% of total headcount, which is aligned with industry benchmarks
                              for technology companies of similar size.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Export Full Analysis
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

