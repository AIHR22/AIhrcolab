"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import type { ReactNode } from "react"
import { useRevenueTrends, generateProjections, RevenueTrendData } from "./utils/revenueTrendsHelper"
import { AlertCircle, Download, RefreshCw, DollarSign, TrendingUp, EyeOff, Eye, History, X, Loader2, Users, Briefcase, CalculatorIcon, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useRevenueData } from "../../hooks/use-revenue-data";
import { useToast } from "@/components/ui/use-toast"
import { getRevenueForecast } from './api';
import { ChartContainer } from "@/components/ui/chart"
import { ChatInput } from "@/components/ui/chat-input"
import type {
  ViewMode,
  TabOption,
  ComparisonPeriod,
  ComparisonMetric,
  Department,
  SectionVisibility,
  DepartmentRevenueApiResponse,
  ChartConfig,
  CustomTooltipProps,
  CustomScenarios,
  ChatInputProps
} from "./types"

import {
  mockComparisonData,
  mockWhatIfScenarios,
  mockProjects,
  mockDepartmentData,
} from './utils';

// API Response Types
interface RevenueTrendsApiResponse {
  trends: {
    amount: number;
    date: string;
    growthRate: number;
  }[];
}

// Chart configuration
const defaultChartConfig: ChartConfig = {
  current: {
    label: 'Current Period',
    color: 'hsl(var(--chart-1))',
  },
  previous: {
    label: 'Previous Period',
    color: 'hsl(var(--chart-2))',
  },
  actual: {
    label: 'Actual',
    color: 'hsl(var(--chart-3))',
  },
  projected: {
    label: 'Projected',
    color: 'hsl(var(--chart-4))',
  },
}

// Helper functions
const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "$0";
  return `$${value.toLocaleString()}`;
};

const formatPercentage = (value: number | null | undefined, decimals = 1) => {
  if (value === null || value === undefined) return "--";
  return `${value.toFixed(decimals)}%`;
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) return null;
  
  const currentValue = payload[0].value;
  const previousValue = payload[1]?.value;
  const percentChange = previousValue ? ((currentValue - previousValue) / previousValue * 100).toFixed(1) : 'N/A';
  
  return (
    <div className="bg-white p-3 rounded-lg shadow-md border min-w-[200px]">
      <p className="font-medium mb-1">{label}</p>
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground flex justify-between">
          <span>Current:</span>
          <span className="font-medium">{formatCurrency(currentValue)}</span>
        </p>
        {previousValue && (
          <>
            <p className="text-sm text-muted-foreground flex justify-between">
              <span>Previous:</span>
              <span className="font-medium">{formatCurrency(previousValue)}</span>
            </p>
            <p className="text-sm flex justify-between">
              <span>Change:</span>
              <span className={`font-medium ${percentChange !== 'N/A' && parseFloat(percentChange) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {percentChange}%
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

// Helper functions
const replayScenario = (scenario: { id: string; date: Date; summary: string; impact: number }) => {
  // TODO: Implement scenario replay logic using existing handlers
  toast({
    title: "Replaying Scenario",
    description: `Replaying scenario from ${formatDate(scenario.date)}`,
  })
}

// Remove local type declarations since they're now imported from types.ts

function RevenueForecasting(): ReactNode {
  const { toast } = useToast()
  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('company-wide')
  const [activeTab, setActiveTab] = useState<TabOption>('current-view')
  const [history, setHistory] = useState<Array<{ id: string; date: Date; summary: string; impact: number }>>([]);
  const [viewType, setViewType] = useState<'historical' | 'forecast'>('historical');
  const [growthRateAdjustment, setGrowthRateAdjustment] = useState<number>(5.0);
  
  // Revenue trends state using the custom hook
  const { data: revenueTrendsBaseData, isLoading: isLoadingRevenueTrends, error: revenueTrendsError } = useRevenueTrends()
  
  // Calculate the final revenue trends data with projections based on growth rate
  const revenueTrendsData = useMemo(() => {
    if (!revenueTrendsBaseData || revenueTrendsBaseData.length === 0) return [];
    return generateProjections(revenueTrendsBaseData, growthRateAdjustment);
  }, [revenueTrendsBaseData, growthRateAdjustment])
  const [selectedProject, setSelectedProject] = useState<string>("") // Initialize with empty string instead of undefined
  const [comparisonPeriod, setComparisonPeriod] = useState<ComparisonPeriod>("monthly")
  const [comparisonMetric, setComparisonMetric] = useState<ComparisonMetric>("revenue")
  
  // Backend data state - Placeholder for future backend integration
  const [forecastData, setForecastData] = useState<DepartmentRevenueApiResponse | null>(null);
  const [isLoadingForecast, setIsLoadingForecast] = useState(false);
  const [forecastError, setForecastError] = useState<Error | null>(null);
  
  // Revenue projection model state
  const [employeeCount, setEmployeeCount] = useState<number>(100)
  const [averageSalary, setAverageSalary] = useState<number>(60000)
  const [revenuePerEmployee, setRevenuePerEmployee] = useState<number>(10000)
  const [growthRate, setGrowthRate] = useState<number>(5)
  const [projectionTimeframe, setProjectionTimeframe] = useState<string>("12months")
  
  // What-if scenario state
  const [employeeGrowth, setEmployeeGrowth] = useState(0)
  const [salaryChange, setSalaryChange] = useState(0)
  const [revenuePerEmployeeChange, setRevenuePerEmployeeChange] = useState(0)
  const [growthRateChange, setGrowthRateChange] = useState(0)
  const [whatIfScenarios, setWhatIfScenarios] = useState(mockWhatIfScenarios)
  const [activeScenarios, setActiveScenarios] = useState<string[]>([])
  const [customScenarios, setCustomScenarios] = useState<CustomScenarios>({
    newContracts: 0,
    attritionRate: 0,
    marketingSpend: 0,
    exchangeRate: 0,
    paymentDelay: 0,
    revenueChange: 0,
    salaryIncrease: 0
  });
  const [parsedParams, setParsedParams] = useState<Array<{name: string, label: string, value: number|string, unit: string}>>([])
  const [customImpact, setCustomImpact] = useState<number>(0)

  // Department simulator state
  const [departmentData, setDepartmentData] = useState<Department[]>(mockDepartmentData)
  const [headcountImpacts, setHeadcountImpacts] = useState<Record<string, number>>({});
  
  // UI control state
  const [isCalculating, setIsCalculating] = useState(false)
  const [isApplyingChanges, setIsApplyingChanges] = useState(false)
  const [sectionVisibility, setSectionVisibility] = useState<SectionVisibility>({
    metrics: true,
    projectionModel: true,
    revenueTrends: true,
    profitabilitySimulator: true,
    departmentRevenue: true,
    whatIfScenario: true,
    projectMetrics: false,
    departmentAllocation: false,
    projectTimeline: false,
  })

  // Use the real data hook
  const { metrics, isLoading: isHookLoading, isError: revenueError } = useRevenueData();
  
  // Effect hook to fetch data from backend API (placeholder for now)
  useEffect(() => {
    // This effect hook will be used to connect to the real backend API in the future
    const fetchForecastData = async () => {
      try {
        setIsLoadingForecast(true);
        const forecastResponse = await getRevenueForecast();
        if (viewMode === 'project-based' && selectedProject) {
          const historyResponse = await fetch(`/api/scenarios/history?project_id=${selectedProject}`);
          const historyData = await historyResponse.json();
          setHistory(historyData || []);
        }
        setForecastData(forecastResponse);
        setIsLoadingForecast(false);
      } catch (error) {
        console.error('Error fetching forecast data:', error);
        setForecastError(error instanceof Error ? error : new Error('Unknown error'));
        setIsLoadingForecast(false);
      }
    };
    
    // Call the fetch function
    fetchForecastData();
  }, [viewMode, selectedProject]);

  // Already handling forecast data elsewhere

  // State for custom scenario impact
  const [isLoadingCustomImpact, setIsLoadingCustomImpact] = useState(false);
  const [customImpactError, setCustomImpactError] = useState<Error | null>(null);
  const [isProcessingScenario, setIsProcessingScenario] = useState(false);
  const [customScenarioImpact, setCustomScenarioImpact] = useState<number | null>(null);

  // Function to fetch custom scenario impact
  const fetchCustomScenarioImpact = async (scenarios: typeof customScenarios) => {
    setIsLoadingCustomImpact(true);
    setCustomImpactError(null);
    setCustomScenarioImpact(null); // Reset impact on new calculation

    let endpoint = '';
    if (viewMode === 'company-wide') {
      endpoint = '/api/scenarios/company/custom';
    } else if (viewMode === 'project-based' && selectedProject) {
      endpoint = '/api/scenarios/project/custom';
      // Optionally include projectId if needed by the API
      // body.projectId = selectedProject.id;
    } else {
      setCustomImpactError(new Error('Invalid view mode or project not selected for custom scenario.'));
      setIsLoadingCustomImpact(false);
      return;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Assuming token-based auth, get token dynamically if possible
          // For now, using test token for development as setup in middleware
          'Authorization': `Bearer test_token` 
        },
        body: JSON.stringify(scenarios),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCustomScenarioImpact(data.impact); // Assuming the API returns { impact: number }

    } catch (err: any) {
      console.error("Error fetching custom scenario impact:", err);
      setCustomImpactError(err);
    } finally {
      setIsLoadingCustomImpact(false);
    }
  };

  // Handler for what-if scenario changes
  const handleWhatIfChange = (key: keyof typeof customScenarios, value: number) => {
    const newScenarios = {
      ...customScenarios,
      [key]: value,
    };
    setCustomScenarios(newScenarios);
    // Fetch impact immediately after state update
    fetchCustomScenarioImpact(newScenarios);
  };

  // Revenue trends data is now fetched via the useRevenueTrends hook
  // in ./utils/revenueTrendsHelper.ts;

  // Data for UI display
  const departments = departmentData;
  const departmentRevenueData = mockDepartmentData;
  const comparisonData = mockComparisonData;
  const projectsList = mockProjects;
  
  // Calculate revenue metrics using real data when available
  const monthlyRevenue = metrics?.monthly ?? (employeeCount && revenuePerEmployee ? employeeCount * revenuePerEmployee : 0);
  const annualRevenue = metrics?.annual ?? monthlyRevenue * 12;
  const projectedRevenue = metrics?.projected ?? annualRevenue * (1 + (growthRate ?? 0) / 100);
  const totalSalaries = employeeCount && averageSalary ? employeeCount * averageSalary : 0
  const profitMargin = metrics?.profitMargin ?? (annualRevenue === 0 ? 0 : ((annualRevenue - totalSalaries) / annualRevenue) * 100);
  
  // Initialize data
  useEffect(() => {
    // Revenue trends data is now fetched automatically via the useRevenueTrends hook
    // Initialize department data
    setDepartmentData(mockDepartmentData);
  }, [])
  
  // Update what-if scenarios when view mode or selected project changes
  useEffect(() => {
    if (viewMode === "project-based" && selectedProject) {
      // Load project-specific scenarios
      // TODO: Replace with actual API data when backend is connected
      setWhatIfScenarios([
        { id: "p1", name: `Project timeline delayed by 2 weeks`, impact: -85000, category: "timeline" },
        { id: "p2", name: `Resource allocation increases by 15%`, impact: -45000, category: "resource" },
        { id: "p3", name: `Client extends contract by 6 months`, impact: 180000, category: "contract" },
        { id: "p4", name: `New feature scope added to deliverables`, impact: -30000, category: "scope" },
        { id: "p5", name: `Team efficiency improves by 10%`, impact: 35000, category: "efficiency" },
      ]);
    } else {
      // Load company-wide scenarios
      setWhatIfScenarios(mockWhatIfScenarios);
    }
    
    // Reset active scenarios when context changes
    setActiveScenarios([]);
  }, [viewMode, selectedProject]);
  
  // Handlers for projection model
  const handleProjectionChange = (field: 'employeeCount' | 'averageSalary' | 'revenuePerEmployee' | 'growthRate' | 'projectionTimeframe', value: number | string) => {
  // TODO: Add backend update when connected
  switch (field) {
    case 'employeeCount':
      setEmployeeCount(Number(value) || 0)
      break
    case 'averageSalary':
      setAverageSalary(Number(value) || 0)
      break
    case 'revenuePerEmployee':
      setRevenuePerEmployee(Number(value) || 0)
      break
    case 'growthRate':
      setGrowthRate(Number(value) || 0)
      break
    case 'projectionTimeframe':
      setProjectionTimeframe(String(value))
      break
  }  }
  // Toggle scenario active state
  const toggleScenario = (scenarioId: string) => {
    setActiveScenarios(prev => 
      prev.includes(scenarioId)
        ? prev.filter(id => id !== scenarioId)
        : [...prev, scenarioId]
    );
  }

  // Calculate what-if scenario metrics
  const calculateWhatIfScenario = useMemo(() => {
    const newEmployeeCount = Math.round(employeeCount * (1 + employeeGrowth / 100));
    const newAverageSalary = averageSalary * (1 + salaryChange / 100);
    const newRevenuePerEmployee = revenuePerEmployee * (1 + revenuePerEmployeeChange / 100);
    const newGrowthRate = growthRate + growthRateChange;

    const newMonthlyRevenue = newEmployeeCount * newRevenuePerEmployee;
    const newAnnualRevenue = newMonthlyRevenue * 12;
    const newProjectedRevenue = newAnnualRevenue * (1 + newGrowthRate / 100);
    const newTotalSalaries = newEmployeeCount * newAverageSalary;
    const newProfitMargin = newAnnualRevenue === 0 ? 0 : ((newAnnualRevenue - newTotalSalaries) / newAnnualRevenue) * 100;

    return {
      employee_count: newEmployeeCount,
      average_salary: newAverageSalary,
      revenue_per_employee: newRevenuePerEmployee,
      growth_rate: newGrowthRate,
      monthlyRevenue: newMonthlyRevenue,
      annualRevenue: newAnnualRevenue,
      projectedRevenue: newProjectedRevenue,
      totalSalaries: newTotalSalaries,
      profitMargin: newProfitMargin
    };
  }, [employeeCount, averageSalary, revenuePerEmployee, growthRate, employeeGrowth, salaryChange, revenuePerEmployeeChange, growthRateChange]);

  // Calculate impact of active scenarios
  const calculateScenarioImpact = useMemo(() => {
    if (activeScenarios.length === 0) return 0;
    
    return whatIfScenarios
      .filter(scenario => activeScenarios.includes(scenario.id))
      .reduce((total, scenario) => total + scenario.impact, 0);
  }, [activeScenarios, whatIfScenarios]);

  // Calculate custom scenario impact
  const calculateCustomScenarioImpact = useMemo(() => {
    const baseRevenue = viewMode === "project-based" && selectedProject
      ? projectsList.find(p => p.id === selectedProject)?.revenue || 0
      : annualRevenue;
    
    let impact = 0;
    
    // Calculate revenue change impact (Q2 = 3 months)
    const quarterlyRevenue = baseRevenue / 4;
    impact += quarterlyRevenue * (customScenarios.revenueChange / 100) * -1;
    
    // Marketing spend impact
    const estimatedMarketingBudget = baseRevenue * 0.15; // Assume 15% of revenue is marketing
    impact += estimatedMarketingBudget * (customScenarios.marketingSpend / 100) * -1;
    
    // Exchange rate impact (assume 30% of revenue is affected by exchange rates)
    const foreignRevenue = baseRevenue * 0.3;
    impact += foreignRevenue * (customScenarios.exchangeRate / 100) * -1;
    
    // Payment delay impact (assume 5% APR cost of capital)
    const monthlyPayables = baseRevenue * 0.4 / 12; // Assume 40% of revenue goes to vendors
    impact += monthlyPayables * (customScenarios.paymentDelay / 30) * (0.05 / 12);
    
    // Salary increase impact
    impact += totalSalaries * (customScenarios.salaryIncrease / 100) * -1;
    
    return impact;
  }, [annualRevenue, totalSalaries, customScenarios, viewMode, selectedProject, projectsList]);

  // Handle apply what-if scenario
  const handleApplyWhatIfScenario = () => {
    setEmployeeCount(calculateWhatIfScenario.employee_count);
    setAverageSalary(calculateWhatIfScenario.average_salary);
    setRevenuePerEmployee(calculateWhatIfScenario.revenue_per_employee);
    setGrowthRate(calculateWhatIfScenario.growth_rate);
    
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

  // Handle scenario submission from chat
  const handleScenarioSubmit = async (scenario: string) => {
    setIsProcessingScenario(true);
    try {
      const endpoint = viewMode === 'company-wide' 
        ? '/api/scenarios/company/custom' 
        : '/api/scenarios/project/custom';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer test_token`
        },
        body: JSON.stringify({
          scenario,
          ...(viewMode === 'project-based' && selectedProject ? { projectId: selectedProject } : {})
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCustomScenarioImpact(data.impact);
      
      toast({
        title: "Scenario Processed",
        description: `Impact: ${formatCurrency(data.impact)}`,
      });
    } catch (err: any) {
      console.error("Error processing scenario:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to process scenario",
        variant: "destructive"
      });
    } finally {
      setIsProcessingScenario(false);
    }
  };

  // Handle reset what-if scenario
  const handleResetWhatIfScenario = () => {
    setEmployeeGrowth(0);
    setSalaryChange(0);
    setRevenuePerEmployeeChange(0);
    setGrowthRateChange(0);
    setCustomScenarios({
      newContracts: 0,
      attritionRate: 0,
      marketingSpend: 0,
      exchangeRate: 0,
      paymentDelay: 0,
      revenueChange: 0,
      salaryIncrease: 0
    });
    setActiveScenarios([]);
  }

  // Handle department headcount changes
  const handleHeadcountChange = (index: number, change: number) => {
    const updatedData = [...departmentData];
    const department = updatedData[index];
    const newHeadcount = department.headcount + change;

    if (newHeadcount >= 0) {
      updatedData[index] = {
        ...department,
        headcount: newHeadcount,
      };
      setDepartmentData(updatedData);

      // Calculate impacts
      // TODO: Add actual impact calculation when backend is connected
      setHeadcountImpacts(prev => ({
        ...prev,
        [department.name]: change * department.revenue_per_employee
      }));
    }
  }

  // Handle applying headcount changes
  const handleApplyChanges = () => {
    setIsApplyingChanges(true);
    // TODO: Add backend update when connected
    setTimeout(() => {
      setIsApplyingChanges(false);
      setHeadcountImpacts({});
      toast({
        title: "Changes Applied",
        description: "Headcount changes have been applied.",
      });
    }, 1000);
  }

  // Calculate total headcount impact
  const totalImpact = useMemo((): number => {
    return Object.values(headcountImpacts).reduce((total, impact) => total + (typeof impact === 'number' ? impact : 0), 0);
  }, [headcountImpacts]);

  // Generate what-if chart data
  const whatIfChartData = useMemo(() => {
    // Use real month names instead of generic Month 1, Month 2, etc.
    const date = new Date();
    const currentMonth = date.getMonth();
    const months = [];
    
    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(date.getFullYear(), currentMonth + i, 1);
      months.push(monthDate.toLocaleString('default', { month: 'short', year: 'numeric' }));
    }
    
    if (viewMode === "project-based" && selectedProject) {
      // Project-specific chart data
      const projectData = projectsList.find(p => p.id === selectedProject);
      const baseRevenue = projectData?.revenue || 0;
      const monthlyBaseRevenue = baseRevenue / 12;
      
      return months.map((month, index) => {
        // Current project trajectory (simple linear projection)
        const currentTrajectory = monthlyBaseRevenue * (1 + (index * 0.02)); // 2% monthly growth
        
        // Calculate the impact of active scenarios + custom scenarios
        const scenarioImpact = (calculateScenarioImpact + (calculateCustomScenarioImpact ?? 0)) / 12;
        const whatIfTrajectory = currentTrajectory + (scenarioImpact * (index / 11)); // Progressive impact
        
        return {
          month,
          current: currentTrajectory,
          whatIf: whatIfTrajectory
        };
      });
    } else {
      // Company-wide chart data
      return months.map((month, index) => {
        const currentTrajectory = monthlyRevenue * Math.pow(1 + growthRate / 100 / 12, index);
        const whatIfTrajectory = calculateWhatIfScenario.monthlyRevenue * 
                                 Math.pow(1 + calculateWhatIfScenario.growth_rate / 100 / 12, index);
        
        return {
          month,
          current: currentTrajectory,
          whatIf: whatIfTrajectory
        };
      });
    }
  }, [monthlyRevenue, growthRate, calculateWhatIfScenario, viewMode, selectedProject, projectsList, calculateScenarioImpact, (calculateCustomScenarioImpact ?? 0)]);

  // UI Components
  const LoadingSpinner = ({ className = "h-8 w-8" }: { className?: string }) => (
    <Loader2 className={`${className} animate-spin text-muted-foreground`} />
  )

  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex items-center justify-center h-[200px] border-2 border-dashed rounded-lg">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <p className="text-sm">{message}</p>
      </div>
    </div>
  )

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

  // Handle report generation
  const handleGenerateReport = () => {
    // TODO: Add backend integration when connected
    toast({
      title: "Report Generation",
      description: "This feature will be available when backend is connected.",
    });
  }

  return (
    <div className="container px-4 py-6 space-y-6">
      {/* Remove the floating KPI panel section */}
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Revenue Forecasting
          </h1>
          <p className="text-muted-foreground">
            Track, analyze, and project your organization's revenue trends
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => {}}>
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
                setSelectedProject(value);
                // Optionally auto-switch to appropriate tab
                if (value && activeTab !== "what-if" && activeTab !== "project-view") {
                  setActiveTab("project-view");
                }
              }}
              disabled={isHookLoading}
            >
              <SelectTrigger className="w-full sm:w-[250px]">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-projects" disabled>No projects found</SelectItem>
                {/* TODO: Replace with actual projects when backend is connected */}
                {projectsList.map(project => (
                  <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
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

      {/* Define all possible tabs */}
      {(() => {
        const allTabs = [
          { id: 'current-view', label: 'Current View' },
          { id: 'project-view', label: 'Project View' },
          { id: 'comparison', label: 'Comparison' },
          { id: 'what-if', label: 'What If' },
          { id: 'History', label: 'History' }
        ];

        // Filter tabs based on viewMode
        const tabsToShow = allTabs.filter(tab => 
          !(tab.id === 'project-view' && viewMode === 'company-wide')
        );

        return (
          <div className="flex flex-wrap gap-2 border-b border-border">
            {tabsToShow.map(tab => (
              <Button
                key={tab.id}
                variant={isActiveTab(tab.id as TabOption) ? "default" : "ghost"}
                className="relative h-9 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground transition-none hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
                onClick={() => setActiveTab(tab.id as TabOption)}
                data-state={isActiveTab(tab.id as TabOption) ? "active" : ""}
                disabled={isHookLoading}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        );
      })()}


      {revenueError && (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" /> Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">An error occurred while loading revenue data.</p>
          </CardContent>
          <CardFooter>
            <Button variant="destructive" size="sm" onClick={() => {}}>
              <RefreshCw className="mr-2 h-4 w-4" /> Retry
            </Button>
          </CardFooter>
        </Card>
      )}

      {!revenueError && (
        <>
          {activeTab === "current-view" && (
            <>
              {viewMode === "company-wide" ? (
                <>
                  <Section id="metrics" className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(monthlyRevenue)}</div>
                        <p className="text-xs text-muted-foreground flex items-center">
                          <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                          <span className="text-green-500">+{formatPercentage(metrics?._debug?.modelParams?.growth_rate ?? growthRate)}</span> projected growth
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Annual Revenue</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
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
                        <CalculatorIcon className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatPercentage(profitMargin)}</div>
                        <p className="text-xs text-muted-foreground flex items-center">After salary expenses</p>
                      </CardContent>
                    </Card>
                  </Section>

                  <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                    <Section id="projectionModel">
                      <Card>
                        <CardHeader>
                          <CardTitle>Revenue Projection Model</CardTitle>
                          <CardDescription>Adjust parameters to forecast revenue</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
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
                          <Button 
                            onClick={() => {
                              // Call API to update projections
                              fetch('/api/revenue/projections', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  employee_count: employeeCount,
                                  avg_salary: averageSalary,
                                  revenue_per_employee: revenuePerEmployee,
                                  growth_rate: growthRate / 100, // Convert to decimal
                                  timeframe_months: parseInt(projectionTimeframe.replace('months', ''))
                                }),
                              });
                              
                              toast({
                                title: "Projections Updated",
                                description: "Revenue projections have been recalculated with your parameters.",
                              });
                            }}
                            className="w-full mt-4"
                          >
                            Apply Parameters
                          </Button>
                        </CardContent>
                      </Card>
                    </Section>

                    <Section id="revenueTrends">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span>Revenue Trends</span>
                          </CardTitle>
                          <CardDescription>Actual vs. projected revenue</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {isLoadingRevenueTrends ? (
                            <div className="h-[300px] flex items-center justify-center">
                              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                          ) : revenueTrendsError ? (
                            <EmptyState message="Error loading revenue trends." />
                          ) : revenueTrendsData.length === 0 ? (
                            <EmptyState message="No revenue data available." />
                          ) : (
                            <ChartContainer
                              config={{
                                actual: {
                                  label: 'Actual',
                                  color: 'hsl(var(--chart-1))',
                                },
                                projected: {
                                  label: 'Projected',
                                  color: 'hsl(var(--chart-2))',
                                },
                              }}
                              className="h-[300px]"
                            >
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={revenueTrendsData} margin={{ top: 20, right: 30, left: 0, bottom: 30 }}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} stroke="#e2e8f0" />
                                  <XAxis 
                                    dataKey="month" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={true} 
                                    padding={{ left: 20, right: 20 }}
                                    angle={-30}
                                    textAnchor="end"
                                    height={60}
                                    tick={{ fill: '#64748b' }}
                                    stroke="#e2e8f0"
                                  />
                                  <YAxis
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={true}
                                    tickFormatter={(value) => `$${(value / 1000).toLocaleString()}k`}
                                    tick={{ fill: '#64748b' }}
                                    stroke="#e2e8f0"
                                  />
                                  <Tooltip
                                    formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                                    contentStyle={{
                                      backgroundColor: 'hsl(var(--background))',
                                      border: '1px solid hsl(var(--border))',
                                      borderRadius: '6px',
                                    }}
                                  />
                                  <Legend 
                                    verticalAlign="top" 
                                    height={36}
                                    formatter={(value) => <span style={{ color: '#64748b', fontSize: '12px' }}>{value}</span>}
                                  />
                                  <Line
                                    type="monotone"
                                    dataKey="actual"
                                    name="Actual"
                                    stroke="hsl(var(--chart-1))"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                  />
                                  <Line
                                    type="monotone"
                                    dataKey="projected"
                                    name="Projected"
                                    stroke="hsl(var(--chart-2))"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </ChartContainer>
                          )}
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
                                const impact = headcountImpacts[dept.name] ?? 0;

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
                                          disabled={dept.headcount <= 0 || isApplyingChanges}
                                        >
                                          -
                                        </Button>
                                        <span className="w-8 text-center font-medium">{dept.headcount}</span>
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
                                            {formatCurrency(impact)}
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
                      </CardContent>
                      <CardFooter className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Total Projected Impact:</span>
                          <Badge
                            variant={totalImpact === 0 ? "outline" : (totalImpact > 0 ? "default" : "destructive")}
                            className={`transition-all ${totalImpact === 0 ? "opacity-50" : ""} ${totalImpact > 0 ? "bg-green-500/20 text-green-500 hover:bg-green-500/30" : totalImpact < 0 ? "hover:bg-red-500/30" : ""}`}
                          >
                            {`${totalImpact > 0 ? "+" : ""}${formatCurrency(totalImpact)}`}
                          </Badge>
                        </div>
                        <Button onClick={handleApplyChanges} disabled={isApplyingChanges || totalImpact === 0}>
                          {isApplyingChanges && <LoadingSpinner className="mr-2 h-4 w-4" />}
                          Apply Changes
                        </Button>
                      </CardFooter>
                    </Card>
                  </Section>

                  <Section id="departmentRevenue">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle>Revenue by Department</CardTitle>
                          <CardDescription>Breakdown of revenue contribution by department</CardDescription>
                        </div>
                        {forecastData && forecastData.metrics && (
                          <div className="text-sm font-medium">
                            Total: {formatCurrency(forecastData.metrics.totalRevenue || 0)}
                          </div>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ChartContainer
                            config={{
                              current: {
                                label: 'Revenue',
                                color: 'hsl(var(--chart-1))',
                              },
                              previous: {
                                label: 'Previous Revenue',
                                color: 'hsl(var(--chart-2))',
                              },
                            }}
                            className="h-[300px]"
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              {/* When API is connected, replace this with forecastData?.departments */}
                              <BarChart 
                                data={departmentRevenueData.map(dept => ({
                                  name: dept.name,
                                  currentRevenue: dept.total_revenue,
                                  previousRevenue: dept.total_revenue * 0.9 // Simulate previous period
                                }))} 
                                layout="vertical" 
                                margin={{ top: 10, right: 25, left: 20, bottom: 10 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" opacity={0.6} />
                                <XAxis 
                                  type="number" 
                                  tickLine={false}
                                  axisLine={true}
                                  stroke="#e2e8f0"
                                  tick={{ fill: '#64748b' }}
                                  tickFormatter={(value) => `$${(value / 1000).toLocaleString()}k`}
                                  tickCount={5}
                                />
                                <YAxis
                                  dataKey="name"
                                  type="category"
                                  tickLine={false}
                                  axisLine={false}
                                  tickMargin={10}
                                  width={90}
                                  fontSize={12}
                                  tick={{ fill: '#64748b' }}
                                />
                                <Tooltip
                                  formatter={(value: number, name: string, props: any) => {
                                    // Get the department name from original data
                                    const departmentName = props.payload.name;
                                    // Match the names with the ChartConfig naming convention
                                    const displayName = name === "Current Revenue" ? "Current Revenue" : "Previous Revenue";
                                    return [formatCurrency(value), `${displayName} (${departmentName})`];
                                  }}
                                  labelFormatter={(label) => null} // Hide the category label as we're showing it in the formatter
                                  cursor={{ fill: "#f8fafc", opacity: 0.3 }}
                                  contentStyle={{
                                    backgroundColor: "white",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "6px",
                                    padding: "10px 14px",
                                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                                  }}
                                />
                                <Legend 
                                  iconType="circle"
                                  wrapperStyle={{
                                    paddingTop: "15px",
                                    paddingBottom: "5px"
                                  }}
                                  formatter={(value) => <span style={{ color: '#64748b', fontSize: '12px', marginLeft: '4px' }}>{value}</span>}
                                />
                                <Bar 
                                  dataKey="currentRevenue" 
                                  name="Current Revenue" 
                                  fill="hsl(var(--chart-1))" 
                                  radius={[0, 4, 4, 0]} 
                                  barSize={28} 
                                  animationDuration={800}
                                />
                                {/* Uncomment when previous period data is available from API */}
                                {/* <Bar 
                                  dataKey="previousRevenue" 
                                  name="Previous Revenue" 
                                  fill="hsl(var(--chart-2))" 
                                  radius={[0, 4, 4, 0]} 
                                  barSize={28}
                                  animationDuration={800} 
                                /> */}
                              </BarChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between items-center">
                        <div>
                          {isLoadingForecast ? (
                            <span className="text-sm text-muted-foreground flex items-center">
                              <LoadingSpinner className="mr-2 h-4 w-4" />
                              Loading data...
                            </span>
                          ) : forecastError ? (
                            <span className="text-sm text-red-500">
                              Error loading forecast data
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              {/* When real backend is connected, display last updated time here */}
                              Last updated: {new Date().toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <Button variant="outline">
                          <Download className="mr-2 h-4 w-4" />
                          Export Data
                        </Button>
                      </CardFooter>
                    </Card>
                  </Section>
                </>
              ) : (
                <div className="grid gap-6">
                  {selectedProject ? (
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          {projectsList.find(p => p.id === selectedProject)?.name || 'Project Details'}
                        </CardTitle>
                        <CardDescription>Project-specific revenue data</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {/* TODO: Add project-specific metrics when backend is connected */}
                        <p className="text-sm text-muted-foreground">
                          Project details will be shown here when backend is connected.
                        </p>
                      </CardContent>
                    </Card>
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
                {projectsList.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-semibold">Project Name</th>
                          <th className="text-center py-3 px-4 font-semibold">Status</th>
                          <th className="text-right py-3 px-4 font-semibold">Revenue</th>
                          <th className="text-right py-3 px-4 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projectsList.map((project) => (
                          <tr key={project.id} className="border-b hover:bg-muted/50 transition-colors">
                            <td className="py-3 px-4 font-medium">{project.name}</td>
                            <td className="text-center py-3 px-4">
                              <Badge 
                                variant={project.status === "Active" ? "default" : 
                                        project.status === "Planning" ? "secondary" : "outline"}
                              >
                                {project.status}
                              </Badge>
                            </td>
                            <td className="text-right py-3 px-4">{formatCurrency(project.revenue)}</td>
                            <td className="text-right py-3 px-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedProject(project.id);
                                  setActiveTab("what-if");
                                }}
                              >
                                What If Analysis
                              </Button>
                            </td>
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
                      <SelectTrigger>
                        <SelectValue placeholder="Select time period" />
                      </SelectTrigger>
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
                      <SelectTrigger>
                        <SelectValue placeholder="Select metric" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="growth">Growth Rate (%)</SelectItem>
                        <SelectItem value="profitability">Profitability (%)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Choose which metric to analyze</p>
                  </div>
                </div>

                <div className="h-[400px]">
                  <ChartContainer
                    config={{
                      current: {
                        label: 'Current Period',
                        color: 'hsl(var(--chart-1))',
                      },
                      previous: {
                        label: 'Previous Period',
                        color: 'hsl(var(--chart-2))',
                      },
                    } as ChartConfig}
                    className="h-[400px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparisonData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
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
                        <Bar dataKey="current" name="Current Period" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="previous" name="Previous Period" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleGenerateReport}>
                    <Download className="mr-2 h-4 w-4" />
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* What If Tab */}
          {activeTab === "what-if" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>
                    What If Scenario Builder
                    {viewMode === "project-based" && selectedProject && (
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        (Project: {projectsList.find(p => p.id === selectedProject)?.name})
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {viewMode === "project-based" && selectedProject 
                      ? "Explore the financial impact of various project scenarios" 
                      : "Explore the financial impact of various business scenarios"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold mb-2">What-If Scenario Builder</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Type in your scenario to see its projected impact on revenue
                    </p>
                    
                    <div className="space-y-4">
                      <ChatInput
                        placeholder="Type a scenario (e.g. 'raise marketing by 10% in Q3')"
                        onSend={async (text: string) => {
                          const res = await fetch('/api/scenarios/parse', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ text, viewMode, projectId: selectedProject })
                          });
                          const { parameters, impact } = await res.json();
                          setParsedParams(parameters);
                          setCustomImpact(impact);
                        }}
                      />
                      {parsedParams.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {parsedParams.map(p => (
                            <span key={p.name} className="px-2 py-1 bg-card text-card-foreground rounded">
                              {p.label}: {p.value}{p.unit}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold mb-2">Custom Scenarios</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create and test your own custom scenarios
                    </p>
                    
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="newContracts">New Contracts Signed</Label>
                            <span className="text-sm font-medium">
                              {customScenarios.newContracts.toFixed(1)}%
                            </span>
                          </div>
                          <Slider
                            id="newContracts"
                            min={0}
                            max={30}
                            step={1}
                            value={[customScenarios.newContracts]}
                            onValueChange={(value) => handleWhatIfChange('newContracts', value[0])}
                            className="transition-all"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="attritionRate">Attrition Rate</Label>
                            <span className="text-sm font-medium">
                              {customScenarios.attritionRate.toFixed(1)}%
                            </span>
                          </div>
                          <Slider
                            id="attritionRate"
                            min={0}
                            max={50}
                            step={1}
                            value={[customScenarios.attritionRate]}
                            onValueChange={(value) => handleWhatIfChange('attritionRate', value[0])}
                            className="transition-all"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="marketingSpend">Marketing Spend</Label>
                            <span className="text-sm font-medium">
                              {customScenarios.marketingSpend.toFixed(1)}%
                            </span>
                          </div>
                          <Slider
                            id="marketingSpend"
                            min={0}
                            max={20}
                            step={0.5}
                            value={[customScenarios.marketingSpend]}
                            onValueChange={(value) => handleWhatIfChange('marketingSpend', value[0])}
                            className="transition-all"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="exchangeRate">Exchange Rate</Label>
                            <span className="text-sm font-medium">
                              {customScenarios.exchangeRate.toFixed(0)}%
                            </span>
                          </div>
                          <Slider
                            id="exchangeRate"
                            min={0}
                            max={60}
                            step={1}
                            value={[customScenarios.exchangeRate]}
                            onValueChange={(value) => handleWhatIfChange('exchangeRate', value[0])}
                            className="transition-all"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="paymentDelay">Payment Delay</Label>
                            <span className="text-sm font-medium">
                              {customScenarios.paymentDelay.toFixed(0)} days
                            </span>
                          </div>
                          <Slider
                            id="paymentDelay"
                            min={0}
                            max={60}
                            step={1}
                            value={[customScenarios.paymentDelay]}
                            onValueChange={(value) => handleWhatIfChange('paymentDelay', value[0])}
                            className="transition-all"
                          />
                        </div>
                        
                        <div className="mt-8 p-4 border rounded-lg bg-muted/50">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Custom Scenario Impact:</span>
                            <Badge
                              className={cn(
                                (customScenarioImpact || 0) >= 0
                                  ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-400/10 dark:text-emerald-400"
                                  : "bg-rose-100 text-rose-800 hover:bg-rose-100 dark:bg-rose-400/10 dark:text-rose-400"
                              )}
                              variant="outline"
                            >
                              {formatCurrency(customScenarioImpact || 0)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Revenue Forecast Chart</h3>
                    <div className="h-[300px] mb-6">
                      <ChartContainer
                        config={{
                          current: {
                            label: 'Current Trajectory',
                            color: 'hsl(var(--chart-1))',
                          },
                          previous: {
                            label: 'What-If Scenario',
                            color: 'hsl(var(--chart-2))',
                          },
                        }}
                        className="h-[300px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={whatIfChartData} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={true} opacity={0.2} />
                            <XAxis 
                              dataKey="month" 
                              fontSize={12} 
                              tickLine={false} 
                              axisLine={true} 
                              padding={{ left: 10, right: 10 }}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                              label={{ value: 'Time Period', position: 'insideBottom', offset: -10 }}
                            />
                            <YAxis
                              fontSize={12}
                              tickLine={false}
                              axisLine={true}
                              tickFormatter={(value) => `$${(value / 1000).toLocaleString()}k`}
                              label={{ value: 'Revenue ($)', angle: -90, position: 'insideLeft', offset: 10 }}
                            />
                            <Tooltip
                              formatter={(value: number, name: string) => [
                                formatCurrency(value),
                                name === 'current' ? 'Current Trajectory' : 'What-If Scenario'
                              ]}
                              labelFormatter={(label) => `${label}`}
                              contentStyle={{
                                backgroundColor: "hsl(var(--background))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "6px",
                                padding: "8px 12px"
                              }}
                            />
                            <Legend verticalAlign="top" height={36} />
                            <Line
                              type="monotone"
                              dataKey="current"
                              name="Current Trajectory"
                              stroke="hsl(var(--chart-1))"
                              strokeWidth={2}
                              dot={{ r: 3 }}
                              activeDot={{ r: 6 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="whatIf"
                              name="What-If Scenario"
                              stroke="hsl(var(--chart-2))"
                              strokeWidth={2}
                              strokeDasharray="5 5"
                              dot={{ r: 3 }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  
                    <h3 className="text-lg font-semibold mb-2">Total Scenario Impact</h3>
                    <div className="p-4 border rounded-lg">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <div className="text-sm text-muted-foreground">Predefined Scenarios Impact</div>
                          <div className="text-lg font-semibold">{formatCurrency(calculateScenarioImpact)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Custom Scenarios Impact</div>
                          <div className="text-lg font-semibold">{formatCurrency((calculateCustomScenarioImpact ?? 0))}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Current Projected Revenue</div>
                          <div className="text-lg font-semibold">
                            {formatCurrency(viewMode === "project-based" && selectedProject 
                              ? (projectsList.find(p => p.id === selectedProject)?.revenue || 0)
                              : projectedRevenue)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">New Projected Revenue</div>
                          <div className="text-lg font-semibold">
                            {formatCurrency((viewMode === "project-based" && selectedProject 
                              ? (projectsList.find(p => p.id === selectedProject)?.revenue || 0)
                              : projectedRevenue) + calculateScenarioImpact + (calculateCustomScenarioImpact ?? 0))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Revenue Impact:</span>
                          <span className={`font-medium ${(calculateScenarioImpact + (calculateCustomScenarioImpact ?? 0)) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {(calculateScenarioImpact + (calculateCustomScenarioImpact ?? 0)) >= 0 ? '+' : ''}
                            {formatCurrency(calculateScenarioImpact + (calculateCustomScenarioImpact ?? 0))}
                            {' '}
                            ({(calculateScenarioImpact + (calculateCustomScenarioImpact ?? 0)) >= 0 ? '+' : ''}
                            {((calculateScenarioImpact + (calculateCustomScenarioImpact ?? 0)) / 
                              (viewMode === "project-based" && selectedProject 
                                ? (projectsList.find(p => p.id === selectedProject)?.revenue || 1)
                                : projectedRevenue || 1) * 100).toFixed(2)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={handleResetWhatIfScenario}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset All Scenarios
                  </Button>
                  <Button onClick={() => {
                    // TODO: Add backend integration when connected
                    toast({
                      title: "Scenarios Applied",
                      description: "This feature will be available when backend is connected.",
                    });
                  }}>
                    Apply Scenarios to Projections
                  </Button>
                </CardFooter>
              </Card>
            </>
          )}
          {activeTab === 'History' && (
            <div className="mt-6 p-6 bg-card rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Scenario History</h3>
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Summary</th>
                    <th className="pb-2">Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(h => (
                    <tr key={h.id} className="hover:bg-muted" onClick={() => replayScenario(h)}>
                      <td className="py-2">{formatDate(h.date)}</td>
                      <td className="py-2">{h.summary}</td>
                      <td className="py-2">{formatCurrency(h.impact)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default RevenueForecasting;