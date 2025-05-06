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
import { Lightbulb, AlertTriangle, ArrowLeft } from "lucide-react" // Added ArrowLeft
import { format } from 'date-fns'
import Link from 'next/link' // Added Link

// --- Type Definitions --- 
interface Skill {
  id: string;
  name: string;
}

interface EmployeeSkill {
  skill_id: string;
  proficiency_level: number;
  skills: Skill | null;
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  salary: number | null;
  employee_skills: EmployeeSkill[];
}

interface RequiredSkill {
  skill_id: string;
  required_proficiency: number;
  headcount_needed: number;
}

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

// Base analysis data type
interface ProjectAnalysisBaseData {
  projectDetails: any; // Replace 'any' with a specific Project type if available
  skillAnalysis: SkillAnalysisItem[];
  overallGap: number;
  budgetAnalysis: BudgetAnalysisResult;
  timelineAnalysis: { feasible: boolean; details: string };
  profitabilityAnalysis: { score: number; details: string };
}

// Simulation result type
interface SimulationResult extends Omit<ProjectAnalysisBaseData, 'projectDetails'> {
  attritionRate: number;
  growthRate: number;
}

export default function ProjectAnalysisDetailPage() {
  const params = useParams()
  const projectId = params.id as string

  const [analysisData, setAnalysisData] = useState<ProjectAnalysisBaseData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State for What-If Simulator
  const [attritionRate, setAttritionRate] = useState<number>(5) 
  const [growthRate, setGrowthRate] = useState<number>(3) 
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationError, setSimulationError] = useState<string | null>(null)

  useEffect(() => {
    if (!projectId) {
      setError("Project ID not found in URL.")
      setIsLoading(false)
      return
    }

    const loadAnalysisData = async () => {
      setIsLoading(true)
      setError(null)
      setAnalysisData(null) // Clear previous data
      try {
        // Type the response expected from the service
        const data: ProjectAnalysisBaseData = await workforcePlanningService.getProjectAnalysisData(projectId)
        setAnalysisData(data)
      } catch (err: any) {
        console.error(`Failed to fetch analysis data for project ${projectId}:`, err)
        setError(err.message || `Failed to load analysis data. Please try again later.`)
        setAnalysisData(null)
      } finally {
        setIsLoading(false)
      }
    }
    loadAnalysisData()
  }, [projectId])

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A'
    try {
      // Ensure the date string is treated correctly, potentially handling timezone issues if necessary
      // Adding 'T00:00:00' can help standardize if only date part is expected
      return format(new Date(`${dateString}T00:00:00`), 'MMM dd, yyyy') 
    } catch {
      console.warn(`Invalid date format encountered: ${dateString}`)
      return 'Invalid Date'
    }
  }

  const formatCurrency = (amount: number | null | undefined): string => {
     if (amount == null) return 'N/A'
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }

  const handleRunSimulation = async () => {
    if (!projectId) return;
    setIsSimulating(true)
    setSimulationError(null)
    setSimulationResult(null) 
    try {
      console.log(`Running simulation for project ${projectId} with Attrition: ${attritionRate}%, Growth: ${growthRate}%`);
      const response = await fetch('/api/workforce-planning/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, attritionRate, growthRate })
      })
      if (!response.ok) {
        let errorMsg = 'Simulation failed.';
        try {
          const errorData = await response.json()
          errorMsg = errorData.message || errorMsg
        } catch (e) { /* Ignore parsing error */ }
        throw new Error(errorMsg)
      }
      const result: SimulationResult = await response.json()
      setSimulationResult(result)
    } catch (err: any) {
      console.error("Simulation error:", err)
      setSimulationError(err.message || "An unexpected error occurred during simulation.")
    } finally {
      setIsSimulating(false)
    }
  }

  // Render loading state
  if (isLoading) {
    return <div className="container mx-auto p-4 text-center">Loading project analysis...</div>
  }

  // Render error state
  if (error) {
    return (
      <div className="container mx-auto p-4">
          <Link href="/dashboard/workforce/project-feasibility" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Project Feasibility List
            </Link>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Analysis</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Render if no analysis data is found (e.g., project ID invalid)
  if (!analysisData || !analysisData.projectDetails) {
    return (
       <div className="container mx-auto p-4">
         <Link href="/dashboard/workforce/project-feasibility" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
           <ArrowLeft className="mr-1 h-4 w-4" />
           Back to Project Feasibility List
         </Link>
         <Alert variant="default">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Project Not Found</AlertTitle>
            <AlertDescription>No analysis data found for this project ID.</AlertDescription>
          </Alert>
       </div>
    )
  }

  // Destructure base analysis data safely
  const { projectDetails, skillAnalysis, overallGap, budgetAnalysis, timelineAnalysis, profitabilityAnalysis } = analysisData

  return (
    <div className="container mx-auto p-4 space-y-6">
       <Link href="/dashboard/workforce/project-feasibility" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
         <ArrowLeft className="mr-1 h-4 w-4" />
         Back to Project Feasibility List
       </Link>
       
      {/* --- Project Header --- */}
      <div className="flex justify-between items-start flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-bold mb-1">{projectDetails.name || 'Project Analysis'}</h1>
          <p className="text-muted-foreground max-w-xl">{projectDetails.description || 'Detailed workforce analysis and feasibility simulation for this project.'}</p>
        </div>
        <Badge variant={projectDetails.status === 'Completed' ? 'outline' : 'default'}>{projectDetails.status || 'Unknown'}</Badge>
      </div>

      {/* --- Project Info Cards --- */}
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
              {formatCurrency(projectDetails.budget)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Baseline Overall Gap</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-lg font-semibold ${overallGap > 0 ? 'text-destructive' : 'text-green-600'}`}>
              {overallGap > 0 ? `${overallGap} Gaps Identified` : 'Sufficiently Staffed'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* --- Skill Gap Analysis Table --- */}
      <Card>
        <CardHeader>
          <CardTitle>Baseline Skill Gap Analysis</CardTitle>
          <CardDescription>Required skills vs available internal talent based on current data.</CardDescription>
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
              {skillAnalysis && skillAnalysis.length > 0 ? skillAnalysis.map((skill) => (
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
                    {projectDetails.required_skills?.length > 0 ? 'No matching employees found for required skills.' : 'No required skills defined for this project.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* --- What-If Simulator Section --- */}
      <Card>
        <CardHeader>
          <CardTitle>What-If Simulator</CardTitle>
          <CardDescription>Model the impact of workforce changes on project feasibility.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ... (Sliders and Button as before) ... */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
             <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="attrition-slider">Attrition Rate ({attritionRate}%)</Label>
                <Slider
                  id="attrition-slider"
                  min={0}
                  max={25} 
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
                  max={25} 
                  step={1}
                  value={[growthRate]}
                  onValueChange={(value) => setGrowthRate(value[0])}
                  disabled={isSimulating}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleRunSimulation} disabled={isSimulating || !projectId}>
                {isSimulating ? (
                    <>
                      <Skeleton className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      Simulating...
                    </>
                  ) : "Run Simulation"}
              </Button>
            </div>
          </div>

          {/* Simulation Results Area */}
          {isSimulating && (
            <div className="pt-4 text-center">
              <p className="text-muted-foreground">Running simulation, please wait...</p>
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
              {/* ... (Display cards for simulated Budget, Timeline, Gap as before) ... */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-muted/40">
                  <CardHeader><CardTitle className="text-base">Budget Feasibility</CardTitle></CardHeader>
                  <CardContent className="space-y-1 text-sm">
                     <div className="flex justify-between"><span>Est. Cost:</span><span>{formatCurrency(simulationResult.budgetAnalysis.estimatedCost)}</span></div>
                     <div className="flex justify-between"><span>Variance:</span><span className={simulationResult.budgetAnalysis.variance >= 0 ? 'text-green-600' : 'text-destructive'}>{simulationResult.budgetAnalysis.variance >= 0 ? formatCurrency(simulationResult.budgetAnalysis.variance) : `(${formatCurrency(Math.abs(simulationResult.budgetAnalysis.variance))})`}</span></div>
                    <p className={`font-medium ${simulationResult.budgetAnalysis.feasible ? 'text-green-600' : 'text-destructive'} pt-1`}>{simulationResult.budgetAnalysis.feasible ? '✅ Within Budget' : '❌ Over Budget'}</p>
                  </CardContent>
                </Card>
                 <Card className="bg-muted/40">
                  <CardHeader><CardTitle className="text-base">Timeline Feasibility</CardTitle></CardHeader>
                  <CardContent>
                    <p className={`font-medium ${simulationResult.timelineAnalysis.feasible ? 'text-green-600' : 'text-destructive'}`}>{simulationResult.timelineAnalysis.feasible ? '✅ On Track' : '❌ At Risk'}</p>
                    <p className="text-xs text-muted-foreground pt-1">{simulationResult.timelineAnalysis.details}</p>
                  </CardContent>
                </Card>
                 <Card className="bg-muted/40">
                  <CardHeader><CardTitle className="text-base">Overall Skill Gap</CardTitle></CardHeader>
                  <CardContent>
                    <p className={`font-medium ${simulationResult.overallGap > 0 ? 'text-destructive' : 'text-green-600'}`}>{simulationResult.overallGap > 0 ? `${simulationResult.overallGap} Gaps` : 'Sufficiently Staffed'}</p>
                  </CardContent>
                </Card>
              </div>
              {/* Optional: Display simulated skill gap table here */}
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- Recommendations Section --- */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>Suggested actions based on skill gaps and feasibility.</CardDescription>
        </CardHeader>
        <CardContent>
           <Alert variant="default">
             <Lightbulb className="h-4 w-4" />
             <AlertTitle>AI Assistance</AlertTitle>
             <AlertDescription>
               AI-powered recommendations (hire/train/redistribute) based on the baseline or simulated analysis will appear here soon.
             </AlertDescription>
           </Alert>
        </CardContent>
      </Card>

    </div>
  )
} 