import { Progress } from "@/components/ui/progress"

const metrics = [
  {
    name: "Database",
    value: 98,
    status: "Healthy",
  },
  {
    name: "API Response Time",
    value: 95,
    status: "245ms avg",
  },
  {
    name: "Error Rate",
    value: 99.97,
    status: "0.03%",
  },
]

export function SystemHealth() {
  return (
    <div className="space-y-4">
      {metrics.map((metric) => (
        <div key={metric.name} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{metric.name}</span>
            <span className="text-sm text-muted-foreground">{metric.status}</span>
          </div>
          <Progress value={metric.value} className="h-2" />
        </div>
      ))}
    </div>
  )
}
