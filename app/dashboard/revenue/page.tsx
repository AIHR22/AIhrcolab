"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { DollarSign, TrendingUp, BarChart2, Download, RefreshCw, Calculator, Users, Briefcase, Loader2, Settings2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"

// Add type definitions
type ViewMode = "company-wide" | "project-based"
type TabOption = "current-view" | "project-view" | "comparison"
type ComparisonPeriod = "monthly" | "quarterly" | "yearly"
type ComparisonMetric = "revenue" | "growth" | "profitability"

interface Department {
  id: string;
  name: string;
  headcount?: number;
  revenue_per_employee?: number;
  total_revenue?: number;
}

interface DepartmentWithHeadcount extends Department {
  newHeadcount: number;
  impact?: number | null;
}

interface ProjectData {
  monthlyRevenue: number
  annualRevenue: number
  projectedRevenue: number
  growthRate: number
  departments: Department[]
  timeline: {
    month: string
    actual: number
    projected: number
  }[]
}

interface ProjectsDataMap {
  [key: string]: ProjectData
}

interface ComparisonDataPoint {
  period: string
  current: number
  previous: number
}

interface ComparisonMetricData {
  revenue: ComparisonDataPoint[]
  growth: ComparisonDataPoint[]
  profitability: ComparisonDataPoint[]
}

interface ComparisonDataMap {
  monthly: ComparisonMetricData
  quarterly: ComparisonMetricData
  yearly: ComparisonMetricData
}

interface SectionVisibility {
  metrics: boolean
  projectionModel: boolean
  revenueTrends: boolean
  profitabilitySimulator: boolean
  departmentRevenue: boolean
  projectMetrics: boolean
  departmentAllocation: boolean
  projectTimeline: boolean
  whatIfScenario: boolean
}

// Helper function to format currency
const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "$0";
  return `$${value.toLocaleString()}`;
}

// Helper function to format percentage
const formatPercentage = (value: number | null | undefined, decimals = 1) => {
  if (value === null || value === undefined) return "0.0%";
  return `${value.toFixed(decimals)}%`;
}

// Helper functions to safely access potentially undefined properties
const getHeadcount = (dept: Department): number => dept.headcount ?? 0;
const getTotalRevenue = (dept: Department): number => dept.total_revenue ?? 0;
const getRevenuePerEmployee = (dept: Department): number => dept.revenue_per_employee ?? 0;

// Wrapper component to handle data loading and provide safeguards
export default function RevenuePage() {
  // TODO: Implement when backend is connected
  // const { data: revenueData, items: revenueItems, isLoading, error } = useRevenueData();
  
  const isLoading = false;
  const error = null;
  
  // If there's an error, show the error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4 text-destructive">Error Loading Revenue Data</h1>
        <p className="text-muted-foreground mb-8">
          {error.message || "An unknown error occurred."}
        </p>
        <div className="flex gap-4">
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }
  
  // Return the component directly without waiting for loading
  return <RevenueForecasting />;
}

export function RevenueForecasting() {
  const [viewMode, setViewMode] = useState<ViewMode>("company-wide")
  const [activeTab, setActiveTab] = useState<TabOption>("current-view")
  const [selectedProject, setSelectedProject] = useState<string | undefined>()
  const [comparisonPeriod, setComparisonPeriod] = useState<ComparisonPeriod>("monthly")
  const [comparisonMetric, setComparisonMetric] = useState<ComparisonMetric>("revenue")

  // Local state for projection model inputs, initialized from fetched metrics
  const [employeeCount, setEmployeeCount] = useState(100)
  const [averageSalary, setAverageSalary] = useState(60000)
  const [revenuePerEmployee, setRevenuePerEmployee] = useState(10000)
  const [growthRate, setGrowthRate] = useState(5)
  const [projectionTimeframe, setProjectionTimeframe] = useState("12months")

  // Local state for profitability simulator
  const [departmentData, setDepartmentData] = useState<DepartmentWithHeadcount[]>([
    { id: "1", name: "Engineering", headcount: 30, newHeadcount: 30, revenue_per_employee: 12000, total_revenue: 360000 },
    { id: "2", name: "Marketing", headcount: 15, newHeadcount: 15, revenue_per_employee: 9000, total_revenue: 135000 },
    { id: "3", name: "Sales", headcount: 20, newHeadcount: 20, revenue_per_employee: 15000, total_revenue: 300000 }
  ])
  const [headcountImpacts, setHeadcountImpacts] = useState<Record<string, number | null>>({})

  // What-if scenario state
  const [employeeGrowth, setEmployeeGrowth] = useState(0)
  const [salaryChange, setSalaryChange] = useState(0)
  const [revenuePerEmployeeChange, setRevenuePerEmployeeChange] = useState(0)
  const [growthRateChange, setGrowthRateChange] = useState(0)

  const [isCalculating, setIsCalculating] = useState(false)
  const [sectionVisibility, setSectionVisibility] = useState<SectionVisibility>({
    metrics: true,
    projectionModel: true,
    revenueTrends: true,
    profitabilitySimulator: true,
    departmentRevenue: true,
    projectMetrics: false,
    departmentAllocation: false,
    projectTimeline: false,
    whatIfScenario: true,
  })
  const [isApplyingChanges, setIsApplyingChanges] = useState(false)

  // TODO: Implement when backend is connected
  // const {
  //   data: revenueData,
  //   items: revenueItems,
  //   isLoading: isHookLoading,
  //   error: revenueError
  // } = useRevenueData();

  const isHookLoading = false;
  const revenueError = null;

  // Mock empty data for UI display
  const actualRevenue: any[] = [];
  const departments = departmentData;
  
  // Define types for metrics to avoid type errors
  interface RevenueMetrics {
    employee_count: number;
    average_salary: number;
    revenue_per_employee: number;
    growth_rate: number;
    projection_timeframe?: string;
  }
  
  const forecast: any[] = []; 
  const metrics: RevenueMetrics = {
    employee_count: employeeCount,
    average_salary: averageSalary,
    revenue_per_employee: revenuePerEmployee,
    growth_rate: growthRate,
    projection_timeframe: projectionTimeframe
  };
  const projectsList: any[] = []; 
  const projectDetails: any = {}; 
  const comparisonData: any = {}; 

  // Mock functionality for compatibility with existing code
  const refetch = useCallback(async () => {
    // TODO: Implement when backend is connected
    console.log("Refetch called");
  }, []);

  const calculateHeadcountImpact = useCallback(async (changes: Record<string, number>) => {
    // TODO: Implement when backend is connected
    console.log("Calculate headcount impact called with:", changes);
    setHeadcountImpacts(
      Object.fromEntries(
        Object.entries(changes).map(([deptName, change]) => [
          deptName,
          change * 1.5 // Mock impact calculation
        ])
      )
    );
    return {
      departmentImpacts: Object.fromEntries(
        Object.entries(changes).map(([deptName, change]) => [
          deptName,
          { delta: change * 1.5 } // Mock calculation
        ])
      )
    };
  }, []);

  const updateMetrics = useCallback(async (newMetrics: any) => {
    // TODO: Implement when backend is connected
    console.log("Update metrics called with:", newMetrics);
  }, []);

  const applyHeadcountChanges = useCallback(async (changes: Record<string, number>) => {
    // TODO: Implement when backend is connected
    console.log("Apply headcount changes called with:", changes);
  }, []);

  // Effect to initialize form state when metrics data is loaded/changed
  useEffect(() => {
    if (metrics) {
      setEmployeeCount(metrics.employee_count || 0)
      setAverageSalary(metrics.average_salary || 0)
      setRevenuePerEmployee(metrics.revenue_per_employee || 0)
      setGrowthRate(metrics.growth_rate || 0)
      setProjectionTimeframe(metrics.projection_timeframe || "12months")
    }
  }, [metrics])

  // Effect to initialize department data for the simulator
  useEffect(() => {
    if (departments && departments.length > 0) {
      // Create compatible department objects
      const compatibleDepartments = departments.map(dept => ({
        ...dept,
        id: dept.id || '',
        name: dept.name || '',
        headcount: dept.headcount || 0,
        revenue_per_employee: dept.revenue_per_employee || 0,
        total_revenue: dept.total_revenue || 0,
        newHeadcount: dept.headcount || 0,
        impact: null
      }));
      
      setDepartmentData(compatibleDepartments);
      setHeadcountImpacts({})
    } else if (departments && departments.length === 0) {
      // Set default data if no departments exist
      setDepartmentData([
        { id: "1", name: "Engineering", headcount: 30, newHeadcount: 30, revenue_per_employee: 12000, total_revenue: 360000 },
        { id: "2", name: "Marketing", headcount: 15, newHeadcount: 15, revenue_per_employee: 9000, total_revenue: 135000 },
        { id: "3", name: "Sales", headcount: 20, newHeadcount: 20, revenue_per_employee: 15000, total_revenue: 300000 }
      ]);
    }
  }, [departments])

  // Handle projection model input changes
  const handleProjectionChange = (field: string, value: number | string) => {
    let updatedMetrics = {
        employeeCount,
        averageSalary,
        revenuePerEmployee,
        growthRate,
        projectionTimeframe
    }

    if (field === 'employeeCount') {
        setEmployeeCount(value as number)
        updatedMetrics.employeeCount = value as number
    } else if (field === 'averageSalary') {
        setAverageSalary(value as number)
        updatedMetrics.averageSalary = value as number
    } else if (field === 'revenuePerEmployee') {
        setRevenuePerEmployee(value as number)
        updatedMetrics.revenuePerEmployee = value as number
    } else if (field === 'growthRate') {
        setGrowthRate(value as number)
        updatedMetrics.growthRate = value as number
    } else if (field === 'projectionTimeframe') {
        setProjectionTimeframe(value as string)
        updatedMetrics.projectionTimeframe = value as string
    }

    // TODO: Implement when backend is connected
    // debouncedUpdateMetrics(updatedMetrics)
    console.log("Updated metrics:", updatedMetrics);
  }

  // Handle headcount changes in the simulator table
  const handleHeadcountChange = (index: number, change: number) => {
    const updatedData = [...departmentData]
    const department = updatedData[index]
    const newHeadcount = department.newHeadcount + change

    if (newHeadcount >= 0) {
      updatedData[index] = {
        ...department,
        newHeadcount: newHeadcount,
      }
      setDepartmentData(updatedData)

      const departmentChangesForImpact = updatedData.reduce((acc, dept) => {
        const originalHeadcount = getHeadcount(dept)
        acc[dept.name] = dept.newHeadcount - originalHeadcount
        return acc
      }, {} as Record<string, number>)

      // Calculate impact
      calculateHeadcountImpact(departmentChangesForImpact)
    }
  }

  // Handle what-if scenario changes
  const handleWhatIfChange = (field: string, value: number) => {
    switch (field) {
      case 'employeeGrowth':
        setEmployeeGrowth(value);
        break;
      case 'salaryChange':
        setSalaryChange(value);
        break;
      case 'revenuePerEmployeeChange':
        setRevenuePerEmployeeChange(value);
        break;
      case 'growthRateChange':
        setGrowthRateChange(value);
        break;
    }
  }

  // Calculate what-if scenario metrics
  const calculateWhatIfScenario = () => {
    const newEmployeeCount = Math.round(employeeCount * (1 + employeeGrowth / 100));
    const newAverageSalary = averageSalary * (1 + salaryChange / 100);
    const newRevenuePerEmployee = revenuePerEmployee * (1 + revenuePerEmployeeChange / 100);
    const newGrowthRate = growthRate + growthRateChange;

    return {
      employee_count: newEmployeeCount,
      average_salary: newAverageSalary,
      revenue_per_employee: newRevenuePerEmployee,
      growth_rate: newGrowthRate,
    };
  }

  // Handle apply what-if changes
  const handleApplyWhatIfScenario = () => {
    const newMetrics = calculateWhatIfScenario();
    setEmployeeCount(newMetrics.employee_count);
    setAverageSalary(newMetrics.average_salary);
    setRevenuePerEmployee(newMetrics.revenue_per_employee);
    setGrowthRate(newMetrics.growth_rate);
    
    // Reset what-if sliders
    setEmployeeGrowth(0);
    setSalaryChange(0);
    setRevenuePerEmployeeChange(0);
    setGrowthRateChange(0);

    toast({
      title: "Scenario Applied",
      description: "The what-if scenario has been applied to your metrics.",
    });
  }

  // Handle reset what-if scenario
  const handleResetWhatIfScenario = () => {
    setEmployeeGrowth(0);
    setSalaryChange(0);
    setRevenuePerEmployeeChange(0);
    setGrowthRateChange(0);
  }

  // Handle apply changes button
  const handleApplyChanges = async () => {
    setIsApplyingChanges(true)
    try {
      const departmentChangesToApply = departmentData.reduce((acc, dept) => {
        const originalHeadcount = getHeadcount(dept)
        const diff = dept.newHeadcount - originalHeadcount
        if (diff !== 0) {
          acc[dept.name] = diff
        }
        return acc
      }, {} as Record<string, number>)

      if (Object.keys(departmentChangesToApply).length > 0) {
          await applyHeadcountChanges(departmentChangesToApply)
          setHeadcountImpacts({})
      }

    } catch (error) {
      console.error('Failed to apply changes:', error)
    } finally {
      setIsApplyingChanges(false)
    }
  }

  // Handle report generation
  const handleGenerateReport = async () => {
      let reportPayload: any = {
          period: comparisonPeriod,
          metric: comparisonMetric,
          data: {
              actualRevenue: actualRevenue,
              forecast: forecast,
              metrics: metrics
          }
      }

      if (activeTab !== 'comparison') {
          reportPayload.period = 'monthly'
          reportPayload.metric = 'revenue'
      }

      try {
          // TODO: Implement when backend is connected
          console.log("Generate report payload:", reportPayload);
          toast({
            title: "Report Generation",
            description: "This feature will be available when backend is connected.",
          });
      } catch (error) {
          console.error('Failed to generate report:', error);
      }
  };

  const currentMetrics = metrics || { employee_count: employeeCount, average_salary: averageSalary, revenue_per_employee: revenuePerEmployee, growth_rate: growthRate };

  const monthlyRevenue = (currentMetrics.employee_count || 0) * (currentMetrics.revenue_per_employee || 0)
  const annualRevenue = monthlyRevenue * 12
  const projectedRevenue = annualRevenue * (1 + (currentMetrics.growth_rate || 0) / 100)
  const totalSalaries = (currentMetrics.employee_count || 0) * (currentMetrics.average_salary || 0)
  const profitMargin = annualRevenue === 0 ? 0 : ((annualRevenue - totalSalaries) / annualRevenue) * 100

  // What-if scenario calculations
  const whatIfScenario = calculateWhatIfScenario();
  const whatIfMonthlyRevenue = whatIfScenario.employee_count * whatIfScenario.revenue_per_employee;
  const whatIfAnnualRevenue = whatIfMonthlyRevenue * 12;
  const whatIfProjectedRevenue = whatIfAnnualRevenue * (1 + whatIfScenario.growth_rate / 100);
  const whatIfTotalSalaries = whatIfScenario.employee_count * whatIfScenario.average_salary;
  const whatIfProfitMargin = whatIfAnnualRevenue === 0 ? 0 : ((whatIfAnnualRevenue - whatIfTotalSalaries) / whatIfAnnualRevenue) * 100;

  const totalImpact = useMemo(() => {
      return departmentData.reduce((sum, dept) => {
        const impact = headcountImpacts[dept.name] ?? 0;
        return sum + impact;
    }, 0);
  }, [departmentData, headcountImpacts]);

  // Generate mock chart data
  const chartData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();
    
    return months.map((month, index) => {
      const baseRevenue = monthlyRevenue * (1 + (index * 0.02));
      const projValue = baseRevenue * (1 + (growthRate / 100 * (index / 12)));
      
      return {
        month: `${month} ${currentYear}`,
        actual: index < 7 ? baseRevenue : null,
        projected: index >= 5 ? projValue : null
      };
    });
  }, [monthlyRevenue, growthRate]);

  // Generate what-if chart data
  const whatIfChartData = useMemo(() => {
    const months = ["Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6", 
                    "Month 7", "Month 8", "Month 9", "Month 10", "Month 11", "Month 12"];
    
    return months.map((month, index) => {
      const currentTrajectory = monthlyRevenue * Math.pow(1 + growthRate / 100 / 12, index);
      const whatIfTrajectory = whatIfMonthlyRevenue * Math.pow(1 + whatIfScenario.growth_rate / 100 / 12, index);
      
      return {
        month,
        current: currentTrajectory,
        projected: whatIfTrajectory
      };
    });
  }, [monthlyRevenue, growthRate, whatIfMonthlyRevenue, whatIfScenario.growth_rate]);

  const departmentChartData = useMemo(() => {
    return departmentData
        .map(dept => ({
            department: dept.name,
            revenue: dept.total_revenue || 0
        }))
        .sort((a, b) => b.revenue - a.revenue);
  }, [departmentData]);

  const comparisonChartData = useMemo(() => {
    // Generate mock comparison data
    const periods = comparisonPeriod === "monthly" 
      ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
      : comparisonPeriod === "quarterly"
        ? ["Q1", "Q2", "Q3", "Q4"]
        : ["2022", "2023", "2024"];
    
    return periods.map((period, i) => ({
      period,
      current: 100000 + (i * 15000),
      previous: 85000 + (i * 12000)
    }));
  }, [comparisonPeriod]);

  const LoadingSpinner = ({ className = "h-8 w-8" }: { className?: string }) => (
    <Loader2 className={`${className} animate-spin text-muted-foreground`} />
  )

  const MetricCardSkeleton = () => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-5 w-2/5" />
            <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
            <Skeleton className="h-8 w-3/5 mb-1" />
            <Skeleton className="h-4 w-4/5" />
        </CardContent>
    </Card>
  )

  const ChartSkeleton = ({ height = "300px" }: { height?: string }) => (
    <div style={{ height }} className="flex items-center justify-center">
      <Skeleton className="h-full w-full" />
    </div>
  )

  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex items-center justify-center h-[200px] border-2 border-dashed rounded-lg">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <p className="text-sm">{message}</p>
      </div>
    </div>
  )

  const ErrorDisplay = ({ error, onRetry }: { error: Error | null, onRetry: () => void }) => {
      if (!error) return null;
      return (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" /> Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">{error.message}</p>
          </CardContent>
          <CardFooter>
            <Button variant="destructive" size="sm" onClick={onRetry}>
              <RefreshCw className="mr-2 h-4 w-4" /> Retry
            </Button>
          </CardFooter>
        </Card>
      )
  }

  const Section = ({
    id,
    children,
    className = ""
  }: {
    id: keyof SectionVisibility
    children: React.ReactNode
    className?: string
  }) => {
    if (!sectionVisibility[id]) return null

    return (
      <div className={`relative ${className}`}>
        {children}
      </div>
    )
  }

  const isActiveTab = (tab: TabOption) => activeTab === tab

  return (
    <div className="container px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Revenue Forecasting
          </h1>
          <p className="text-muted-foreground">
            Track, analyze, and project your organization's revenue trends
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={handleGenerateReport}>
            <Download size={16} className="mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="w-full sm:w-auto">
          {viewMode === "project-based" && (
            <Select
              value={selectedProject}
              onValueChange={(value) => {
                setSelectedProject(value)
              }}
              disabled={isHookLoading}
            >
              <SelectTrigger className="w-full sm:w-[250px]">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {isHookLoading && <SelectItem value="loading" disabled>Loading projects...</SelectItem>}
                {!isHookLoading && projectsList.length === 0 && <SelectItem value="no-projects" disabled>No projects found</SelectItem>}
                {projectsList.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <Select
            value={viewMode}
            onValueChange={(value: ViewMode) => setViewMode(value)}
            disabled={isHookLoading}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Select view mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="company-wide">Company-wide</SelectItem>
            <SelectItem value="project-based">Project-based</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border">
        <Button
          variant={isActiveTab("current-view") ? "default" : "ghost"}
          className="relative h-9 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground transition-none hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
          onClick={() => setActiveTab("current-view")}
          data-state={isActiveTab("current-view") ? "active" : ""}
          disabled={isHookLoading}
        >
          Current View
        </Button>
        <Button
          variant={isActiveTab("project-view") ? "default" : "ghost"}
          className="relative h-9 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground transition-none hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
          onClick={() => setActiveTab("project-view")}
          data-state={isActiveTab("project-view") ? "active" : ""}
          disabled={isHookLoading}
        >
          Project View
        </Button>
        <Button
          variant={isActiveTab("comparison") ? "default" : "ghost"}
          className="relative h-9 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground transition-none hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
          onClick={() => setActiveTab("comparison")}
          data-state={isActiveTab("comparison") ? "active" : ""}
          disabled={isHookLoading}
        >
          Comparison
        </Button>
      </div>

      <ErrorDisplay error={revenueError} onRetry={refetch} />

      {!revenueError && (
        <>
          {activeTab === "current-view" && (
            <>
              {viewMode === "company-wide" ? (
                <>
                  <Section id="metrics" className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {isHookLoading ? (
                       <>
                           <MetricCardSkeleton />
                           <MetricCardSkeleton />
                           <MetricCardSkeleton />
                           <MetricCardSkeleton />
                       </>
                    ) : (
                       <>
                           <Card>
                               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                   <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                                   <DollarSign className="h-4 w-4 text-muted-foreground" />
                               </CardHeader>
                               <CardContent>
                                   <div className="text-2xl font-bold">{formatCurrency(monthlyRevenue)}</div>
                                   <p className="text-xs text-muted-foreground flex items-center">
                                       <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                                       <span className="text-green-500">+{formatPercentage(growthRate)}</span> projected growth
                                   </p>
                               </CardContent>
                           </Card>
                           <Card>
                               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                   <CardTitle className="text-sm font-medium">Annual Revenue</CardTitle>
                                   <BarChart2 className="h-4 w-4 text-muted-foreground" />
                               </CardHeader>
                               <CardContent>
                                   <div className="text-2xl font-bold">{formatCurrency(annualRevenue)}</div>
                                   <p className="text-xs text-muted-foreground flex items-center">Based on current workforce</p>
                               </CardContent>
                           </Card>
                           <Card>
                               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                   <CardTitle className="text-sm font-medium">Projected Revenue</CardTitle>
                                   <TrendingUp className="h-4 w-4 text-muted-foreground" />
                               </CardHeader>
                               <CardContent>
                                   <div className="text-2xl font-bold">{formatCurrency(projectedRevenue)}</div>
                                   <p className="text-xs text-muted-foreground flex items-center">With {formatPercentage(growthRate)} growth rate</p>
                               </CardContent>
                           </Card>
                           <Card>
                               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                   <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                                   <Calculator className="h-4 w-4 text-muted-foreground" />
                               </CardHeader>
                               <CardContent>
                                   <div className="text-2xl font-bold">{formatPercentage(profitMargin)}</div>
                                   <p className="text-xs text-muted-foreground flex items-center">After salary expenses</p>
                               </CardContent>
                           </Card>
                       </>
                    )}
                  </Section>

                  <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                    <Section id="projectionModel">
                      <Card>
                        <CardHeader>
                          <CardTitle>Revenue Projection Model</CardTitle>
                          <CardDescription>Adjust parameters to forecast revenue</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           {isHookLoading ? (
                               <>
                                   <Skeleton className="h-8 w-1/3 mb-1" /> <Skeleton className="h-10 w-full mb-3" />
                                   <Skeleton className="h-8 w-1/3 mb-1" /> <Skeleton className="h-10 w-full mb-3" />
                                   <Skeleton className="h-8 w-1/3 mb-1" /> <Skeleton className="h-10 w-full mb-3" />
                                   <Skeleton className="h-8 w-1/3 mb-1" /> <Skeleton className="h-10 w-full mb-3" />
                                   <Skeleton className="h-8 w-1/3 mb-1" /> <Skeleton className="h-10 w-full mb-3" />
                                   <Skeleton className="h-10 w-full mt-4" />
                               </>
                           ) : (
                               <>
                                  <div className="space-y-2">
                                    <Label htmlFor="employee-count">Employee Count</Label>
                                    <div className="flex items-center gap-2">
                                      <Input
                                        id="employee-count"
                                        type="number"
                                        value={employeeCount}
                                        onChange={(e) => handleProjectionChange('employeeCount', Number.parseInt(e.target.value) || 0)}
                                        className="flex-1"
                                        min="0"
                                      />
                                      <Users className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="avg-salary">Average Salary ($)</Label>
                                    <div className="flex items-center gap-2">
                                      <Input
                                        id="avg-salary"
                                        type="number"
                                        value={averageSalary}
                                        onChange={(e) => handleProjectionChange('averageSalary', Number.parseInt(e.target.value) || 0)}
                                        className="flex-1"
                                        min="0"
                                      />
                                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="revenue-per-employee">Monthly Revenue per Employee ($)</Label>
                                    <div className="flex items-center gap-2">
                                      <Input
                                        id="revenue-per-employee"
                                        type="number"
                                        value={revenuePerEmployee}
                                        onChange={(e) => handleProjectionChange('revenuePerEmployee', Number.parseInt(e.target.value) || 0)}
                                        className="flex-1"
                                        min="0"
                                      />
                                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <Label htmlFor="growth-rate">Growth Rate (%)</Label>
                                      <span className="text-sm">{formatPercentage(growthRate)}</span>
                                    </div>
                                    <Slider
                                      id="growth-rate"
                                      min={0}
                                      max={20}
                                      step={0.5}
                                      value={[growthRate]}
                                      onValueChange={(value) => handleProjectionChange('growthRate', value[0])}
                                      className="transition-all"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="timeframe">Projection Timeframe</Label>
                                    <Select value={projectionTimeframe} onValueChange={(value) => handleProjectionChange('projectionTimeframe', value)}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select timeframe" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="6months">6 Months</SelectItem>
                                        <SelectItem value="12months">12 Months</SelectItem>
                                        <SelectItem value="24months">24 Months</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                               </>
                           )}
                        </CardContent>
                      </Card>
                    </Section>

                    <Section id="revenueTrends">
                      <Card>
                        <CardHeader>
                          <CardTitle>Revenue Trends</CardTitle>
                          <CardDescription>Actual vs. projected revenue</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px]">
                           {isHookLoading ? (
                                <ChartSkeleton />
                           ) : chartData.length === 0 ? (
                               <EmptyState message="No revenue data available." />
                           ) : (
                            <ChartContainer
                              config={{
                                actual: { label: "Actual", color: "hsl(var(--chart-1))" },
                                projected: { label: "Projected", color: "hsl(var(--chart-2))" },
                              }}
                              className="h-[300px]"
                            >
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                                  <YAxis
                                      fontSize={12}
                                      tickLine={false}
                                      axisLine={false}
                                      tickFormatter={(value) => `$${(value / 1000).toLocaleString()}k`}
                                  />
                                  <Tooltip
                                      formatter={(value: number, name: string) => [formatCurrency(value), name === 'actual' ? 'Actual' : 'Projected']}
                                      contentStyle={{
                                          backgroundColor: "hsl(var(--background))",
                                          border: "1px solid hsl(var(--border))",
                                          borderRadius: "6px",
                                      }}
                                  />
                                  <Legend />
                                  <Line
                                    type="monotone"
                                    dataKey="actual"
                                    stroke="var(--color-actual)"
                                    strokeWidth={2}
                                    activeDot={{ r: 8 }}
                                    connectNulls
                                  />
                                  <Line
                                    type="monotone"
                                    dataKey="projected"
                                    stroke="var(--color-projected)"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    connectNulls
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </ChartContainer>
                           )}
                          </div>
                        </CardContent>
                      </Card>
                    </Section>
                  </div>

                  <Section id="profitabilitySimulator" className="overflow-x-auto">
                    <Card>
                      <CardHeader>
                        <CardTitle>Profitability Simulator</CardTitle>
                        <CardDescription>Adjust hiring/firing decisions and see revenue impact in real time</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isHookLoading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                            </div>
                        ) : departmentData.length === 0 ? (
                            <EmptyState message="No department data available." />
                        ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="border-b">
                                    <th className="text-left py-3 px-4 font-semibold">Department</th>
                                    <th className="text-center py-3 px-4 font-semibold">Current Headcount</th>
                                    <th className="text-center py-3 px-4 font-semibold">Revenue per Employee</th>
                                    <th className="text-center py-3 px-4 font-semibold">Total Revenue</th>
                                    <th className="text-center py-3 px-4 font-semibold">Adjust Headcount</th>
                                    <th className="text-center py-3 px-4 font-semibold">Projected Impact</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {departmentData.map((dept, index) => {
                                    const impact = headcountImpacts[dept.name] ?? null;

                                    return (
                                      <tr key={dept.id} className="border-b hover:bg-muted/50 transition-colors">
                                        <td className="py-3 px-4 font-medium">{dept.name}</td>
                                        <td className="text-center py-3 px-4">{dept.headcount}</td>
                                        <td className="text-center py-3 px-4">{formatCurrency(dept.revenue_per_employee)}</td>
                                        <td className="text-center py-3 px-4">{formatCurrency(dept.total_revenue)}</td>
                                        <td className="text-center py-3 px-4">
                                          <div className="flex items-center justify-center gap-2">
                                            <Button
                                              variant="outline"
                                              size="icon"
                                              className="h-8 w-8"
                                              onClick={() => handleHeadcountChange(index, -1)}
                                              disabled={dept.newHeadcount <= 0 || isApplyingChanges}
                                            >
                                              -
                                            </Button>
                                            <span className="w-8 text-center font-medium">{dept.newHeadcount}</span>
                                            <Button
                                              variant="outline"
                                              size="icon"
                                              className="h-8 w-8"
                                              onClick={() => handleHeadcountChange(index, 1)}
                                              disabled={isApplyingChanges}
                                            >
                                              +
                                            </Button>
                                          </div>
                                        </td>
                                        <td className="text-center py-3 px-4">
                                            <Badge
                                                className={cn(
                                                  "ml-2",
                                                  impact !== null && impact !== undefined && impact > 0
                                                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-400/10 dark:text-emerald-400"
                                                    : impact !== null && impact !== undefined && impact < 0
                                                    ? "bg-rose-100 text-rose-800 hover:bg-rose-100 dark:bg-rose-400/10 dark:text-rose-400"
                                                    : "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-400/10 dark:text-gray-400"
                                                )}
                                                variant="outline"
                                            >
                                                {impact !== null && impact !== undefined ? (
                                                  <>
                                                    {impact > 0 ? "+" : ""}
                                                    {impact.toFixed(2)}%
                                                  </>
                                                ) : (
                                                  "N/A"
                                                )}
                                            </Badge>
                                        </td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            </div>
                        )}
                      </CardContent>
                      <CardFooter className="flex justify-between items-center">
                         {isHookLoading ? <Skeleton className="h-6 w-32" /> : (
                             <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Total Projected Impact:</span>
                                <Badge
                                    variant={totalImpact === 0 ? "outline" : (totalImpact > 0 ? "default" : "destructive")}
                                    className={`transition-all ${totalImpact === 0 ? "opacity-50" : ""} ${totalImpact > 0 ? "bg-green-500/20 text-green-500 hover:bg-green-500/30" : totalImpact < 0 ? "hover:bg-red-500/30" : ""}`}
                                >
                                    {`${totalImpact > 0 ? "+" : ""}${formatCurrency(totalImpact)}`}
                                </Badge>
                             </div>
                         )}
                        <Button onClick={handleApplyChanges} disabled={isApplyingChanges || isHookLoading || totalImpact === 0}>
                          {isApplyingChanges && <LoadingSpinner className="mr-2 h-4 w-4" />}
                          Apply Changes
                        </Button>
                      </CardFooter>
                    </Card>
                  </Section>

                  {/* What-If Scenario Section */}
                  <Section id="whatIfScenario">
                    <Card>
                      <CardHeader>
                        <CardTitle>What If Scenario Builder</CardTitle>
                        <CardDescription>
                          Simulate changes to key metrics and see the impact on revenue and profitability
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                          {/* Left column: Adjustable parameters */}
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="employee-growth">Headcount Change (%)</Label>
                                <span className="text-sm font-medium">
                                  {employeeGrowth > 0 ? "+" : ""}
                                  {employeeGrowth.toFixed(1)}%
                                </span>
                              </div>
                              <Slider
                                id="employee-growth"
                                min={-50}
                                max={100}
                                step={1}
                                value={[employeeGrowth]}
                                onValueChange={(value) => handleWhatIfChange('employeeGrowth', value[0])}
                              />
                              <p className="text-xs text-muted-foreground">
                                Current: {employeeCount} employees → 
                                Projected: {whatIfScenario.employee_count} employees
                              </p>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="salary-change">Average Salary Change (%)</Label>
                                <span className="text-sm font-medium">
                                  {salaryChange > 0 ? "+" : ""}
                                  {salaryChange.toFixed(1)}%
                                </span>
                              </div>
                              <Slider
                                id="salary-change"
                                min={-30}
                                max={50}
                                step={1}
                                value={[salaryChange]}
                                onValueChange={(value) => handleWhatIfChange('salaryChange', value[0])}
                              />
                              <p className="text-xs text-muted-foreground">
                                Current: {formatCurrency(averageSalary)} → 
                                Projected: {formatCurrency(whatIfScenario.average_salary)}
                              </p>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="revenue-per-employee-change">Revenue Per Employee Change (%)</Label>
                                <span className="text-sm font-medium">
                                  {revenuePerEmployeeChange > 0 ? "+" : ""}
                                  {revenuePerEmployeeChange.toFixed(1)}%
                                </span>
                              </div>
                              <Slider
                                id="revenue-per-employee-change"
                                min={-30}
                                max={100}
                                step={1}
                                value={[revenuePerEmployeeChange]}
                                onValueChange={(value) => handleWhatIfChange('revenuePerEmployeeChange', value[0])}
                              />
                              <p className="text-xs text-muted-foreground">
                                Current: {formatCurrency(revenuePerEmployee)} → 
                                Projected: {formatCurrency(whatIfScenario.revenue_per_employee)}
                              </p>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="growth-rate-change">Growth Rate Change (percentage points)</Label>
                                <span className="text-sm font-medium">
                                  {growthRateChange > 0 ? "+" : ""}
                                  {growthRateChange.toFixed(1)}
                                </span>
                              </div>
                              <Slider
                                id="growth-rate-change"
                                min={-10}
                                max={10}
                                step={0.5}
                                value={[growthRateChange]}
                                onValueChange={(value) => handleWhatIfChange('growthRateChange', value[0])}
                              />
                              <p className="text-xs text-muted-foreground">
                                Current: {formatPercentage(growthRate)} → 
                                Projected: {formatPercentage(whatIfScenario.growth_rate)}
                              </p>
                            </div>
                          </div>

                          {/* Right column: Impact visualization */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-medium">Impact Summary</h3>
                            <div className="grid gap-3">
                              <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                  <div className="font-medium">Monthly Revenue</div>
                                  <div className="text-sm text-muted-foreground">
                                    {formatCurrency(monthlyRevenue)} → {formatCurrency(whatIfMonthlyRevenue)}
                                  </div>
                                </div>
                                <div className={`text-sm font-medium py-1 px-2 rounded-md ${
                                  whatIfMonthlyRevenue > monthlyRevenue 
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" 
                                    : whatIfMonthlyRevenue < monthlyRevenue 
                                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                                }`}>
                                  {whatIfMonthlyRevenue > monthlyRevenue ? "+" : ""}
                                  {((whatIfMonthlyRevenue - monthlyRevenue) / monthlyRevenue * 100).toFixed(1)}%
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                  <div className="font-medium">Annual Revenue</div>
                                  <div className="text-sm text-muted-foreground">
                                    {formatCurrency(annualRevenue)} → {formatCurrency(whatIfAnnualRevenue)}
                                  </div>
                                </div>
                                <div className={`text-sm font-medium py-1 px-2 rounded-md ${
                                  whatIfAnnualRevenue > annualRevenue 
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" 
                                    : whatIfAnnualRevenue < annualRevenue 
                                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                                }`}>
                                  {whatIfAnnualRevenue > annualRevenue ? "+" : ""}
                                  {((whatIfAnnualRevenue - annualRevenue) / annualRevenue * 100).toFixed(1)}%
                                </div>
                              </div>

                              <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                  <div className="font-medium">Projected Revenue</div>
                                  <div className="text-sm text-muted-foreground">
                                    {formatCurrency(projectedRevenue)} → {formatCurrency(whatIfProjectedRevenue)}
                                  </div>
                                </div>
                                <div className={`text-sm font-medium py-1 px-2 rounded-md ${
                                  whatIfProjectedRevenue > projectedRevenue 
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" 
                                    : whatIfProjectedRevenue < projectedRevenue 
                                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                                }`}>
                                  {whatIfProjectedRevenue > projectedRevenue ? "+" : ""}
                                  {((whatIfProjectedRevenue - projectedRevenue) / projectedRevenue * 100).toFixed(1)}%
                                </div>
                              </div>

                              <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                  <div className="font-medium">Profit Margin</div>
                                  <div className="text-sm text-muted-foreground">
                                    {formatPercentage(profitMargin)} → {formatPercentage(whatIfProfitMargin)}
                                  </div>
                                </div>
                                <div className={`text-sm font-medium py-1 px-2 rounded-md ${
                                  whatIfProfitMargin > profitMargin 
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" 
                                    : whatIfProfitMargin < profitMargin 
                                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                                }`}>
                                  {whatIfProfitMargin > profitMargin ? "+" : ""}
                                  {(whatIfProfitMargin - profitMargin).toFixed(1)} pts
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Chart showing projections */}
                        <div className="pt-4">
                          <h3 className="text-lg font-medium mb-2">12-Month Revenue Projection</h3>
                          <div className="h-[250px]">
                            <ChartContainer
                              config={{
                                current: { label: "Current Trajectory", color: "hsl(var(--chart-1))" },
                                projected: { label: "What If Scenario", color: "hsl(var(--chart-2))" },
                              }}
                              className="h-[250px]"
                            >
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={whatIfChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis 
                                    dataKey="month" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false}
                                    tick={{fontSize: 10}}
                                    interval={1}
                                  />
                                  <YAxis
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${(value / 1000).toLocaleString()}k`}
                                  />
                                  <Tooltip
                                    formatter={(value: number, name: string) => [
                                      formatCurrency(value), 
                                      name === "current" ? "Current Trajectory" : "What If Scenario"
                                    ]}
                                    contentStyle={{
                                      backgroundColor: "hsl(var(--background))",
                                      border: "1px solid hsl(var(--border))",
                                      borderRadius: "6px",
                                    }}
                                  />
                                  <Legend />
                                  <Line
                                    type="monotone"
                                    dataKey="current"
                                    stroke="var(--color-current)"
                                    strokeWidth={2}
                                    dot={false}
                                  />
                                  <Line
                                    type="monotone"
                                    dataKey="projected"
                                    stroke="var(--color-projected)"
                                    strokeWidth={2}
                                    dot={false}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </ChartContainer>
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter className="flex justify-between">
                        <Button variant="outline" onClick={handleResetWhatIfScenario}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Reset Scenario
                        </Button>
                        <Button onClick={handleApplyWhatIfScenario}>
                          Apply This Scenario
                        </Button>
                      </CardFooter>
                    </Card>
                  </Section>

                  <Section id="departmentRevenue">
                    <Card>
                      <CardHeader>
                        <CardTitle>Revenue by Department</CardTitle>
                        <CardDescription>Breakdown of revenue contribution by department</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                           {isHookLoading ? (
                                <ChartSkeleton />
                           ) : departmentChartData.length === 0 ? (
                               <EmptyState message="No department revenue data." />
                           ) : (
                              <ChartContainer
                                config={{
                                  revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
                                }}
                                className="h-[300px]"
                              >
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={departmentChartData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis
                                      dataKey="department"
                                      type="category"
                                      tickLine={false}
                                      axisLine={false}
                                      tickMargin={10}
                                      width={80}
                                      fontSize={12}
                                    />
                                    <Tooltip
                                        formatter={(value: number) => [formatCurrency(value), "Total Revenue"]}
                                        cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }}
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--background))",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: "6px",
                                        }}
                                    />
                                    <Legend />
                                    <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[0, 4, 4, 0]} />
                                  </BarChart>
                                </ResponsiveContainer>
                              </ChartContainer>
                           )}
                        </div>
                      </CardContent>
                       <CardFooter>
                            <Button variant="outline" className="ml-auto" disabled>
                                <Download className="mr-2 h-4 w-4" />
                                Export Data (Coming Soon)
                            </Button>
                        </CardFooter>
                    </Card>
                  </Section>
                </>
              ) : (
                <div className="grid gap-6">
                  {isHookLoading && !projectDetails ? (
                      <LoadingSpinner />
                  ) : selectedProject && projectDetails ? (
                    <>
                       <Section id="projectMetrics" className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                           <Card>
                              {/* TODO: Implement when backend is connected - Project Monthly Revenue */}
                           </Card>
                           <Card>
                               {/* TODO: Implement when backend is connected - Project Annual Revenue */}
                           </Card>
                            {/* TODO: Implement when backend is connected - more project metrics */}
                       </Section>
                       <Section id="departmentAllocation" className="overflow-x-auto">
                           <Card>
                              {/* TODO: Implement when backend is connected - Allocation Table */}
                           </Card>
                       </Section>
                       <Section id="projectTimeline">
                           <Card>
                              {/* TODO: Implement when backend is connected - Project Timeline Chart */}
                           </Card>
                       </Section>
                    </>
                  ) : (
                    <EmptyState message="Select a project to view detailed metrics" />
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === "project-view" && (
            <Card>
              <CardHeader>
                <CardTitle>Projects Overview</CardTitle>
                <CardDescription>Revenue breakdown by project</CardDescription>
              </CardHeader>
              <CardContent>
                {isHookLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                ) : projectsList.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                       <thead>
                            <tr className="border-b">
                                <th className="text-left py-3 px-4 font-semibold">Project Name</th>
                                <th className="text-center py-3 px-4 font-semibold">Status</th>
                                <th className="text-right py-3 px-4 font-semibold">Latest Revenue</th>
                            </tr>
                        </thead>
                      <tbody>
                        {projectsList.map((project) => (
                          <tr key={project.id} className="border-b hover:bg-muted/50 transition-colors">
                            <td className="py-3 px-4 font-medium">{project.name}</td>
                            <td className="text-center py-3 px-4">
                              <Badge variant={project.status === "Active" ? "default" : "secondary"}>
                                {project.status}
                              </Badge>
                            </td>
                            <td className="text-right py-3 px-4">{formatCurrency(project.revenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState message="No projects available" />
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "comparison" && (
            <Card>
              <CardHeader>
                <CardTitle>Metric Comparison</CardTitle>
                <CardDescription>Compare metrics across different periods</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Time Period</Label>
                        <Select
                            value={comparisonPeriod}
                            onValueChange={(value: ComparisonPeriod) => setComparisonPeriod(value)}
                            disabled={isHookLoading}
                        >
                            <SelectTrigger><SelectValue placeholder="Select time period" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">Quarterly</SelectItem>
                                <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">Compare data across different time periods</p>
                    </div>
                    <div className="space-y-2">
                        <Label>Metric</Label>
                        <Select
                            value={comparisonMetric}
                            onValueChange={(value: ComparisonMetric) => setComparisonMetric(value)}
                            disabled={isHookLoading}
                        >
                            <SelectTrigger><SelectValue placeholder="Select metric" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="revenue">Revenue</SelectItem>
                                <SelectItem value="growth">Growth Rate (%)</SelectItem>
                                <SelectItem value="profitability">Profitability (%)</SelectItem>
                            </SelectContent>
                        </Select>
                         <p className="text-xs text-muted-foreground">Choose which metric to analyze</p>
                    </div>
                </div>

                {isHookLoading ? (
                    <ChartSkeleton height="400px" />
                ) : comparisonChartData && comparisonChartData.length > 0 ? (
                  <>
                    <div className="h-[400px]">
                       <ChartContainer
                            config={{
                                current: { label: "Current Period", color: "hsl(var(--chart-1))" },
                                previous: { label: "Previous Period", color: "hsl(var(--chart-2))" },
                            }}
                            className="h-[400px]"
                        >
                           <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={comparisonChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="period" fontSize={12} tickLine={false} axisLine={false}/>
                                  <YAxis
                                      fontSize={12}
                                      tickLine={false}
                                      axisLine={false}
                                      tickFormatter={(value) =>
                                          comparisonMetric === "revenue"
                                              ? `$${(value / 1000).toLocaleString()}k`
                                              : `${value.toFixed(0)}%`
                                      }
                                  />
                                  <Tooltip
                                      formatter={(value: number, name: string) => [
                                          comparisonMetric === "revenue"
                                              ? formatCurrency(value)
                                              : formatPercentage(value),
                                          name === "current" ? "Current" : "Previous"
                                      ]}
                                      contentStyle={{
                                          backgroundColor: "hsl(var(--background))",
                                          border: "1px solid hsl(var(--border))",
                                          borderRadius: "6px",
                                      }}
                                  />
                                  <Legend />
                                  <Bar dataKey="current" name="Current Period" fill="var(--color-current)" radius={[4, 4, 0, 0]} />
                                  <Bar dataKey="previous" name="Previous Period" fill="var(--color-previous)" radius={[4, 4, 0, 0]} />
                              </BarChart>
                           </ResponsiveContainer>
                       </ChartContainer>
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={handleGenerateReport} disabled={isHookLoading}>
                        <Download className="mr-2 h-4 w-4" />
                        Generate Report
                      </Button>
                    </div>
                  </>
                ) : (
                  <EmptyState message="Select period and metric to compare, or no comparison data available." />
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
