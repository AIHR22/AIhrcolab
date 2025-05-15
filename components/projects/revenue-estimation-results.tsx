"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { AlertCircle, CheckCircle, DollarSign, TrendingUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface RevenueEstimationResultsProps {
  data: any
}

export function RevenueEstimationResults({ data }: RevenueEstimationResultsProps) {
  const revenueData = data?.revenueEstimation

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Generate projection data for the chart
  const generateProjectionData = () => {
    const projectionData = []
    const months = 12
    const monthlyRevenue = revenueData?.estimatedRevenue / months
    const monthlyCost = revenueData?.costEstimate / months
    let cumulativeRevenue = 0
    let cumulativeCost = revenueData?.costEstimate * 0.4 // Initial investment

    for (let i = 0; i <= months; i++) {
      if (i === 0) {
        projectionData.push({
          month: `Month ${i}`,
          revenue: 0,
          cost: cumulativeCost,
          profit: -cumulativeCost,
        })
      } else {
        cumulativeRevenue += monthlyRevenue * (1 + (i / months) * 0.2) // Increasing revenue over time
        cumulativeCost += monthlyCost
        projectionData.push({
          month: `Month ${i}`,
          revenue: cumulativeRevenue,
          cost: cumulativeCost,
          profit: cumulativeRevenue - cumulativeCost,
        })
      }
    }

    return projectionData
  }

  const projectionData = generateProjectionData()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Revenue Estimation</h3>
        <p className="text-sm text-muted-foreground">
          AI-powered financial projections based on historical data and market trends
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <h4 className="font-medium">Estimated Revenue</h4>
          </div>
          <p className="mt-2 text-2xl font-bold">{formatCurrency(revenueData?.estimatedRevenue || 0)}</p>
        </div>

        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <h4 className="font-medium">Estimated Cost</h4>
          </div>
          <p className="mt-2 text-2xl font-bold">{formatCurrency(revenueData?.costEstimate || 0)}</p>
        </div>

        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <h4 className="font-medium">Profit Margin</h4>
          </div>
          <p className="mt-2 text-2xl font-bold">{revenueData?.profitMargin || 0}%</p>
        </div>

        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <h4 className="font-medium">ROI</h4>
          </div>
          <p className="mt-2 text-2xl font-bold">{revenueData?.roi || 0}%</p>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <h4 className="mb-4 font-medium">Financial Projection</h4>
        <div className="h-[300px]">
          <ChartContainer
            config={{
              revenue: {
                label: "Revenue",
                color: "hsl(var(--chart-1))",
              },
              cost: {
                label: "Cost",
                color: "hsl(var(--chart-2))",
              },
              profit: {
                label: "Profit",
                color: "hsl(var(--chart-3))",
              },
            }}
            className="h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={projectionData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" name="Revenue" />
                <Line type="monotone" dataKey="cost" stroke="var(--color-cost)" name="Cost" />
                <Line type="monotone" dataKey="profit" stroke="var(--color-profit)" name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Confidence Score</h4>
          <Badge variant={revenueData?.confidenceScore > 80 ? "default" : "outline"}>
            {revenueData?.confidenceScore || 0}%
          </Badge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          This confidence score is based on the quality of historical data, market stability, and similarity to past
          projects.
        </p>
      </div>

      <div className="rounded-lg border p-4">
        <h4 className="font-medium">Financial Analysis Summary</h4>
        <div className="mt-4 flex items-start gap-4">
          {(revenueData?.profitMargin || 0) > 25 ? (
            <div className="rounded-full bg-green-100 p-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
            </div>
          ) : (
            <div className="rounded-full bg-yellow-100 p-2 text-yellow-600">
              <AlertCircle className="h-5 w-5" />
            </div>
          )}
          <div>
            <p className="font-medium">Profitability Assessment</p>
            <p className="text-sm text-muted-foreground">
              {(revenueData?.profitMargin || 0) > 25
                ? "This project is expected to be highly profitable with a strong return on investment."
                : "This project has moderate profitability. Consider ways to reduce costs or increase revenue."}
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-start gap-4">
          {(revenueData?.roi || 0) > 100 ? (
            <div className="rounded-full bg-green-100 p-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
            </div>
          ) : (
            <div className="rounded-full bg-yellow-100 p-2 text-yellow-600">
              <AlertCircle className="h-5 w-5" />
            </div>
          )}
          <div>
            <p className="font-medium">ROI Assessment</p>
            <p className="text-sm text-muted-foreground">
              {(revenueData?.roi || 0) > 100
                ? "The expected ROI is excellent, indicating a strong financial case for this project."
                : "The ROI is acceptable but could be improved. Review the project scope and resource allocation."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

