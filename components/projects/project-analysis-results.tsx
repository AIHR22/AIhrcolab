"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ProjectAnalysisResultsProps {
  results: any
  projectData: any
}

export function ProjectAnalysisResults({ results, projectData }: ProjectAnalysisResultsProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Project Analysis Results</CardTitle>
          <CardDescription>Review the AI-powered analysis of your project requirements</CardDescription>
        </CardHeader>
        <CardContent>
          {results ? (
            <div className="space-y-4">
              <p>
                <strong>Project Name:</strong> {projectData.name}
              </p>
              <p>
                <strong>Project Description:</strong> {projectData.description}
              </p>
              <p>
                <strong>AI Analysis:</strong> {results.data}
              </p>
            </div>
          ) : (
            <p>No analysis results available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

