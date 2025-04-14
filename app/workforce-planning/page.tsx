"use client"

import React, { useState, useEffect } from 'react'
import { workforcePlanningService } from '@/lib/services/workforce-planning-service'
import { DepartmentOverview } from './components/department-overview'

interface DepartmentOverviewData {
  id: string
  name: string
  currentHeadcount: number
  requiredHeadcount: number
}

interface DashboardData {
  departmentOverview: DepartmentOverviewData[]
  attritionRisk: any[] // Placeholder type
  skillDemand: any[] // Placeholder type
  budgetVsActual: any[] // Placeholder type
}

export default function WorkforcePlanningPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await workforcePlanningService.getDashboardData()
        setDashboardData(data)
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err)
        setError("Failed to load dashboard data. Please try again later.")
        setDashboardData({ // Set default structure on error
          departmentOverview: [],
          attritionRisk: [],
          skillDemand: [],
          budgetVsActual: [],
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Workforce Planning Dashboard</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-md">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Department Overview */}
        <DepartmentOverview 
          data={dashboardData?.departmentOverview || []} 
          isLoading={isLoading}
        />

        {/* Attrition Risk */}
        <div className="bg-card p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Attrition Risk Analysis</h2>
          {/* Placeholder for chart/data */}
          <p className="text-muted-foreground">Coming soon...</p>
        </div>

        {/* Skill Demand Heatmap */}
        <div className="bg-card p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Skill Demand Heatmap</h2>
          {/* Placeholder for chart/data */}
          <p className="text-muted-foreground">Coming soon...</p>
        </div>

        {/* Budget vs Actual */}
        <div className="bg-card p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Budget vs Actual Labor Cost</h2>
          {/* Placeholder for chart/data */}
          <p className="text-muted-foreground">Coming soon...</p>
        </div>
      </div>
    </div>
  )
} 