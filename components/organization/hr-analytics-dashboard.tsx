"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-picker-range"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { 
  UserPlus, 
  UserMinus, 
  DollarSign, 
  BarChart2, 
  PieChart, 
  Layers, 
  Users, 
  Calendar, 
  Award, 
  TrendingUp, 
  Clock 
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { HRMetric, Department } from "@/types/organization"
import type { DateRange } from "@/types/common"
import { format } from "date-fns"

// Type definitions for the dashboard
type MetricCard = {
  title: string
  value: string | number
  change: number
  period: string
  icon: React.ReactNode
  description: string
  trend: "up" | "down" | "neutral"
}

type AnalyticsPeriod = "30d" | "90d" | "6m" | "1y" | "custom"

export function HRAnalyticsDashboard() {
  const [selectedTab, setSelectedTab] = useState<string>("overview")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [period, setPeriod] = useState<AnalyticsPeriod>("30d")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [metrics, setMetrics] = useState<MetricCard[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Fetch departments when component mounts
  useEffect(() => {
    fetchDepartments()
  }, [])

  // Fetch metrics when department or period changes
  useEffect(() => {
    if (departments.length > 0) {
      fetchMetrics()
    }
  }, [selectedDepartment, period, dateRange, departments])

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments')
      
      if (!response.ok) {
        throw new Error('Failed to fetch departments')
      }
      
      const data = await response.json()
      setDepartments(data)
    } catch (error) {
      console.error("Error fetching departments:", error)
      toast({
        title: "Error",
        description: "Failed to load departments",
        variant: "destructive",
      })
    }
  }

  const fetchMetrics = async () => {
    setIsLoading(true)
    try {
      // Build the query params
      let params = new URLSearchParams()
      
      if (selectedDepartment !== "all") {
        params.append("department_id", selectedDepartment)
      }
      
      params.append("period", period)
      
      if (period === "custom" && dateRange?.from && dateRange?.to) {
        params.append("from", format(dateRange.from, "yyyy-MM-dd"))
        params.append("to", format(dateRange.to, "yyyy-MM-dd"))
      }
      
      const response = await fetch(`/api/organization/analytics?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }
      
      const data = await response.json()
      
      // Transform the data into metrics cards
      const transformedMetrics: MetricCard[] = [
        {
          title: "Headcount",
          value: data.headcount.current,
          change: data.headcount.change,
          period: getPeriodText(),
          icon: <Users className="h-4 w-4" />,
          description: "Total number of employees",
          trend: data.headcount.change > 0 ? "up" : data.headcount.change < 0 ? "down" : "neutral"
        },
        {
          title: "Turnover Rate",
          value: `${data.turnover.rate.toFixed(1)}%`,
          change: data.turnover.change,
          period: getPeriodText(),
          icon: <UserMinus className="h-4 w-4" />,
          description: "Employee turnover percentage",
          trend: data.turnover.change > 0 ? "up" : data.turnover.change < 0 ? "down" : "neutral"
        },
        {
          title: "New Hires",
          value: data.newHires.count,
          change: data.newHires.change,
          period: getPeriodText(),
          icon: <UserPlus className="h-4 w-4" />,
          description: "Newly hired employees",
          trend: data.newHires.change > 0 ? "up" : data.newHires.change < 0 ? "down" : "neutral"
        },
        {
          title: "Avg. Time to Fill",
          value: `${data.timeToFill.days} days`,
          change: data.timeToFill.change,
          period: getPeriodText(),
          icon: <Clock className="h-4 w-4" />,
          description: "Average days to fill open positions",
          trend: data.timeToFill.change > 0 ? "down" : data.timeToFill.change < 0 ? "up" : "neutral"
        },
        {
          title: "Salary Costs",
          value: `$${(data.costs.salary / 1000).toFixed(0)}k`,
          change: data.costs.change,
          period: getPeriodText(),
          icon: <DollarSign className="h-4 w-4" />,
          description: "Total salary expenditure",
          trend: data.costs.change > 0 ? "up" : data.costs.change < 0 ? "down" : "neutral"
        },
        {
          title: "Engagement Score",
          value: `${data.engagement.score.toFixed(1)}`,
          change: data.engagement.change,
          period: getPeriodText(),
          icon: <Award className="h-4 w-4" />,
          description: "Employee engagement rating (1-5)",
          trend: data.engagement.change > 0 ? "up" : data.engagement.change < 0 ? "down" : "neutral"
        },
      ]
      
      setMetrics(transformedMetrics)
    } catch (error) {
      console.error("Error fetching metrics:", error)
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getPeriodText = (): string => {
    switch (period) {
      case "30d":
        return "Last 30 days"
      case "90d":
        return "Last 90 days"
      case "6m":
        return "Last 6 months"
      case "1y":
        return "Last year"
      case "custom":
        if (dateRange?.from && dateRange?.to) {
          return `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`
        }
        return "Custom period"
      default:
        return "Current period"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">HR Analytics Dashboard</h2>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="6m">Last 6 months</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {period === "custom" && (
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          )}
          
          <Button onClick={fetchMetrics} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </div>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="headcount">Headcount</TabsTrigger>
          <TabsTrigger value="turnover">Turnover</TabsTrigger>
          <TabsTrigger value="recruitment">Recruitment</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.map((metric, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-medium">{metric.title}</CardTitle>
                      <div className="p-2 bg-muted rounded-full">
                        {metric.icon}
                      </div>
                    </div>
                    <CardDescription>{metric.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <div className="flex items-center mt-2">
                      <Badge 
                        variant={metric.trend === "up" ? "default" : metric.trend === "down" ? "destructive" : "outline"}
                        className="flex items-center gap-1"
                      >
                        {metric.trend === "up" ? <TrendingUp className="h-3 w-3" /> : null}
                        {metric.trend === "down" ? <TrendingUp className="h-3 w-3 transform rotate-180" /> : null}
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-2">vs. previous {metric.period}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Compliance Status Card */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium">Compliance Status</CardTitle>
                    <div className="p-2 bg-muted rounded-full">
                      <Layers className="h-4 w-4" />
                    </div>
                  </div>
                  <CardDescription>Organizational compliance health</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Overall Status</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                        Compliant
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Last Audit</span>
                      <span className="text-sm">March 15, 2025</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Issues</span>
                      <span className="text-sm">0 critical, 2 minor</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">View Audit Report</Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </TabsContent>
        
        {/* Other tabs content would go here */}
        <TabsContent value="headcount">
          <div className="flex flex-col items-center justify-center h-96">
            <BarChart2 className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Detailed headcount analytics will appear here</p>
          </div>
        </TabsContent>
        
        <TabsContent value="turnover">
          <div className="flex flex-col items-center justify-center h-96">
            <PieChart className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Detailed turnover analytics will appear here</p>
          </div>
        </TabsContent>
        
        <TabsContent value="recruitment">
          <div className="flex flex-col items-center justify-center h-96">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Detailed recruitment analytics will appear here</p>
          </div>
        </TabsContent>
        
        <TabsContent value="costs">
          <div className="flex flex-col items-center justify-center h-96">
            <DollarSign className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Detailed cost analytics will appear here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
