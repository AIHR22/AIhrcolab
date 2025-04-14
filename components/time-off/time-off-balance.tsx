"use client"

import { PieChart, Pie, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock data for time off balances
const timeOffBalances = [
  {
    name: "Vacation",
    used: 5,
    remaining: 15,
    total: 20,
  },
  {
    name: "Sick Leave",
    used: 2,
    remaining: 8,
    total: 10,
  },
  {
    name: "Personal",
    used: 1,
    remaining: 2,
    total: 3,
  },
  {
    name: "Floating Holidays",
    used: 0,
    remaining: 2,
    total: 2,
  },
]

export function TimeOffBalance() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Time Off Summary</CardTitle>
          <CardDescription>Your available time off by category</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              used: {
                label: "Used",
                color: "hsl(var(--chart-1))",
              },
              remaining: {
                label: "Remaining",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={timeOffBalances}
                  dataKey="remaining"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="var(--color-remaining)"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {timeOffBalances.map((balance) => (
          <Card key={balance.name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{balance.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm">
                <div>
                  <p className="text-muted-foreground">Used</p>
                  <p className="text-xl font-bold">{balance.used} days</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Remaining</p>
                  <p className="text-xl font-bold">{balance.remaining} days</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total</p>
                  <p className="text-xl font-bold">{balance.total} days</p>
                </div>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${(balance.used / balance.total) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

