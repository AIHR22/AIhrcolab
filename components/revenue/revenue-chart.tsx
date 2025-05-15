"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { useRevenueTrends } from "@/app/dashboard/revenue/utils/revenueTrendsHelper"

export function RevenueChart() {
  const { data, isLoading, error } = useRevenueTrends()

  if (isLoading) {
    return <Skeleton className="w-full h-[350px] bg-slate-800" />
  }

  if (error) {
    return <div className="text-gray-200">Error loading revenue data: {error.message}</div>
  }

  // Format currency for tooltip
  const formatCurrency = (value: number) => {
    if (!value && value !== 0) return ''
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="#1e293b"
          vertical={false}
        />
        <XAxis
          dataKey="month"
          stroke="#94a3b8"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#94a3b8"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatCurrency}
          width={100}
        />
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), ""]}
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
            color: "#94a3b8"
          }}
          cursor={{ stroke: '#475569' }}
        />
        <Legend 
          wrapperStyle={{ color: '#94a3b8' }}
        />
        <Line
          type="monotone"
          dataKey="actual"
          name="Actual Revenue"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ r: 4, fill: '#3b82f6' }}
          activeDot={{ r: 6, fill: '#3b82f6' }}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="projected"
          name="Projected Revenue"
          stroke="#22c55e"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={{ r: 4, fill: '#22c55e' }}
          activeDot={{ r: 6, fill: '#22c55e' }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
