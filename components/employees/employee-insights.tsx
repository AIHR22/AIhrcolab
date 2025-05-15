"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EmployeeInsightsProps {
  employee: any
}

export function EmployeeInsights({ employee }: EmployeeInsightsProps) {
  const [insights, setInsights] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const generateInsights = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/ai/employee-insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ employeeData: employee }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate insights")
      }

      const text = await response.text()
      setInsights(text)
    } catch (error) {
      console.error("Error generating insights:", error)
      toast({
        title: "Error",
        description: "Failed to generate insights",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-Powered Insights</CardTitle>
        <CardDescription>Generate personalized insights and recommendations for this employee</CardDescription>
      </CardHeader>
      <CardContent>
        {insights ? (
          <div className="whitespace-pre-wrap">{insights}</div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <p className="mb-4 text-center text-muted-foreground">
              Click the button below to generate AI-powered insights for this employee
            </p>
            <Button onClick={generateInsights} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Insights...
                </>
              ) : (
                "Generate Insights"
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

