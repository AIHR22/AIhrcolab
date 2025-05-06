"use client"

import { useState, useEffect } from "react"
import { ArrowDown, ArrowUp, Users, Briefcase, Clock, DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDashboardStats } from "@/lib/supabase/api"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardStats() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getDashboardStats()
        setStats(data)
      } catch (err) {
        console.error("Error fetching dashboard stats:", err)
        setError("Failed to load dashboard statistics")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="bg-red-50 p-4 rounded-md text-red-500">{error}</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.employees.total.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {stats.employees.increasing ? (
              <span className="text-green-500 flex items-center">
                <ArrowUp className="mr-1 h-4 w-4" />
                {stats.employees.change}% from last month
              </span>
            ) : (
              <span className="text-red-500 flex items-center">
                <ArrowDown className="mr-1 h-4 w-4" />
                {Math.abs(stats.employees.change)}% from last month
              </span>
            )}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.openPositions.total}</div>
          <p className="text-xs text-muted-foreground">
            {stats.openPositions.increasing ? (
              <span className="text-green-500 flex items-center">
                <ArrowUp className="mr-1 h-4 w-4" />
                {stats.openPositions.change}% from last month
              </span>
            ) : (
              <span className="text-red-500 flex items-center">
                <ArrowDown className="mr-1 h-4 w-4" />
                {Math.abs(stats.openPositions.change)}% from last month
              </span>
            )}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Time Off Requests</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.timeOffRequests.total}</div>
          <p className="text-xs text-muted-foreground">
            {stats.timeOffRequests.increasing ? (
              <span className="text-amber-500 flex items-center">
                <ArrowUp className="mr-1 h-4 w-4" />
                {stats.timeOffRequests.change}% from last month
              </span>
            ) : (
              <span className="text-green-500 flex items-center">
                <ArrowDown className="mr-1 h-4 w-4" />
                {Math.abs(stats.timeOffRequests.change)}% from last month
              </span>
            )}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Salary</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.averageSalary.total.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {stats.averageSalary.increasing ? (
              <span className="text-green-500 flex items-center">
                <ArrowUp className="mr-1 h-4 w-4" />
                {stats.averageSalary.change}% from last year
              </span>
            ) : (
              <span className="text-red-500 flex items-center">
                <ArrowDown className="mr-1 h-4 w-4" />
                {Math.abs(stats.averageSalary.change)}% from last year
              </span>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

