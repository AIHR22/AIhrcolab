"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { DollarSign, TrendingUp, BarChart2, Download, RefreshCw, Calculator, Users, Briefcase, Loader2, Settings2, ChevronUp, Minimize2, Maximize2, AlertCircle, BugIcon, X } from "lucide-react"
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
import { useRevenueData } from "@/hooks/useRevenueData"
import { debounce } from 'lodash'
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { RevenueDebugPanel } from "@/app/components/revenue-debug-panel"

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

// Debug mode types
interface DebugTestData {
  amount: number;
  year: number;
  month: number;
  department: string;
}

interface TableDebugInfo {
  tableName: string;
  recordCount: number;
  hasData: boolean;
  lastQuery?: string;
  error?: string;
}

// Helper functions to safely access potentially undefined properties
const getHeadcount = (dept: Department): number => dept.headcount ?? 0;
const getTotalRevenue = (dept: Department): number => dept.total_revenue ?? 0;
const getRevenuePerEmployee = (dept: Department): number => dept.revenue_per_employee ?? 0;

// Wrapper component to handle data loading and provide safeguards
export default function RevenuePage() {
  const { data: revenueData, items: revenueItems, isLoading, error } = useRevenueData();
  
  // Function to generate test data
  const handleGenerateTestData = async () => {
    try {
      const response = await fetch('/api/revenue/test-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ modelType: 'simple' })
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      
      // Reload the page to show the new data
      window.location.reload();
    } catch (err) {
      console.error('Error generating test data:', err);
      alert('Failed to generate test data. Please try again.');
    }
  };
  
  // If we're still loading, show a loading indicator
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Loading Revenue Data</h1>
        <p className="text-muted-foreground mb-8">
          Please wait while we load your revenue data. This may take a moment.
        </p>
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mb-8"></div>
        <div className="text-sm text-muted-foreground mb-4">
          If loading takes too long, you may not have any revenue data yet.
        </div>
        <Button onClick={handleGenerateTestData}>
          Generate Test Data
        </Button>
      </div>
    );
  }
  
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
          <Button variant="outline" onClick={handleGenerateTestData}>
            Generate Test Data
          </Button>
        </div>
      </div>
    );
  }
  
  // If no data was loaded at all, also show a generate data option
  if (!revenueData?.revenue || revenueData.revenue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">No Revenue Data Found</h1>
        <p className="text-muted-foreground mb-8">
          You don't have any revenue data yet. You can generate test data to see how the dashboard works.
        </p>
        <Button onClick={handleGenerateTestData}>
          Generate Test Data
        </Button>
      </div>
    );
  }
  
  // If data was loaded but there's no revenue data, show a message
  // but still render the component so user can create data
  return <RevenueForecasting />;
}

export function RevenueForecasting() {
  const [viewMode, setViewMode] = useState<ViewMode>("company-wide")
  const [activeTab, setActiveTab] = useState<TabOption>("current-view")
  const [selectedProject, setSelectedProject] = useState<string | undefined>()
  const [comparisonPeriod, setComparisonPeriod] = useState<ComparisonPeriod>("monthly")
  const [comparisonMetric, setComparisonMetric] = useState<ComparisonMetric>("revenue")

  // Local state for projection model inputs, initialized from fetched metrics
  const [employeeCount, setEmployeeCount] = useState(0)
  const [averageSalary, setAverageSalary] = useState(0)
  const [revenuePerEmployee, setRevenuePerEmployee] = useState(0)
  const [growthRate, setGrowthRate] = useState(0)
  const [projectionTimeframe, setProjectionTimeframe] = useState("12months")

  // Local state for profitability simulator
  const [departmentData, setDepartmentData] = useState<DepartmentWithHeadcount[]>([])
  const [headcountImpacts, setHeadcountImpacts] = useState<Record<string, number | null>>({})

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
  })
  const [isApplyingChanges, setIsApplyingChanges] = useState(false)

  // Debug mode state
  const [debugMode, setDebugMode] = useState(false)
  const [titleClickCount, setTitleClickCount] = useState(0)
  const [debugTestData, setDebugTestData] = useState<DebugTestData[]>([])
  const [testDataForm, setTestDataForm] = useState<DebugTestData>({
    amount: 10000,
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    department: 'Engineering'
  })
  const [debugTables, setDebugTables] = useState<TableDebugInfo[]>([
    { tableName: 'actual_revenue', recordCount: 0, hasData: false },
    { tableName: 'revenue_metrics', recordCount: 0, hasData: false },
    { tableName: 'department_revenue', recordCount: 0, hasData: false }
  ])
  const debugTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Use our custom hook for revenue data
  const revenueDataOptions = useMemo(() => ({
    fetchMode: activeTab === 'comparison' ? 'comparison' :
               activeTab === 'project-view' ? 'projectsList' :
               (viewMode === 'project-based' && selectedProject) ? 'projectDetails' :
               'main',
    departmentId: (viewMode === 'project-based' && activeTab === 'current-view') ? selectedProject : undefined,
    comparisonPeriod: activeTab === 'comparison' ? comparisonPeriod : undefined,
    comparisonMetric: activeTab === 'comparison' ? comparisonMetric : undefined,
  } as const), [activeTab, viewMode, selectedProject, comparisonPeriod, comparisonMetric]);

  const {
    data: revenueData,
    items: revenueItems,
    isLoading: isHookLoading,
    error: revenueError
  } = useRevenueData();

  // For compatibility with existing code
  const actualRevenue = revenueData?.revenue || [];
  const departments = revenueData?.departments || [];
  
  // Define types for metrics to avoid type errors
  interface RevenueMetrics {
    employee_count: number;
    average_salary: number;
    revenue_per_employee: number;
    growth_rate: number;
    projection_timeframe?: string;
  }
  
  const forecast: any[] = []; // Replace with actual forecast from your data
  const metrics: RevenueMetrics = {
    employee_count: 0,
    average_salary: 0,
    revenue_per_employee: 0,
    growth_rate: 0,
    projection_timeframe: "12months"
  }; // Default empty metrics
  const projectsList: any[] = []; // Replace with actual project list from your data
  const projectDetails: any = {}; // Replace with actual project details from your data
  const comparisonData: any = {}; // Replace with actual comparison data from your data

  // Mock functionality for compatibility with existing code
  const refetch = useCallback(async () => {
    // Implement actual refetch logic if needed
    console.log("Refetch called");
  }, []);

  const calculateHeadcountImpact = useCallback(async (changes: Record<string, number>) => {
    // Mock implementation
    console.log("Calculate headcount impact called with:", changes);
    return {
      departmentImpacts: Object.fromEntries(
        Object.entries(changes).map(([deptName, change]) => [
          deptName,
          { delta: change * 10000 } // Mock calculation
        ])
      )
    };
  }, []);

  const updateMetrics = useCallback(async (newMetrics: any) => {
    // Mock implementation
    console.log("Update metrics called with:", newMetrics);
  }, []);

  const applyHeadcountChanges = useCallback(async (changes: Record<string, number>) => {
    // Mock implementation
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
        headcount: 0, // Default value
        revenue_per_employee: 0, // Default value
        total_revenue: 0, // Default value
        newHeadcount: 0,
        impact: null
      }));
      
      setDepartmentData(compatibleDepartments);
      setHeadcountImpacts({})
    } else {
      setDepartmentData([])
    }
  }, [departments])

  // Title click handler for debug mode
  const handleTitleClick = useCallback(() => {
    if (debugTimerRef.current) {
      clearTimeout(debugTimerRef.current);
    }
    
    setTitleClickCount(prev => {
      const newCount = prev + 1;
      if (newCount === 10) {
        setDebugMode(true);
        return 0;
      }
      
      debugTimerRef.current = setTimeout(() => {
        setTitleClickCount(0);
      }, 2000);
      
      return newCount;
    });
  }, []);
  
  // Effect to cleanup timer
  useEffect(() => {
    return () => {
      if (debugTimerRef.current) {
        clearTimeout(debugTimerRef.current);
      }
    };
  }, []);
  
  // Update debug table information
  useEffect(() => {
    if (debugMode) {
      setDebugTables(prev => {
        const updated = [...prev];
        // Update actual_revenue table info
        const actualRevenueInfo = updated.find(t => t.tableName === 'actual_revenue');
        if (actualRevenueInfo) {
          actualRevenueInfo.recordCount = actualRevenue?.length || 0;
          actualRevenueInfo.hasData = actualRevenue?.length > 0;
        }
        
        // Update department_revenue table info
        const departmentRevenueInfo = updated.find(t => t.tableName === 'department_revenue');
        if (departmentRevenueInfo) {
          departmentRevenueInfo.recordCount = departments?.length || 0;
          departmentRevenueInfo.hasData = departments?.length > 0;
        }
        
        // Update revenue_metrics table info
        const metricsInfo = updated.find(t => t.tableName === 'revenue_metrics');
        if (metricsInfo) {
          metricsInfo.hasData = !!metrics;
          metricsInfo.recordCount = metrics ? 1 : 0;
        }
        
        return updated;
      });
    }
  }, [debugMode, actualRevenue, departments, metrics]);

  // Function to add a single test data entry
  const addTestDataEntry = async () => {
    try {
      // Direct injection to Supabase tables (actual_revenue)
      const response = await fetch('/api/revenue/debug/inject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: [{
            amount: testDataForm.amount,
            year: testDataForm.year,
            month: testDataForm.month,
            department: testDataForm.department
          }],
          table: 'actual_revenue'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to add test data: ${errorData.error || response.statusText}`);
      }
      
      // Add to local state for display
      setDebugTestData(prev => [...prev, testDataForm]);
      
      // Update debug tables information
      setDebugTables(prev => {
        const updated = [...prev];
        const actualRevenueInfo = updated.find(t => t.tableName === 'actual_revenue');
        if (actualRevenueInfo) {
          actualRevenueInfo.recordCount += 1;
          actualRevenueInfo.hasData = true;
        }
        return updated;
      });
      
      // Refresh the visualizations
      await refetch();
      
      // Reset form data for next entry
      setTestDataForm({
        amount: Math.floor(Math.random() * 50000) + 10000, // Random amount between 10k-60k
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        department: 'Engineering'
      });
    } catch (error: any) {
      console.error('Error adding test data:', error);
      setDebugTables(prev => {
        const updated = [...prev];
        const actualRevenueInfo = updated.find(t => t.tableName === 'actual_revenue');
        if (actualRevenueInfo) {
          actualRevenueInfo.error = error.message;
        }
        return updated;
      });
      
      // Show error notification
      toast({
        variant: "destructive",
        title: "Error adding test data",
        description: error.message,
        duration: 5000,
      });
    }
  };
  
  // Function to generate and populate test data
  const populateTestData = async () => {
    try {
      // Generate 36 data points (12 months × 3 departments)
      const testData = generateRealisticTestData();
      
      // Show notification that we're generating data
      toast({
        title: "Generating test data",
        description: `Creating ${testData.length} data points across ${new Set(testData.map(d => d.department)).size} departments`,
        duration: 3000,
      });
      
      // Direct injection to Supabase tables (all tables)
      const response = await fetch('/api/revenue/debug/inject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: testData,
          generateDepartments: true,
          table: 'all'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to populate test data: ${errorData.error || response.statusText}`);
      }
      
      // Update local state for display
      setDebugTestData(testData);
      
      // Update debug table information
      setDebugTables(prev => {
        return prev.map(table => ({
          ...table,
          hasData: true,
          recordCount: table.tableName === 'actual_revenue' ? testData.length :
                       table.tableName === 'department_revenue' ? new Set(testData.map(d => d.department)).size :
                       table.tableName === 'revenue_metrics' ? 1 : 0,
          error: undefined
        }));
      });
      
      // Refresh the visualizations
      await refetch();
      
      // Show success notification
      toast({
        title: "Test data generated",
        description: `Successfully created ${testData.length} data points with realistic patterns`,
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Error populating test data:', error);
      
      // Update error state in debug tables
      setDebugTables(prev => {
        return prev.map(table => ({
          ...table,
          error: error.message
        }));
      });
      
      // Show error notification
      toast({
        variant: "destructive",
        title: "Error generating test data",
        description: error.message,
        duration: 5000,
      });
    }
  };
  
  // Function to clear all test data
  const clearTestData = async () => {
    try {
      const response = await fetch('/api/revenue/debug/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to clear test data: ${errorData.error || response.statusText}`);
      }
      
      // Clear local state
      setDebugTestData([]);
      
      // Update debug table information
      setDebugTables(prev => {
        return prev.map(table => ({
          ...table,
          hasData: false,
          recordCount: 0,
          error: undefined
        }));
      });
      
      // Refresh visualizations
      await refetch();
      
      // Show success notification
      toast({
        title: "Test data cleared",
        description: "Successfully removed all test data from the database",
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Error clearing test data:', error);
      
      // Update error state in debug tables
      setDebugTables(prev => {
        return prev.map(table => ({
          ...table,
          error: error.message
        }));
      });
      
      // Show error notification
      toast({
        variant: "destructive",
        title: "Error clearing test data",
        description: error.message,
        duration: 5000,
      });
    }
  };
  
  // Generate realistic test data with patterns
  const generateRealisticTestData = () => {
    const data: DebugTestData[] = [];
    const now = new Date();
    const baseAmount = 50000;
    const growthRate = 0.08; // 8% growth overall
    const departments = ['Engineering', 'Marketing', 'Sales'];
    
    // Department-specific configuration
    const departmentConfigs = {
      Engineering: {
        baseMultiplier: 1.2, // Higher base revenue
        growthMultiplier: 1.5, // Faster growth
        seasonality: [1.0, 1.0, 1.0, 1.05, 1.05, 1.1, 1.0, 0.95, 1.0, 1.1, 1.15, 1.2], // End-of-year growth
        volatility: 0.03 // Lower volatility (more stable)
      },
      Marketing: {
        baseMultiplier: 0.8,
        growthMultiplier: 0.7,
        seasonality: [0.8, 0.8, 0.9, 1.0, 1.1, 1.0, 0.9, 0.9, 1.1, 1.3, 1.5, 1.4], // Strong Q4 performance
        volatility: 0.1 // Higher volatility
      },
      Sales: {
        baseMultiplier: 1.5,
        growthMultiplier: 1.0,
        seasonality: [0.9, 0.8, 1.0, 1.1, 1.2, 1.3, 1.0, 0.9, 1.0, 1.1, 1.3, 1.5], // Strong Q2 and Q4
        volatility: 0.05 // Medium volatility
      }
    };
    
    // Start from 12 months ago
    for (let i = 0; i < 12; i++) {
      const month = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      const dateStr = month.toISOString().split('T')[0];
      
      // Month number (0-11)
      const monthNum = month.getMonth();
      
      // Growth factor increases over time
      const growthFactor = 1 + (growthRate * i / 12);
      
      // Generate data for each department
      departments.forEach(department => {
        // Get department config
        const config = departmentConfigs[department as keyof typeof departmentConfigs] || {
          baseMultiplier: 1.0,
          growthMultiplier: 1.0,
          seasonality: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
          volatility: 0.05
        };
        
        // Calculate department-specific base amount
        const deptBaseAmount = baseAmount * config.baseMultiplier;
        
        // Calculate department-specific growth
        const deptGrowth = growthFactor ** config.growthMultiplier;
        
        // Apply seasonal factor for this month
        const seasonalFactor = config.seasonality[monthNum];
        
        // Add random volatility
        const volatility = 1 + ((Math.random() * 2 - 1) * config.volatility);
        
        // Calculate final amount
        const amount = Math.round(deptBaseAmount * deptGrowth * seasonalFactor * volatility);
        
        data.push({
          amount,
          year: month.getFullYear(),
          month: month.getMonth() + 1,
          department
        });
      });
    }
    
    return data;
  };

  // Debounced handler for updating metrics via API
  const debouncedUpdateMetrics = useCallback(
    debounce(async (newData) => {
      try {
        await updateMetrics(newData)
      } catch (err) {
        console.error("Failed to update metrics:", err)
      }
    }, 1000),
    [updateMetrics]
  )

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

    debouncedUpdateMetrics(updatedMetrics)
  }

  // Debounced handler for calculating headcount impact
  const debouncedCalculateImpact = useCallback(
    debounce(async (changes: Record<string, number>) => {
      if (Object.values(changes).some(change => change !== 0)) {
          try {
              const impactResult = await calculateHeadcountImpact(changes)
              if (impactResult?.departmentImpacts) {
                  setHeadcountImpacts(prev => {
                      const newImpacts = { ...prev };
                      Object.entries(impactResult.departmentImpacts).forEach(([deptName, impactData]: [string, any]) => {
                          newImpacts[deptName] = impactData.delta;
                      });
                      return newImpacts;
                  })
              }
          } catch (err) {
              console.error("Failed to calculate headcount impact:", err)
          }
      }
    }, 500),
    [calculateHeadcountImpact]
  )

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
        const originalHeadcount = departments.find(d => d.id === dept.id)?.headcount || 0
        acc[dept.name] = dept.newHeadcount - originalHeadcount
        return acc
      }, {} as Record<string, number>)

      debouncedCalculateImpact(departmentChangesForImpact)
    }
  }

  // Handle apply changes button
  const handleApplyChanges = async () => {
    setIsApplyingChanges(true)
    try {
      const departmentChangesToApply = departmentData.reduce((acc, dept) => {
        const originalHeadcount = departments.find(d => d.id === dept.id)?.headcount || 0
        const diff = dept.newHeadcount - originalHeadcount
        if (diff !== 0) {
          acc[dept.name] = diff
        }
        return acc
      }, {} as Record<string, number>)

      if (Object.keys(departmentChangesToApply).length > 0) {
          await applyHeadcountChanges(departmentChangesToApply)
          setHeadcountImpacts({})
      } else {
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
          const response = await fetch('/api/revenue/generate-report', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(reportPayload)
          });

          if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Failed to generate report. Status: ${response.status}. ${errorText}`);
          }

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          const contentDisposition = response.headers.get('content-disposition');
          let filename = `revenue-report-${new Date().toISOString()}.json`;
          if (contentDisposition) {
              const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
              if (filenameMatch && filenameMatch.length > 1) {
                  filename = filenameMatch[1];
              }
          }
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
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

  const totalImpact = useMemo(() => {
      return departmentData.reduce((sum, dept) => {
        const impact = headcountImpacts[dept.name] ?? 0;
        return sum + impact;
    }, 0);
  }, [departmentData, headcountImpacts]);

  const chartData = useMemo(() => {
    interface MonthMapData {
      monthLabel: string;
      actual: number | null;
      projected: number | null;
    }
    
    const monthMap = new Map<string, MonthMapData>();
    
    // Add null check to prevent undefined.forEach error
    if (!actualRevenue) return [];
    
    actualRevenue.forEach(item => {
        const date = new Date(item.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        
        monthMap.set(monthKey, {
          monthLabel,
          actual: item.amount,
          projected: null
        });
    });
    
    // Process forecast data if available
    if (forecast && forecast.length > 0) {
      forecast.forEach(item => {
        let monthKey = '';
        let monthLabel = '';

        try {
            // Handle different formats coming from the API
            if (item.monthKey) {
                monthKey = item.monthKey;
                monthLabel = item.monthLabel || item.month || '';
            } else if (item.month) {
                const date = new Date(item.month);
                if (!isNaN(date.getTime())) {
                    monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    monthLabel = date.toLocaleString('default', { month: 'short', year: 'numeric' });
                } else {
                    console.warn(`Could not parse forecast month: ${item.month}`);
                    return;
                }
            } else {
                console.warn('Forecast item missing month data');
                return;
            }
        } catch (e) {
            console.warn(`Error parsing forecast month:`, e);
            return;
        }

        if (!monthMap.has(monthKey)) {
            monthMap.set(monthKey, { 
                monthLabel, 
                actual: null, 
                projected: null 
            });
        }
        
        const entry = monthMap.get(monthKey);
        if (entry) {
            entry.projected = item.projected || null;
            
            // Only set actual if it's not already set and we have a value
            if (entry.actual === null && item.actual !== undefined && item.actual !== null) {
                entry.actual = item.actual;
            }
        }
    });
    }

    const sortedEntries = Array.from(monthMap.entries()).sort((a, b) => {
        return a[0].localeCompare(b[0]);
    });

    const limitedEntries = sortedEntries.slice(-12);

    return limitedEntries.map(([key, values]) => ({ 
        month: values.monthLabel, 
        actual: values.actual, 
        projected: values.projected 
    }));
  }, [actualRevenue, forecast]);

  const departmentChartData = useMemo(() => {
    return departments
        .map(dept => ({
            department: dept.name,
            revenue: dept.total_revenue || 0
        }))
        .sort((a, b) => b.revenue - a.revenue);
  }, [departments]);

  const comparisonChartData = useMemo(() => {
    if (!comparisonData || !Array.isArray(comparisonData)) return [];
    return comparisonData.map((item: any) => ({
        period: item.period,
        current: item.current || 0,
        previous: item.previous || 0,
    }));
  }, [comparisonData]);

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
          <h1 className="text-3xl font-bold tracking-tight cursor-pointer" 
             onClick={handleTitleClick}>
            Revenue Forecasting
            {titleClickCount > 0 && titleClickCount < 10 && (
              <span className="ml-2 text-xs text-gray-400">{titleClickCount}</span>
            )}
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

      {/* Debug Panel */}
      {debugMode && (
        <RevenueDebugPanel 
          onClose={() => setDebugMode(false)}
          onRefresh={async () => await refetch()}
          actualRevenue={actualRevenue || []}
          departments={departments || []}
          metrics={metrics}
        />
      )}

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
                              {/* ... Project Monthly Revenue ... */}
                           </Card>
                           <Card>
                               {/* ... Project Annual Revenue ... */}
                           </Card>
                            {/* ... etc using projectDetails */}
                       </Section>
                       <Section id="departmentAllocation" className="overflow-x-auto">
                           <Card>
                              {/* ... Allocation Table using projectDetails.departments ... */}
                           </Card>
                       </Section>
                       <Section id="projectTimeline">
                           <Card>
                              {/* ... Project Timeline Chart using projectDetails.timeline ... */}
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

