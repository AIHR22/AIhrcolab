"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
// Import the chart components
import { HeadcountChart } from "@/components/charts/headcount-chart"
import { DepartmentDistribution } from "@/components/charts/department-distribution"
import { AttritionChart } from "@/components/charts/attrition-chart"
import { HiringRecommendations } from "@/components/projects/hiring-recommendations" // Corrected path
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Users, TrendingUp, TrendingDown, Target, DollarSign, BrainCircuit, Filter } from "lucide-react"
import {
  getDepartmentForecast, 
  optimizeWorkforceCost, 
  predictAttrition, 
  reallocateWorkforce,
  ForecastResult,
  CostOptimizationResult,
  AttritionPredictionResult,
  ReallocationResult
} from "@/lib/api/workforce"
import { workforcePlanningService } from '@/lib/services/workforce-planning-service' // Import our service
import { DepartmentOverview } from "@/components/workforce/department-overview" // Import our component
// Assuming mock data might be in a different location or not used if API works
// import { MOCK_DATA } from "@/data/mock-workforce-data"; 

// Define types for state data, using imported result types
type HeadcountProjection = { month: string; headcount: number };
type DepartmentCostData = { department_id: string; department_name: string; current_cost: number; optimized_cost: number; potential_savings: number };
type AttritionPrediction = { month: string; rate: number; predicted_attrition_count: number };
type HiringRecommendation = ReallocationResult['recommendations'][number];

// Add type for department overview data
interface DepartmentOverviewData {
  id: string
  name: string
  currentHeadcount: number
  requiredHeadcount: number
}

// No longer need placeholder chart component as we have real chart components now

export default function WorkforcePlanningPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<"6months" | "12months" | "24months">("12months");
  const [departmentId, setDepartmentId] = useState<string | undefined>(undefined); // For department filter

  // State for API data
  const [headcountData, setHeadcountData] = useState<HeadcountProjection[]>([]);
  const [departmentData, setDepartmentData] = useState<DepartmentCostData[]>([]);
  const [attritionData, setAttritionData] = useState<AttritionPrediction[]>([]);
  const [hiringRecommendations, setHiringRecommendations] = useState<HiringRecommendation[]>([]);
  const [attritionRate, setAttritionRate] = useState<number>(0); // Overall average attrition
  const [currentHeadcount, setCurrentHeadcount] = useState<number>(0);
  const [currentTotalCost, setCurrentTotalCost] = useState<number>(0);
  const [departmentOverviewData, setDepartmentOverviewData] = useState<DepartmentOverviewData[]>([]) // <<< Add state
  const [totalDepartments, setTotalDepartments] = useState<number>(0); // State for total departments count

  // Fetch data on component mount and when timeframe or department changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      let apiErrorMessages: string[] = [];
      console.log(`Fetching data for timeframe: ${timeframe}, department: ${departmentId || 'Overall'}`);

      const months = timeframe === "6months" ? 6 : timeframe === "12months" ? 12 : 24;

      // Use Promise.allSettled to fetch all data concurrently and handle individual errors
      const results = await Promise.allSettled([
        getDepartmentForecast({ months, department_id: departmentId }),
        optimizeWorkforceCost({ time_frame: "monthly", include_outsourcing: true, department_id: departmentId }),
        predictAttrition({ include_factors: true, months, department_id: departmentId }),
        reallocateWorkforce({ target_utilization: 0.85, department_id: departmentId }),
        workforcePlanningService.getDepartmentOverview(), // <<< Fetch overview data
        fetch('/api/workforce/dashboard').then(res => res.json()) // Fetch dashboard data including total departments
      ]);

      // Process Forecast
      if (results[0].status === 'fulfilled') {
        const forecastResponse = results[0].value;
        const adaptedProjections = forecastResponse.projections.map(p => ({
          month: p.month,
          headcount: p.headcount ?? p.projected_headcount ?? 0
        }));
        setHeadcountData(adaptedProjections);
        setCurrentHeadcount(forecastResponse.current_headcount || 0);
        setAttritionRate(forecastResponse.attrition_rate / 100 || 0); 
      } else {
        console.warn("API Error fetching forecast data:", results[0].reason);
        apiErrorMessages.push('Forecast');
        setHeadcountData([]); setCurrentHeadcount(0); setAttritionRate(0);
      }

      // Process Cost Optimization
      if (results[1].status === 'fulfilled') {
        const costResponse = results[1].value;
        setDepartmentData(costResponse.department_analysis || []);
        const totalCost = (costResponse.department_analysis || []).reduce((sum, dept) => sum + (dept.current_cost || 0), 0);
        setCurrentTotalCost(totalCost);
      } else {
        console.warn("API Error fetching cost data:", results[1].reason);
        apiErrorMessages.push('Cost Optimization');
        setDepartmentData([]); setCurrentTotalCost(0);
      }

      // Process Attrition Prediction
      if (results[2].status === 'fulfilled') {
        const attritionResponse = results[2].value;
        setAttritionData(attritionResponse.monthly_predictions || []);
      } else {
        console.warn("API Error fetching attrition data:", results[2].reason);
        apiErrorMessages.push('Attrition Prediction');
        setAttritionData([]);
      }

      // Process Reallocation
      if (results[3].status === 'fulfilled') {
        const reallocationResponse = results[3].value;
        setHiringRecommendations(reallocationResponse.recommendations || []);
      } else {
        console.warn("API Error fetching reallocation data:", results[3].reason);
        apiErrorMessages.push('Reallocation');
        setHiringRecommendations([]);
      }

      // Process Department Overview
      if (results[4].status === 'fulfilled') {
        setDepartmentOverviewData(results[4].value); // <<< Set state
      } else {
        console.warn("API Error fetching department overview data:", results[4].reason);
        apiErrorMessages.push('Department Overview');
        setDepartmentOverviewData([]); // <<< Clear state on error
      }

      // Process Dashboard Data (including total departments)
      if (results[5].status === 'fulfilled') {
        const dashboardData = results[5].value;
        setTotalDepartments(dashboardData.total_departments || 0);
        // We can also use other dashboard data if needed
      } else {
        console.warn("API Error fetching dashboard data:", results[5].reason);
        apiErrorMessages.push('Dashboard');
        // Keep using departmentData.length as fallback
      }

      if (apiErrorMessages.length > 0) {
        setError(`Failed to load: ${apiErrorMessages.join(', ')}. Some components might be missing data.`);
      } else {
        setError(null); 
      }

      setLoading(false);
    };

    fetchData();
  }, [timeframe, departmentId]); 

  // Calculate KPIs - ensure data exists before calculating
  const kpis = useMemo(() => {
    const projectedEndHeadcount = headcountData.length > 0 ? headcountData[headcountData.length - 1]?.headcount : currentHeadcount;
    const headcountChange = projectedEndHeadcount - currentHeadcount;
    const avgAttritionPercent = (attritionRate * 100).toFixed(1) + '%';
    const totalCostFormatted = `$${(currentTotalCost / 1000000).toFixed(1)}M`; // Assuming cost is in dollars

    return {
      currentHeadcount: currentHeadcount || 0,
      headcountChange: headcountChange || 0,
      avgAttrition: avgAttritionPercent,
      totalDepartments: totalDepartments || 0, // Use the totalDepartments state from our API
      totalCost: totalCostFormatted
    };
  }, [headcountData, attritionRate, currentHeadcount, currentTotalCost, totalDepartments]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
        <h1 className="text-3xl font-bold">Workforce Planning Dashboard</h1>
        <div className="flex items-center space-x-2">
           {/* Department Filter Placeholder - Needs implementation to fetch departments */}
           {/* <Select onValueChange={setDepartmentId} defaultValue="all">
             <SelectTrigger className="w-[180px]">
               <Filter className="mr-2 h-4 w-4" />
               <SelectValue placeholder="Filter Department" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="all">Overall Company</SelectItem>
               {fetchedDepartments.map(dept => (
                 <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
               ))}
             </SelectContent>
           </Select> */}
          <Select onValueChange={(value) => setTimeframe(value as typeof timeframe)} defaultValue={timeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6months">Next 6 Months</SelectItem>
              <SelectItem value="12months">Next 12 Months</SelectItem>
              <SelectItem value="24months">Next 24 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => router.push('/dashboard/workforce/project-feasibility')}>
            <BrainCircuit className="mr-2 h-4 w-4" /> Project Feasibility
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Data Fetching Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Headcount</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{kpis.currentHeadcount}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projected Change</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold text-green-500">{kpis.headcountChange > 0 ? `+${kpis.headcountChange}` : kpis.headcountChange}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Attrition Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{kpis.avgAttrition}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
             <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{kpis.totalDepartments}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">{kpis.totalCost}</div>}
          </CardContent>
        </Card>
      </div>

      {/* Feature Shortcuts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => router.push("/workforce-planning/cross-org-scenarios")}>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle>Cross-Organization Scenario Planning</CardTitle>
            <BrainCircuit className="h-5 w-5 ml-2 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Model company-wide growth scenarios and connect revenue projections to headcount needs by department and skill.
            </p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => router.push("/workforce-planning/projects")}>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle>Project Feasibility Analysis</CardTitle>
            <Target className="h-5 w-5 ml-2 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Analyze skill gaps, resource availability, and budget requirements for specific projects.
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Main Content Area with Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="hiring">Hiring Recommendations</TabsTrigger>
          {/* Add more tabs as needed */}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Department Overview Card */}
          <DepartmentOverview data={departmentOverviewData} isLoading={loading} />
          
          {/* Existing Overview Layout */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Headcount Forecast ({timeframe})</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                {loading ? <Skeleton className="h-[350px] w-full" /> : <HeadcountChart data={headcountData} />}
              </CardContent>
            </Card>
            <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
                 <CardDescription>
                  Current cost distribution across departments.
                </CardDescription>
          </CardHeader>
          <CardContent>
                 {loading ? <Skeleton className="h-[350px] w-full" /> : <DepartmentDistribution data={departmentData} />}
          </CardContent>
        </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
                <CardTitle>Attrition Rate Forecast ({timeframe})</CardTitle>
                <CardDescription>
                  Projected employee attrition over time.
                </CardDescription>
          </CardHeader>
              <CardContent className="pl-2">
                {loading ? <Skeleton className="h-[300px] w-full" /> : <AttritionChart data={attritionData} />}
          </CardContent>
        </Card>
      </div>
        </TabsContent>

        <TabsContent value="hiring" className="space-y-4">
      <Card>
        <CardHeader>
              <CardTitle>Hiring & Reallocation Recommendations</CardTitle>
              <CardDescription>
                Suggestions based on skill gaps and employee utilization.
              </CardDescription>
        </CardHeader>
        <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
          </div>
               ) : (
                 // Pass the recommendations array directly to the data prop
                 <HiringRecommendations data={hiringRecommendations} /> 
              )}
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
