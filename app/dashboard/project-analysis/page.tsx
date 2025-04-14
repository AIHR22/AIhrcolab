"use client"

import { ProjectAnalytics } from "@/components/project-analysis/project-analytics"
import { ProjectSelector } from "@/components/project-analysis/project-selector"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Correct way to export configuration in Next.js 15
export const dynamic = "force-dynamic"

export default function ProjectAnalysisPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Project Analysis</h1>
        <p className="text-muted-foreground">Analyze project performance and metrics</p>
      </div>

      <ProjectSelector />

      <Card>
        <CardHeader>
          <CardTitle>Project Analytics</CardTitle>
          <CardDescription>View detailed analytics for the selected project</CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectAnalytics />
        </CardContent>
      </Card>
    </div>
  )
}

