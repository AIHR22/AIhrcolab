"use client"

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { workforcePlanningService } from '@/lib/services/workforce-planning-service'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Lightbulb, AlertTriangle } from "lucide-react"
import { format } from 'date-fns'

// Define types matching the analysis data structure
interface ProjectDetails { /* ... structure from service ... */ }
interface SkillAnalysisItem { 
  skillId: string; 
  skillName: string; 
  requiredProficiency: number; 
  headcountNeeded: number;
  qualifiedEmployees: { id: string; name: string }[]; 
  gap: number;
}
interface BudgetAnalysisResult {
  feasible: boolean;
  estimatedCost: number;
  budget: number;
  variance: number;
  details: string;
}
interface ProjectAnalysisData {
  projectDetails: any 
  skillAnalysis: SkillAnalysisItem[]
  overallGap: number
  budgetAnalysis: BudgetAnalysisResult
  timelineAnalysis: { feasible: boolean; details: string }
  profitabilityAnalysis: { score: number; details: string }
  aiRecommendations: {
    assessment: string;
    recommendations: string[];
    risk_factors: string[];
    cost_analysis: {
      hiring_costs: number;
      training_costs: number;
      timeline_impact_days: number;
    };
    mitigation_strategies?: string[];
    department_impact?: {
      most_affected: string[];
      impact_description: string;
    };
  }
}

// Type for Simulation Results (can be similar to ProjectAnalysisData)
interface SimulationResult extends Omit<ProjectAnalysisData, 'projectDetails'> {
  attritionRate: number;
  growthRate: number;
  aiRecommendations: {
    assessment: string;
    recommendations: string[];
    risk_factors: string[];
    mitigation_strategies?: string[];
    department_impact?: {
      most_affected: string[];
      impact_description: string;
    };
    cost_analysis: {
      hiring_costs: number;
      training_costs: number;
      timeline_impact_days: number;
    };
  };
}

export default function ProjectAnalysisPage() {
  const params = useParams()
  const projectId = params.id as string

  const [analysisData, setAnalysisData] = useState<ProjectAnalysisData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State for What-If Simulator
  const [attritionRate, setAttritionRate] = useState<number>(5) // Default 5%
  const [growthRate, setGrowthRate] = useState<number>(3) // Default 3%
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationError, setSimulationError] = useState<string | null>(null)

  useEffect(() => {
    if (!projectId) return

    const loadAnalysisData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await workforcePlanningService.getProjectAnalysisData(projectId)
        setAnalysisData(data)
      } catch (err) {
        console.error(`Failed to fetch analysis data for project ${projectId}:`, err)
        setError(`Failed to load analysis data. Please try again later. Project ID: ${projectId}`)
        setAnalysisData(null)
      } finally {
        setIsLoading(false)
      }
    }
    loadAnalysisData()
  }, [projectId])

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A'
    try {
      return format(new Date(dateString), 'MMM dd, yyyy')
    } catch {
      return 'Invalid Date'
    }
  }

  // Handler for running the simulation
  const handleRunSimulation = async () => {
    setIsSimulating(true)
    setSimulationError(null)
    setSimulationResult(null) // Clear previous results
    try {
      // Instead of making an API call, we'll simulate the results based on the current data
      // and the attrition/growth inputs
      if (!analysisData) {
        throw new Error("Cannot run simulation: Missing baseline analysis data")
      }

      // Apply attrition and growth rates to the current skill analysis
      const simulatedSkillAnalysis = analysisData.skillAnalysis.map(skill => {
        // Calculate attrition impact on available employees (reducing available staff)
        const attritionImpact = Math.ceil(skill.qualifiedEmployees.length * (attritionRate / 100))
        
        // Calculate growth impact on required headcount (increasing needs)
        const growthImpact = Math.ceil(skill.headcountNeeded * (growthRate / 100))
        
        // Calculate new available resources (reduced by attrition)
        const newAvailable = Math.max(0, skill.qualifiedEmployees.length - attritionImpact)
        
        // Calculate new required headcount (increased by growth)
        const newRequired = skill.headcountNeeded + growthImpact
        
        // Calculate new gap
        const newGap = Math.max(0, newRequired - newAvailable)
        
        return {
          ...skill,
          headcountNeeded: newRequired,
          qualifiedEmployees: skill.qualifiedEmployees.slice(0, newAvailable),
          gap: newGap
        }
      })
      
      // Calculate new overall gap
      const simulatedOverallGap = simulatedSkillAnalysis.reduce(
        (sum, skill) => sum + Math.max(0, skill.gap), 
        0
      )
      
      // Calculate budget impact
      const baseCost = analysisData.budgetAnalysis.estimatedCost
      // Higher attrition increases cost due to turnover costs
      const attritionCostFactor = 1 + (attritionRate / 100) * 0.5 // 5% attrition = 2.5% cost increase
      // Higher growth increases cost proportionally
      const growthCostFactor = 1 + (growthRate / 100)
      
      const simulatedCost = baseCost * attritionCostFactor * growthCostFactor
      const simulatedBudget = analysisData.budgetAnalysis.budget
      const simulatedVariance = simulatedBudget - simulatedCost
      
      // Calculate timeline impact
      // More gap and higher attrition both slow down timeline
      const baselineDuration = Math.ceil(
        (new Date(analysisData.projectDetails.end_date).getTime() - 
         new Date(analysisData.projectDetails.start_date).getTime()) / 
        (1000 * 60 * 60 * 24)
      )
      
      // Hiring delay impact (days per new hire needed)
      const hiringDelayPerResource = 15
      const additionalGap = Math.max(0, simulatedOverallGap - analysisData.overallGap)
      const hiringDelayDays = additionalGap * hiringDelayPerResource
      
      // Attrition causes knowledge transfer delays
      const attritionDelayDays = baselineDuration * (attritionRate / 100) * 0.2 // 5% attrition = 1% timeline increase

      // Knowledge transfer effectiveness is reduced with higher growth
      const growthDelayDays = baselineDuration * (growthRate / 100) * 0.1 // 5% growth = 0.5% timeline increase
      
      const totalDelayDays = Math.round(hiringDelayDays + attritionDelayDays + growthDelayDays)
      const simulatedDuration = baselineDuration + totalDelayDays
      
      // Prepare AI recommendations for the simulated scenario
      const simulatedRecommendations = {
        assessment: `Simulation with ${attritionRate}% attrition and ${growthRate}% growth shows ${simulatedOverallGap} resource gaps and ${totalDelayDays} days potential delay.`,
        recommendations: [
          `Develop retention programs to reduce ${attritionRate}% attrition rate`,
          `Plan hiring pipeline for ${additionalGap} additional resources due to growth`,
          `Adjust timeline expectations by ${totalDelayDays} days`
        ],
        risk_factors: [
          `Attrition risk could lead to ${Math.round(attritionDelayDays)} days delay`,
          `Growth demand of ${growthRate}% increases resource requirements by ${simulatedSkillAnalysis.reduce((sum, s) => sum + Math.ceil(s.headcountNeeded * (growthRate / 100)), 0)} headcount`,
          `Budget variance of ${formatCurrency(simulatedVariance)} may require financial adjustment`
        ],
        cost_analysis: {
          hiring_costs: simulatedOverallGap * 85000, // Average cost per new hire
          training_costs: simulatedOverallGap * 15000, // Average training cost per resource
          timeline_impact_days: totalDelayDays
        },
        mitigation_strategies: [
          "Implement phased approach to manage resource onboarding",
          "Create knowledge transfer program to minimize attrition impact",
          "Develop contingency funds to address budget variance"
        ],
        department_impact: {
          most_affected: Array.from(new Set(
            simulatedSkillAnalysis
              .filter(s => s.gap > 0)
              .map(s => s.skillName.split(' ')[0])
          )).slice(0, 3),
          impact_description: `Departments will experience resource constraints due to ${attritionRate}% attrition and ${growthRate}% growth.`
        }
      }

      // Construct the simulation result
      const result: SimulationResult = {
        skillAnalysis: simulatedSkillAnalysis,
        overallGap: simulatedOverallGap,
        budgetAnalysis: {
          feasible: simulatedVariance >= 0,
          estimatedCost: simulatedCost,
          budget: simulatedBudget,
          variance: simulatedVariance,
          details: simulatedVariance >= 0 
            ? `Simulation remains within budget with ${formatCurrency(simulatedVariance)} remaining.`
            : `Simulation exceeds budget by ${formatCurrency(Math.abs(simulatedVariance))}.`
        },
        timelineAnalysis: {
          feasible: totalDelayDays < baselineDuration * 0.2, // Feasible if delay is less than 20% of baseline
          details: totalDelayDays < baselineDuration * 0.2
            ? `Expected delay of ${totalDelayDays} days (${Math.round(totalDelayDays/baselineDuration*100)}% of timeline) is manageable.`
            : `Expected delay of ${totalDelayDays} days (${Math.round(totalDelayDays/baselineDuration*100)}% of timeline) is significant.`
        },
        profitabilityAnalysis: {
          score: Math.max(0, Math.min(1, (analysisData.profitabilityAnalysis.score - ((attritionRate + growthRate) / 200)))),
          details: `Profitability is impacted by attrition and growth factors.`
        },
        attritionRate,
        growthRate,
        aiRecommendations: simulatedRecommendations
      };

      setSimulationResult(result);
      setIsSimulating(false);
    } catch (error: any) {
      console.error("Error in simulation:", error);
      setSimulationError(error.message || "Failed to run simulation");
      setIsSimulating(false);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-4 text-center">Loading project analysis...</div>
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-md">
          {error}
        </div>
      </div>
    )
  }

  if (!analysisData) {
    return <div className="container mx-auto p-4 text-center">No analysis data found for this project.</div>
  }

  const { projectDetails, skillAnalysis, overallGap, budgetAnalysis, timelineAnalysis, profitabilityAnalysis, aiRecommendations } = analysisData

  // Helper to format currency
  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Project Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-1">{projectDetails.name || 'Project Analysis'}</h1>
          <p className="text-muted-foreground">{projectDetails.description || 'Detailed workforce analysis'}</p>
        </div>
        <Badge variant={projectDetails.status === 'Completed' ? 'outline' : 'default'}>{projectDetails.status || 'Unknown'}</Badge>
      </div>

      {/* Project Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {formatDate(projectDetails.start_date)} - {formatDate(projectDetails.end_date)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              ${projectDetails.budget?.toLocaleString() || 'N/A'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Overall Skill Gap</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-lg font-semibold ${overallGap > 0 ? 'text-destructive' : 'text-green-600'}`}>
              {overallGap > 0 ? `${overallGap} Gaps Identified` : 'Sufficiently Staffed'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Skill Gap Analysis Table */}
      <Card>
        <CardHeader>
          <CardTitle>Skill Gap Analysis</CardTitle>
          <CardDescription>Required skills vs available internal talent.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Skill</TableHead>
                <TableHead>Required Prof.</TableHead>
                <TableHead className="text-center">Needed</TableHead>
                <TableHead className="text-center">Available</TableHead>
                <TableHead className="text-right">Status (Gap)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {skillAnalysis.length > 0 ? skillAnalysis.map((skill) => (
                <TableRow key={skill.skillId}>
                  <TableCell className="font-medium">{skill.skillName}</TableCell>
                  <TableCell>{skill.requiredProficiency}</TableCell>
                  <TableCell className="text-center">{skill.headcountNeeded}</TableCell>
                  <TableCell className="text-center">{skill.qualifiedEmployees.length}</TableCell>
                  <TableCell className="text-right">
                    {skill.gap > 0 ? (
                      <Badge variant="destructive">Shortfall ({skill.gap})</Badge>
                    ) : skill.gap < 0 ? (
                      <Badge variant="secondary">Surplus ({-skill.gap})</Badge>
                    ) : (
                      <Badge variant="default">Met</Badge> 
                    )}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No required skills defined for this project.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Feasibility & Recommendations (Placeholders) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Budget Feasibility</CardTitle>
            <CardDescription>Estimated cost vs allocated budget.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Allocated Budget:</span>
              <span className="font-medium">{formatCurrency(budgetAnalysis.budget)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Estimated Cost:</span>
              <span className="font-medium">{formatCurrency(budgetAnalysis.estimatedCost)}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Variance:</span>
              <span className={`font-semibold ${budgetAnalysis.variance >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                {budgetAnalysis.variance >= 0 ? formatCurrency(budgetAnalysis.variance) : `(${formatCurrency(Math.abs(budgetAnalysis.variance))})`}
              </span>
            </div>
            <p className={`text-sm ${budgetAnalysis.feasible ? 'text-green-600' : 'text-destructive'} pt-2`}>
              {budgetAnalysis.feasible ? '✅ Within Budget' : '❌ Over Budget'}
            </p>
            <p className="text-xs text-muted-foreground pt-1">{budgetAnalysis.details}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Timeline Feasibility</CardTitle>
             <CardDescription>Current projection vs target dates.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className={timelineAnalysis.feasible ? 'text-green-600' : 'text-destructive'}>
              {timelineAnalysis.feasible ? 'On Track' : 'At Risk'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{timelineAnalysis.details}</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>Profitability Analysis</CardTitle>
            <CardDescription>Estimated return on investment.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Score: {profitabilityAnalysis.score}</p> 
            <p className="text-sm text-muted-foreground mt-1">{profitabilityAnalysis.details}</p>
          </CardContent>
        </Card>
      </div>

      {/* --- What-If Simulator Section --- */}
      <Card>
        <CardHeader>
          <CardTitle>What-If Simulator</CardTitle>
          <CardDescription>Model the impact of workforce changes on project feasibility.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            {/* Sliders */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="attrition-slider">Attrition Rate ({attritionRate}%)</Label>
                <Slider
                  id="attrition-slider"
                  min={0}
                  max={25} // Example max rate
                  step={1}
                  value={[attritionRate]}
                  onValueChange={(value) => setAttritionRate(value[0])}
                  disabled={isSimulating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="growth-slider">Growth Rate ({growthRate}%)</Label>
                <Slider
                  id="growth-slider"
                  min={0}
                  max={25} // Example max rate
                  step={1}
                  value={[growthRate]}
                  onValueChange={(value) => setGrowthRate(value[0])}
                  disabled={isSimulating}
                />
              </div>
            </div>
            {/* Run Button */}
            <div className="flex justify-end">
              <Button onClick={handleRunSimulation} disabled={isSimulating}>
                {isSimulating ? "Simulating..." : "Run Simulation"}
              </Button>
            </div>
          </div>

          {/* Simulation Results Area */}
          {isSimulating && (
            <div className="pt-4 text-center">
              <p className="text-muted-foreground">Running simulation, please wait...</p>
              {/* Optional: Add a visual loading indicator */}
            </div>
          )}
          {simulationError && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Simulation Error</AlertTitle>
              <AlertDescription>{simulationError}</AlertDescription>
            </Alert>
          )}
          {simulationResult && (
            <div className="mt-6 pt-6 border-t space-y-4">
              <h3 className="text-lg font-semibold">Simulation Results (Attrition: {simulationResult.attritionRate}%, Growth: {simulationResult.growthRate}%)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Simulated Budget Feasibility */}
                <Card className="bg-muted/40">
                  <CardHeader>
                    <CardTitle className="text-base">Budget Feasibility</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                     <div className="flex justify-between">
                      <span>Est. Cost:</span>
                      <span>{formatCurrency(simulationResult.budgetAnalysis.estimatedCost)}</span>
                    </div>
                     <div className="flex justify-between">
                      <span>Variance:</span>
                      <span className={simulationResult.budgetAnalysis.variance >= 0 ? 'text-green-600' : 'text-destructive'}>
                        {simulationResult.budgetAnalysis.variance >= 0 ? formatCurrency(simulationResult.budgetAnalysis.variance) : `(${formatCurrency(Math.abs(simulationResult.budgetAnalysis.variance))})`}
                       </span>
                    </div>
                    <p className={`font-medium ${simulationResult.budgetAnalysis.feasible ? 'text-green-600' : 'text-destructive'} pt-1`}>
                       {simulationResult.budgetAnalysis.feasible ? '✅ Within Budget' : '❌ Over Budget'}
                    </p>
                  </CardContent>
                </Card>
                {/* Simulated Timeline Feasibility */}
                 <Card className="bg-muted/40">
                  <CardHeader>
                    <CardTitle className="text-base">Timeline Feasibility</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`font-medium ${simulationResult.timelineAnalysis.feasible ? 'text-green-600' : 'text-destructive'}`}>
                       {simulationResult.timelineAnalysis.feasible ? '✅ On Track' : '❌ At Risk'}
                    </p>
                    <p className="text-xs text-muted-foreground pt-1">{simulationResult.timelineAnalysis.details}</p>
                  </CardContent>
                </Card>
                {/* Simulated Overall Gap */}
                 <Card className="bg-muted/40">
                  <CardHeader>
                    <CardTitle className="text-base">Overall Skill Gap</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`font-medium ${simulationResult.overallGap > 0 ? 'text-destructive' : 'text-green-600'}`}>
                      {simulationResult.overallGap > 0 ? `${simulationResult.overallGap} Gaps` : 'Sufficiently Staffed'}
                    </p>
                  </CardContent>
                </Card>
              </div>
              {/* TODO: Add simulated skill gap table if needed */}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suggestions: Hire/Train/Redistribute */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>Suggested actions based on skill gaps and feasibility.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Unable to load recommendations</AlertDescription>
            </Alert>
          ) : aiRecommendations ? (
            <div className="space-y-6">
              {/* Assessment */}
              <div>
                <h3 className="text-base font-medium mb-2">Assessment</h3>
                <p className="text-sm text-muted-foreground">
                  {aiRecommendations.assessment || 'No assessment available'}
                </p>
              </div>
              
              {/* Recommendations */}
              <div>
                <h3 className="text-base font-medium mb-2">Actionable Recommendations</h3>
                {aiRecommendations.recommendations && 
                 aiRecommendations.recommendations.length > 0 ? (
                  <ul className="space-y-1 text-sm list-disc pl-5">
                    {aiRecommendations.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No recommendations available</p>
                )}
              </div>
              
              {/* Risk Factors */}
              <div>
                <h3 className="text-base font-medium mb-2">Risk Factors</h3>
                {aiRecommendations.risk_factors && 
                 aiRecommendations.risk_factors.length > 0 ? (
                  <ul className="space-y-1 text-sm list-disc pl-5">
                    {aiRecommendations.risk_factors.map((risk, index) => (
                      <li key={index} className="text-amber-600 dark:text-amber-500">{risk}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No risk factors identified</p>
                )}
              </div>
              
              {/* Mitigation Strategies */}
              {aiRecommendations.mitigation_strategies && 
               aiRecommendations.mitigation_strategies.length > 0 && (
                <div>
                  <h3 className="text-base font-medium mb-2">Mitigation Strategies</h3>
                  <ul className="space-y-1 text-sm list-disc pl-5">
                    {aiRecommendations.mitigation_strategies.map((strategy, index) => (
                      <li key={index} className="text-blue-600 dark:text-blue-400">{strategy}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Department Impact */}
              {aiRecommendations.department_impact && (
                <div>
                  <h3 className="text-base font-medium mb-2">Department Impact</h3>
                  <div className="text-sm">
                    {aiRecommendations.department_impact.most_affected && 
                     aiRecommendations.department_impact.most_affected.length > 0 && (
                      <div className="mb-2">
                        <p className="font-medium">Most affected departments:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {aiRecommendations.department_impact.most_affected.map((dept, index) => (
                            <Badge key={index} variant="outline">{dept}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="text-muted-foreground">
                      {aiRecommendations.department_impact.impact_description || 'No impact description available'}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Cost Analysis */}
              <div>
                <h3 className="text-base font-medium mb-2">Cost Impact</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Hiring Costs</p>
                    <p className="font-medium">
                      {formatCurrency(aiRecommendations.cost_analysis?.hiring_costs || 0)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Training Costs</p>
                    <p className="font-medium">
                      {formatCurrency(aiRecommendations.cost_analysis?.training_costs || 0)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Timeline Impact</p>
                    <p className="font-medium">
                      {aiRecommendations.cost_analysis?.timeline_impact_days || 0} days
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertTitle>No AI recommendations</AlertTitle>
              <AlertDescription>
                Run a project feasibility analysis to get AI-powered recommendations.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

    </div>
  )
} 