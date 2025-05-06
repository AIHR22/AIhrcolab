"use client"

import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DepartmentOverviewData {
  id: string
  name: string
  currentHeadcount: number
  requiredHeadcount: number
}

interface DepartmentOverviewProps {
  data: DepartmentOverviewData[]
  isLoading: boolean
}

export function DepartmentOverview({ data, isLoading }: DepartmentOverviewProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Department Workforce Overview</CardTitle>
          <CardDescription>Current vs Required Headcount</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-24 flex items-center justify-center text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Department Workforce Overview</CardTitle>
          <CardDescription>Current vs Required Headcount</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No department data available.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Department Workforce Overview</CardTitle>
        <CardDescription>Current vs Required Headcount</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Department</TableHead>
              <TableHead className="text-right">Current</TableHead>
              <TableHead className="text-right">Required</TableHead>
              <TableHead className="text-right">Variance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((dept) => {
              const variance = dept.currentHeadcount - dept.requiredHeadcount
              const varianceColor = variance < 0 ? 'text-red-500' : variance > 0 ? 'text-green-500' : 'text-muted-foreground'
              return (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">{dept.name}</TableCell>
                  <TableCell className="text-right">{dept.currentHeadcount}</TableCell>
                  <TableCell className="text-right">{dept.requiredHeadcount}</TableCell>
                  <TableCell className={`text-right font-medium ${varianceColor}`}>
                    {variance >= 0 ? `+${variance}` : variance}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
} 