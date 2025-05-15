"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const departmentData = [
  {
    name: "Engineering",
    headcount: 45,
    openPositions: 5,
    budget: 4500000,
  },
  {
    name: "Marketing",
    headcount: 20,
    openPositions: 2,
    budget: 1800000,
  },
  {
    name: "Sales",
    headcount: 30,
    openPositions: 4,
    budget: 3200000,
  },
  {
    name: "Finance",
    headcount: 15,
    openPositions: 1,
    budget: 1500000,
  },
  {
    name: "HR",
    headcount: 10,
    openPositions: 2,
    budget: 900000,
  },
  {
    name: "Product",
    headcount: 18,
    openPositions: 3,
    budget: 2100000,
  },
  {
    name: "Design",
    headcount: 12,
    openPositions: 2,
    budget: 1200000,
  },
]

export function DepartmentMetrics() {
  return (
    <ChartContainer
      config={{
        headcount: {
          label: "Headcount",
          color: "hsl(var(--chart-1))",
        },
        openPositions: {
          label: "Open Positions",
          color: "hsl(var(--chart-2))",
        },
      }}
      className="h-[400px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={departmentData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />
          <Bar dataKey="headcount" fill="var(--color-headcount)" name="Headcount" />
          <Bar dataKey="openPositions" fill="var(--color-openPositions)" name="Open Positions" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

