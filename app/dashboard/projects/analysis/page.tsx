"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, CheckCircle, Clock, DollarSign, FileText, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProjectAnalysisForm } from "@/components/projects/project-analysis-form"
import { SkillMatchingResults } from "@/components/projects/skill-matching-results"
import { CapacityAnalysisResults } from "@/components/projects/capacity-analysis-results"
import { RevenueEstimationResults } from "@/components/projects/revenue-estimation-results"
import { HiringRecommendations } from "@/components/projects/hiring-recommendations"

export default function ProjectAnalysisPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("project-info")

  const handleAnalysisSubmit = async (data: any) => {
    // In a real application, this would be an API call to the AI service
    setAnalysisData(data)
    setCurrentStep(2)
  }

  const handleAnalysisComplete = () => {
    setAnalysisComplete(true)
    setCurrentStep(3)
  }

  const handleApproveHiring = () => {
    // In a real application, this would trigger the hiring workflow
    router.push("/dashboard/projects/hiring-plan")
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Project Feasibility Analysis</h1>
        <p className="text-muted-foreground">Analyze project requirements and determine resource needs</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${currentStep >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            <FileText className="h-5 w-5" />
          </div>
          <div className={`mx-2 h-1 w-16 ${currentStep >= 2 ? "bg-primary" : "bg-muted"}`} />
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${currentStep >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            <Users className="h-5 w-5" />
          </div>
          <div className={`mx-2 h-1 w-16 ${currentStep >= 3 ? "bg-primary" : "bg-muted"}`} />
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${currentStep >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Analysis time: ~2 minutes</span>
        </div>
      </div>

      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
            <CardDescription>Enter project details to analyze feasibility and resource requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectAnalysisForm onSubmit={handleAnalysisSubmit} />
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>Review the AI-powered analysis of your project requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="skill-matching">Skill Matching</TabsTrigger>
                <TabsTrigger value="capacity-analysis">Capacity Analysis</TabsTrigger>
                <TabsTrigger value="revenue-estimation">Revenue Estimation</TabsTrigger>
                <TabsTrigger value="hiring-recommendations">Hiring Recommendations</TabsTrigger>
              </TabsList>
              <TabsContent value="skill-matching" className="space-y-4">
                <SkillMatchingResults data={analysisData} />
              </TabsContent>
              <TabsContent value="capacity-analysis" className="space-y-4">
                <CapacityAnalysisResults data={analysisData} />
              </TabsContent>
              <TabsContent value="revenue-estimation" className="space-y-4">
                <RevenueEstimationResults data={analysisData} />
              </TabsContent>
              <TabsContent value="hiring-recommendations" className="space-y-4">
                <HiringRecommendations data={analysisData} />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep(1)}>
              Back to Project Info
            </Button>
            <Button onClick={handleAnalysisComplete}>
              Complete Analysis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Complete</CardTitle>
            <CardDescription>Review the final recommendations and next steps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="rounded-lg border p-4">
                <h3 className="text-lg font-medium">Project Feasibility</h3>
                <div className="mt-2 flex items-center gap-2">
                  <div className="rounded-full bg-yellow-100 p-1.5 text-yellow-600">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Additional Resources Required</p>
                    <p className="text-sm text-muted-foreground">
                      This project requires additional resources beyond current capacity
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="text-lg font-medium">Hiring Recommendations</h3>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-blue-100 p-1.5 text-blue-600">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">2 Full-time Developers</p>
                        <p className="text-sm text-muted-foreground">React, Node.js, TypeScript</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">$180,000</p>
                      <p className="text-sm text-muted-foreground">Annual Cost</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-purple-100 p-1.5 text-purple-600">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">1 UX Designer (Freelance)</p>
                        <p className="text-sm text-muted-foreground">Figma, User Research</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">$45,000</p>
                      <p className="text-sm text-muted-foreground">Project Cost</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="text-lg font-medium">Financial Impact</h3>
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <DollarSign className="mx-auto h-5 w-5 text-muted-foreground" />
                    <p className="mt-1 text-2xl font-bold">$225,000</p>
                    <p className="text-xs text-muted-foreground">Total Hiring Cost</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <DollarSign className="mx-auto h-5 w-5 text-muted-foreground" />
                    <p className="mt-1 text-2xl font-bold">$850,000</p>
                    <p className="text-xs text-muted-foreground">Projected Revenue</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <DollarSign className="mx-auto h-5 w-5 text-green-500" />
                    <p className="mt-1 text-2xl font-bold text-green-500">$625,000</p>
                    <p className="text-xs text-muted-foreground">Projected Profit</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep(2)}>
              Review Analysis
            </Button>
            <div className="flex gap-2">
              <Button variant="outline">Save Report</Button>
              <Button onClick={handleApproveHiring}>Approve Hiring Plan</Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

