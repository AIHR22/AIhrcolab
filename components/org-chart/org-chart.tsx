"use client"

import { useState, useEffect } from "react"
import { Tree, TreeNode } from "react-organizational-chart"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"

interface Employee {
  id: string
  first_name: string
  last_name: string
  email: string
  position: string
  department: string
  manager_id: string | null
  avatar_url?: string
}

interface OrgChartProps {
  departmentFilter?: string
}

const supabase = createClient()

export function OrgChart({ departmentFilter }: OrgChartProps) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        let query = supabase.from("employees").select("*")

        if (departmentFilter) {
          query = query.eq("department", departmentFilter)
        }

        const { data, error } = await query

        if (error) throw error

        setEmployees(data || [])
      } catch (err: any) {
        console.error("Error fetching employees:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchEmployees()
  }, [departmentFilter])

  if (loading) {
    return <OrgChartSkeleton />
  }

  if (error) {
    return <div className="text-red-500">Error loading org chart: {error}</div>
  }

  // Find the root nodes (employees with no manager)
  const rootEmployees = employees.filter((emp) => !emp.manager_id)

  // Build the org chart tree
  const renderEmployee = (employee: Employee) => {
    const subordinates = employees.filter((emp) => emp.manager_id === employee.id)

    return (
      <TreeNode key={employee.id} label={<EmployeeCard employee={employee} />}>
        {subordinates.map((sub) => renderEmployee(sub))}
      </TreeNode>
    )
  }

  return (
    <div className="org-chart-container p-4 overflow-auto" style={{ minHeight: "500px" }}>
      <Tree
        lineWidth="2px"
        lineColor="#cbd5e1"
        lineBorderRadius="10px"
        label={<div className="text-lg font-bold mb-4">Organization Chart</div>}
      >
        {rootEmployees.map((emp) => renderEmployee(emp))}
      </Tree>
    </div>
  )
}

function EmployeeCard({ employee }: { employee: Employee }) {
  const fullName = `${employee.first_name} ${employee.last_name}`
  const initials = `${employee.first_name[0]}${employee.last_name[0]}`

  return (
    <Card className="w-64 hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4 flex flex-col items-center">
        <Avatar className="h-16 w-16 mb-2">
          <AvatarImage src={employee.avatar_url || ""} alt={fullName} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <h3 className="font-medium text-base">{fullName}</h3>
        <p className="text-sm text-muted-foreground">{employee.position}</p>
        <Badge variant="outline" className="mt-2">
          {employee.department}
        </Badge>
      </CardContent>
    </Card>
  )
}

function OrgChartSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-8 w-64 mx-auto" />
      <div className="flex justify-center">
        <Skeleton className="h-32 w-64" />
      </div>
      <div className="flex justify-center gap-8">
        <Skeleton className="h-32 w-64" />
        <Skeleton className="h-32 w-64" />
        <Skeleton className="h-32 w-64" />
      </div>
    </div>
  )
}

