"use client"

import { AlertCircle, CheckCircle, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

type ComplianceArea = {
  id: string
  name: string
  status: "compliant" | "non-compliant" | "pending"
  score: number
  lastChecked: string
  dueDate?: string
}

const complianceAreas: ComplianceArea[] = [
  {
    id: "1",
    name: "Data Protection",
    status: "compliant",
    score: 92,
    lastChecked: "2023-07-15",
  },
  {
    id: "2",
    name: "Employee Rights",
    status: "compliant",
    score: 98,
    lastChecked: "2023-07-10",
  },
  {
    id: "3",
    name: "Health & Safety",
    status: "non-compliant",
    score: 65,
    lastChecked: "2023-07-05",
    dueDate: "2023-08-15",
  },
  {
    id: "4",
    name: "Equal Opportunity",
    status: "compliant",
    score: 95,
    lastChecked: "2023-07-12",
  },
  {
    id: "5",
    name: "Financial Regulations",
    status: "pending",
    score: 0,
    lastChecked: "2023-06-01",
    dueDate: "2023-08-01",
  },
]

export function ComplianceStatus() {
  const getStatusIcon = (status: ComplianceArea["status"]) => {
    switch (status) {
      case "compliant":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "non-compliant":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusText = (status: ComplianceArea["status"]) => {
    switch (status) {
      case "compliant":
        return "Compliant"
      case "non-compliant":
        return "Non-Compliant"
      case "pending":
        return "Review Pending"
    }
  }

  const getProgressColor = (score: number) => {
    if (score >= 90) return "bg-green-500"
    if (score >= 70) return "bg-yellow-500"
    return "bg-red-500"
  }

  // Calculate overall compliance score
  const compliantAreas = complianceAreas.filter((area) => area.status === "compliant").length
  const totalAreas = complianceAreas.length
  const overallScore = Math.round((compliantAreas / totalAreas) * 100)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Overall Compliance Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{overallScore}%</div>
            <div className="text-sm text-muted-foreground">
              {compliantAreas} of {totalAreas} areas compliant
            </div>
          </div>
          <Progress value={overallScore} className="mt-2" />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {complianceAreas.map((area) => (
          <Card key={area.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{area.name}</h3>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(area.status)}
                  <span className="text-sm">{getStatusText(area.status)}</span>
                </div>
              </div>

              {area.status !== "pending" && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Compliance Score</span>
                    <span className="font-medium">{area.score}%</span>
                  </div>
                  <Progress value={area.score} className={getProgressColor(area.score)} />
                </div>
              )}

              <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                <span>Last checked: {new Date(area.lastChecked).toLocaleDateString()}</span>
                {area.dueDate && <span>Due: {new Date(area.dueDate).toLocaleDateString()}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

