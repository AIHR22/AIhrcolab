"use client"

import { useState } from "react"
import { Users, DollarSign, TrendingUp, Plus, FileText, BarChart2, ArrowUp, UserPlus, RotateCcw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer } from "@/components/ui/chart"
import {
  ResponsiveContainer,
  LineChart,
  Line,
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
} from "recharts"

import { UpcomingReviews } from "@/components/dashboard/upcoming-reviews"
import { TimeOffRequests } from "@/components/dashboard/time-off-requests"
import { motion } from "framer-motion"
import Link from "next/link"

// Mock data for charts
const workforceData = [
  { month: "Jan", employees: 120 },
  { month: "Feb", employees: 125 },
  { month: "Mar", employees: 130 },
  { month: "Apr", employees: 140 },
  { month: "May", employees: 145 },
  { month: "Jun", employees: 150 },
  { month: "Jul", employees: 155 },
  { month: "Aug", employees: 160 },
  { month: "Sep", employees: 165 },
  { month: "Oct", employees: 170 },
  { month: "Nov", employees: 175 },
  { month: "Dec", employees: 180 },
]

const payrollData = [
  { month: "Jan", payroll: 450000, revenue: 800000 },
  { month: "Feb", payroll: 460000, revenue: 820000 },
  { month: "Mar", payroll: 470000, revenue: 850000 },
  { month: "Apr", payroll: 480000, revenue: 900000 },
  { month: "May", payroll: 490000, revenue: 950000 },
  { month: "Jun", payroll: 500000, revenue: 1000000 },
]

const turnoverData = [
  { name: "Voluntary", value: 12 },
  { name: "Involuntary", value: 5 },
  { name: "Retirement", value: 3 },
  { name: "Other", value: 2 },
]

const departmentData = [
  { name: "Engineering", value: 60 },
  { name: "Marketing", value: 30 },
  { name: "Sales", value: 40 },
  { name: "HR", value: 10 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Organization Module</h3>
            <p className="text-sm text-muted-foreground">Access the new Organization module to manage your company structure</p>
          </div>
          <Link href="/dashboard/organization" className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md">
            Go to Organization
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your HR Suite dashboard. Here's what's happening today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <motion.div
          className="col-span-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">180</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                <span className="text-green-500">5.2%</span> from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="col-span-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$500,000</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <ArrowUp className="mr-1 h-4 w-4 text-amber-500" />
                <span className="text-amber-500">2.1%</span> from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="col-span-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                <span className="text-green-500">1 new</span> this month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="col-span-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Workforce Turnover</CardTitle>
              <RotateCcw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">10.5%</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <ArrowUp className="mr-1 h-4 w-4 text-red-500" />
                <span className="text-red-500">0.3%</span> from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="col-span-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projected Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$1.2M</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                <span className="text-green-500">8.2%</span> projected growth
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <motion.div
          className="col-span-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Workforce Growth Trends</CardTitle>
              <CardDescription>Employee headcount over the past 12 months</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartContainer
                config={{
                  employees: {
                    label: "Employees",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={workforceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="employees"
                      stroke="var(--color-employees)"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="col-span-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Workforce Allocation by Department</CardTitle>
              <CardDescription>Distribution of employees across departments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
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
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card>
          <CardHeader>
            <CardTitle>Payroll vs. Revenue</CardTitle>
            <CardDescription>Monthly comparison of payroll expenses and revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  payroll: {
                    label: "Payroll",
                    color: "hsl(var(--chart-1))",
                  },
                  revenue: {
                    label: "Revenue",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={payrollData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="payroll" fill="var(--color-payroll)" />
                    <Bar dataKey="revenue" fill="var(--color-revenue)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

