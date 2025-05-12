"use client"

import { useRevenueRealtime } from "@/hooks/use-revenue-realtime"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

export function RevenueChart() {
  const { revenueData, loading, error } = useRevenueRealtime()

  if (loading) {
    return <Skeleton className="w-full h-[400px]" />
  }

  if (error) {
    return <div>Error loading revenue data: {error.message}</div>
  }

  // Prepare data for the chart
  const chartData = revenueData.map(item => ({
    date: new Date(item.period_date).toLocaleDateString(),
    revenue: item.amount,
    isProjected: item.is_projected,
    preview: item.preview
  }))

  return (
    <div className="w-full h-[400px] p-4">
      <LineChart width={800} height={400} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#8884d8"
          strokeDasharray={d => d.isProjected ? "5 5" : "0"}
          name="Revenue"
        />
        <Line
          type="monotone"
          dataKey="preview"
          stroke="#82ca9d"
          strokeDasharray="3 3"
          name="Preview"
          strokeOpacity={0.7}
        />
      </LineChart>
    </div>
  )
} 