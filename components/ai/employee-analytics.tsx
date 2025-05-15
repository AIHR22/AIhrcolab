"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import { Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface AnalyticsProps {
  title: string
  description?: string
}

const supabase = createClient()

export function EmployeeAnalytics({ title, description }: AnalyticsProps) {
  const [loading, setLoading] = useState(true)
  const [employeeData, setEmployeeData] = useState<any[]>([])
  const [insightLoading, setInsightLoading] = useState(false)
  const [aiInsight, setAiInsight] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase.from("employees").select("*")

        if (error) throw error

        setEmployeeData(data || [])
      } catch (err) {
        console.error("Error fetching employee data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const generateAIInsight = async () => {
    setInsightLoading(true)

    try {
      // In a real app, this would call an AI API
      // Simulating API call with timeout
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const insights = [
        "Employee turnover is 15% lower in departments with flexible work arrangements.",
        "Employees who participated in the mentorship program showed 23% higher performance ratings.",
        "Teams with regular 1-on-1 meetings have 30% higher engagement scores.",
        "Departments with cross-training opportunities show 18% better retention rates.",
        "Employees who utilized professional development budgets were 2.5x more likely to be promoted.",
      ]

      setAiInsight(insights[Math.floor(Math.random() * insights.length)])
    } catch (err) {
      console.error("Error generating AI insight:", err)
    } finally {
      setInsightLoading(false)
    }
  }

  if (loading) {
    return <AnalyticsSkeleton />
  }

  // Process data for charts
  const departmentData = employeeData.reduce((acc, emp) => {
    const dept = emp.department
    if (!acc[dept]) acc[dept] = 0
    acc[dept]++
    return acc
  }, {})

  const departmentChartData = Object.entries(departmentData).map(([name, value]) => ({
    name,
    value,
  }))

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

  // Simulate tenure data
  const tenureData = [
    { name: "<1 year", value: 12 },
    { name: "1-2 years", value: 18 },
    { name: "3-5 years", value: 29 },
    { name: "6-10 years", value: 14 },
    { name: ">10 years", value: 8 },
  ]

  // Simulate performance data
  const performanceData = [
    { month: "Jan", actual: 65, target: 70 },
    { month: "Feb", actual: 68, target: 70 },
    { month: "Mar", actual: 73, target: 70 },
    { month: "Apr", actual: 75, target: 75 },
    { month: "May", actual: 78, target: 75 },
    { month: "Jun", actual: 82, target: 75 },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <Button variant="outline" size="sm" onClick={generateAIInsight} disabled={insightLoading}>
            <Sparkles className="mr-2 h-4 w-4" />
            {insightLoading ? "Analyzing..." : "AI Insights"}
          </Button>
        </div>
        {aiInsight && (
          <div className="mt-2 p-3 bg-primary/10 rounded-md text-sm">
            <div className="flex gap-2 items-center mb-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-medium">AI Insight</span>
            </div>
            {aiInsight}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="department">
          <TabsList className="mb-4">
            <TabsTrigger value="department">Department</TabsTrigger>
            <TabsTrigger value="tenure">Tenure</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="department" className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {departmentChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="tenure" className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tenureData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Employees" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="performance" className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="actual" name="Actual" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="target" name="Target" stroke="#82ca9d" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function AnalyticsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-80 w-full" />
      </CardContent>
    </Card>
  )
}

