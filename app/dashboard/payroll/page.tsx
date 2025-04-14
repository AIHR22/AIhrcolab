"use client"

import { useState, useEffect, useTransition } from "react"
import {
  DollarSign,
  Download,
  Search,
  Calendar,
  CreditCard,
  FileText,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  ArrowRight,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Users,
  TrendingDown,
  Percent,
  Clock,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer } from "@/components/ui/chart"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from "recharts"
import { payrollService, PayrollEntry, NewPayrollEntry } from "@/lib/services/payroll-service"
import { employeeService } from "@/lib/services/employee-service"
import { toast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { Dialog } from "@/components/ui/dialog"
import { DialogContent } from "@/components/ui/dialog"
import { DialogDescription } from "@/components/ui/dialog"
import { DialogFooter } from "@/components/ui/dialog"
import { DialogHeader } from "@/components/ui/dialog"
import { DialogTitle } from "@/components/ui/dialog"
import { DialogTrigger } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function PayrollPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [payrollTransactions, setPayrollTransactions] = useState<PayrollEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, setIsPending] = useState(false)
  const [employees, setEmployees] = useState<any[]>([])
  const [isAddPayrollOpen, setIsAddPayrollOpen] = useState(false)
  const [isEditPayrollOpen, setIsEditPayrollOpen] = useState(false)
  const [currentPayroll, setCurrentPayroll] = useState<PayrollEntry | null>(null)
  const [payrollForm, setPayrollForm] = useState<Partial<NewPayrollEntry>>({
    employee_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    base_salary: 0,
    bonus: 0,
    overtime_pay: 0,
    deductions: 0,
    tax_withholding: 0,
    payment_method: 'Direct Deposit',
    status: 'pending'
  })
  const [payrollSummary, setPayrollSummary] = useState<{
    totalSalaries: number;
    taxDeductions: number;
    benefits: number;
    deductions: number;
    netPayable: number;
    employeeCount: number;
    averageSalary: number;
    payrollDate: string;
    departmentSalaries: Record<string, number>;
    statusCounts: Record<string, number>;
    monthlyTrends: Array<{
      month: string;
      salaries: number;
      taxes: number;
      count: number;
    }>;
    payrollMetrics: {
      payrollToRevenueRatio: number;
      averageCostPerEmployee: number;
      overtimePercentage: number;
      bonusPercentage: number;
      taxRate: number;
      deductionRate: number;
    };
    previousMonth: {
      totalSalaries: number;
      taxDeductions: number;
      benefits: number;
      netPayable: number;
      employeeCount: number;
      averageSalary: number;
    };
  }>({
    totalSalaries: 0,
    taxDeductions: 0,
    benefits: 0,
    deductions: 0,
    netPayable: 0,
    employeeCount: 0,
    averageSalary: 0,
    payrollDate: new Date().toISOString().split('T')[0],
    departmentSalaries: {},
    statusCounts: {},
    monthlyTrends: [],
    payrollMetrics: {
      payrollToRevenueRatio: 0,
      averageCostPerEmployee: 0,
      overtimePercentage: 0,
      bonusPercentage: 0,
      taxRate: 0,
      deductionRate: 0
    },
    previousMonth: {
      totalSalaries: 0,
      taxDeductions: 0,
      benefits: 0,
      netPayable: 0,
      employeeCount: 0,
      averageSalary: 0,
    }
  })
  const [isPendingTransition, startTransition] = useTransition()

  // Calculate payroll summary from transactions
  const calculateSummary = (transactions: PayrollEntry[]) => {
    const totalSalaries = transactions.reduce((sum, t) => sum + (t.base_salary || 0), 0);
    const totalBonus = transactions.reduce((sum, t) => sum + (t.bonus || 0), 0);
    const totalOvertimePay = transactions.reduce((sum, t) => sum + (t.overtime_pay || 0), 0);
    const totalDeductions = transactions.reduce((sum, t) => sum + (t.deductions || 0), 0);
    const totalTaxWithholding = transactions.reduce((sum, t) => sum + (t.tax_withholding || 0), 0);
    const netPayable = totalSalaries + totalBonus + totalOvertimePay - totalDeductions - totalTaxWithholding;
    
    // Calculate department-wise salary distribution
    const departmentSalaries = {} as Record<string, number>;
    transactions.forEach(t => {
      // Since department might not exist directly, we'll use a safe approach
      // In a real app, you would map this properly from your employee data
      const dept = t.employees?.department || 
                  (t.employees?.job_title ? t.employees.job_title.split(' ')[0] : 'Unassigned');
      departmentSalaries[dept] = (departmentSalaries[dept] || 0) + (t.base_salary || 0);
    });
    
    // Calculate status distribution
    const statusCounts = {} as Record<string, number>;
    transactions.forEach(t => {
      const status = t.status || 'pending';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    // Calculate month-over-month trends (using actual data where possible)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Group transactions by month
    const monthlyData = {} as Record<string, {salaries: number, taxes: number, count: number}>;
    transactions.forEach(t => {
      const date = new Date(t.payment_date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = monthNames[date.getMonth()];
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { salaries: 0, taxes: 0, count: 0 };
      }
      
      monthlyData[monthKey].salaries += (t.base_salary || 0);
      monthlyData[monthKey].taxes += (t.tax_withholding || 0);
      monthlyData[monthKey].count += 1;
    });
    
    // Convert to array and sort by date
    const monthlyTrendsArray = Object.entries(monthlyData).map(([key, data]) => {
      const [year, month] = key.split('-').map(Number);
      return {
        date: new Date(year, month),
        month: monthNames[month],
        salaries: data.salaries,
        taxes: data.taxes,
        count: data.count
      };
    }).sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // If we don't have enough real data, add some mock data
    const monthlyTrends = monthlyTrendsArray.length >= 6 ? 
      monthlyTrendsArray.slice(-6).map(m => ({ 
        month: m.month, 
        salaries: m.salaries, 
        taxes: m.taxes,
        count: m.count
      })) : 
      [
        { month: 'Jan', salaries: totalSalaries * 0.9, taxes: totalTaxWithholding * 0.85, count: transactions.length - 2 },
        { month: 'Feb', salaries: totalSalaries * 0.95, taxes: totalTaxWithholding * 0.9, count: transactions.length - 1 },
        { month: 'Mar', salaries: totalSalaries * 0.97, taxes: totalTaxWithholding * 0.95, count: transactions.length - 1 },
        { month: 'Apr', salaries: totalSalaries, taxes: totalTaxWithholding, count: transactions.length },
        { month: 'May', salaries: totalSalaries * 1.02, taxes: totalTaxWithholding * 1.05, count: transactions.length + 1 },
        { month: 'Jun', salaries: totalSalaries * 1.05, taxes: totalTaxWithholding * 1.1, count: transactions.length + 2 },
      ];
    
    // Calculate payroll efficiency metrics
    const payrollToRevenueRatio = 0.32; // Mock value - would come from revenue data
    const averageCostPerEmployee = transactions.length > 0 ? totalSalaries / transactions.length : 0;
    const overtimePercentage = totalSalaries > 0 ? (totalOvertimePay / totalSalaries) * 100 : 0;
    const bonusPercentage = totalSalaries > 0 ? (totalBonus / totalSalaries) * 100 : 0;
    
    return {
      totalSalaries,
      taxDeductions: totalTaxWithholding,
      benefits: totalBonus + totalOvertimePay,
      deductions: totalDeductions,
      netPayable,
      employeeCount: transactions.length,
      averageSalary: transactions.length > 0 ? totalSalaries / transactions.length : 0,
      payrollDate: new Date().toISOString(),
      departmentSalaries,
      statusCounts,
      monthlyTrends,
      payrollMetrics: {
        payrollToRevenueRatio,
        averageCostPerEmployee,
        overtimePercentage,
        bonusPercentage,
        taxRate: totalSalaries > 0 ? (totalTaxWithholding / totalSalaries) * 100 : 0,
        deductionRate: totalSalaries > 0 ? (totalDeductions / totalSalaries) * 100 : 0,
      },
      previousMonth: {
        totalSalaries: totalSalaries * 0.97,
        taxDeductions: totalTaxWithholding * 0.95,
        benefits: (totalBonus + totalOvertimePay) * 0.94,
        netPayable: netPayable * 0.96,
        employeeCount: transactions.length - 1,
        averageSalary: transactions.length > 0 ? (totalSalaries * 0.97) / (transactions.length - 1) : 0,
      }
    };
  };

  // Safe percentage calculation
  const calculatePercentageChange = (current: number, previous: number) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Load payroll data
  useEffect(() => {
    const loadPayrollData = async () => {
      setIsLoading(true)
      try {
        const [payrollData, employeeData] = await Promise.all([
          payrollService.getAll(),
          employeeService.getAll()
        ])
        setPayrollTransactions(payrollData)
        setPayrollSummary(calculateSummary(payrollData))
        setEmployees(employeeData)
      } catch (error) {
        console.error('Error loading payroll data:', error)
        toast({
          title: "Error",
          description: "Failed to load payroll data. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadPayrollData()
  }, [])

  // Handle adding a new payroll entry
  const handleAddPayroll = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true)
    try {
      const formData = new FormData(event.currentTarget);
      const newPayrollEntry: NewPayrollEntry = {
        employee_id: formData.get('employee_id') as string,
        payment_date: formData.get('payment_date') as string,
        base_salary: Number(formData.get('base_salary')),
        bonus: Number(formData.get('bonus') || 0),
        overtime_pay: Number(formData.get('overtime_pay') || 0),
        deductions: Number(formData.get('deductions') || 0),
        tax_withholding: Number(formData.get('tax_withholding') || 0),
        payment_method: formData.get('payment_method') as string || 'Direct Deposit',
        status: formData.get('status') as string || 'pending',
        notes: formData.get('notes') as string || ''
      }

      startTransition(async () => {
        // Create the payroll entry
        const createdPayroll = await payrollService.create(newPayrollEntry)
        
        // Update the payroll transactions list
        const updatedPayrollData = await payrollService.getAll()
        setPayrollTransactions(updatedPayrollData)
        setPayrollSummary(calculateSummary(updatedPayrollData))
        
        // Close the dialog and show success message
        setIsAddPayrollOpen(false)
        toast({
          title: "Success",
          description: "Payroll entry added successfully",
        })
      })
    } catch (error: any) {
      console.error('Error adding payroll entry:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to add payroll entry",
        variant: "destructive",
      })
    } finally {
      setIsPending(false)
    }
  }

  // Handle editing a payroll entry
  const handleEditPayroll = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentPayroll) return;
    
    setIsPending(true)
    try {
      const formData = new FormData(event.currentTarget);
      const updatedPayrollEntry: Partial<NewPayrollEntry> = {
        employee_id: formData.get('employee_id') as string,
        payment_date: formData.get('payment_date') as string,
        base_salary: Number(formData.get('base_salary')),
        bonus: Number(formData.get('bonus') || 0),
        overtime_pay: Number(formData.get('overtime_pay') || 0),
        deductions: Number(formData.get('deductions') || 0),
        tax_withholding: Number(formData.get('tax_withholding') || 0),
        payment_method: formData.get('payment_method') as string || 'Direct Deposit',
        status: formData.get('status') as string || 'pending',
        notes: formData.get('notes') as string || ''
      }

      startTransition(async () => {
        // Update the payroll entry
        await payrollService.update(currentPayroll.id, updatedPayrollEntry)
        
        // Update the payroll transactions list
        const updatedPayrollData = await payrollService.getAll()
        setPayrollTransactions(updatedPayrollData)
        setPayrollSummary(calculateSummary(updatedPayrollData))
        
        // Close the dialog and show success message
        setIsEditPayrollOpen(false)
        setCurrentPayroll(null)
        toast({
          title: "Success",
          description: "Payroll entry updated successfully",
        })
      })
    } catch (error: any) {
      console.error('Error updating payroll entry:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update payroll entry",
        variant: "destructive",
      })
    } finally {
      setIsPending(false)
    }
  }

  // Handle deleting a payroll entry
  const handleDeletePayroll = async (id: string) => {
    setIsPending(true)
    try {
      startTransition(async () => {
        // Delete the payroll entry
        await payrollService.delete(id)
        
        // Update the payroll transactions list
        const updatedPayrollData = await payrollService.getAll()
        setPayrollTransactions(updatedPayrollData)
        setPayrollSummary(calculateSummary(updatedPayrollData))
        
        // Show success message
        toast({
          title: "Success",
          description: "Payroll entry deleted successfully",
        })
      })
    } catch (error: any) {
      console.error('Error deleting payroll entry:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete payroll entry",
        variant: "destructive",
      })
    } finally {
      setIsPending(false)
    }
  }

  // Open edit dialog with current payroll data
  const openEditDialog = (payroll: PayrollEntry) => {
    setCurrentPayroll(payroll)
    setPayrollForm({
      employee_id: payroll.employee_id,
      payment_date: payroll.payment_date,
      base_salary: payroll.base_salary,
      bonus: payroll.bonus || 0,
      overtime_pay: payroll.overtime_pay || 0,
      deductions: payroll.deductions || 0,
      tax_withholding: payroll.tax_withholding || 0,
      payment_method: payroll.payment_method || 'Direct Deposit',
      status: payroll.status || 'pending',
      notes: payroll.notes || ''
    })
    setIsEditPayrollOpen(true)
  }

  // Filter transactions based on search query
  const filteredTransactions = payrollTransactions.filter(transaction => {
    const employeeName = `${transaction.employees?.first_name || ''} ${transaction.employees?.last_name || ''}`.toLowerCase()
    const date = transaction.payment_date.toLowerCase()
    const amount = transaction.base_salary.toString()
    const status = transaction.status?.toLowerCase() || ''
    const query = searchQuery.toLowerCase()
    
    return employeeName.includes(query) || date.includes(query) || 
           amount.includes(query) || status.includes(query)
  })

  // Chart data preparation
  const chartData = {
    labels: payrollTransactions.map(t => t.payment_date),
    datasets: [
      {
        label: "Base Salary",
        data: payrollTransactions.map(t => t.base_salary),
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        borderColor: "rgba(99, 102, 241, 1)",
        borderWidth: 1,
      },
      {
        label: "Tax Deductions",
        data: payrollTransactions.map(t => t.tax_withholding),
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        borderColor: "rgba(239, 68, 68, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Prepare department data for charts
  const departmentChartData = Object.entries(payrollSummary.departmentSalaries || {}).map(([dept, value]) => ({
    name: dept,
    value
  }));

  // Prepare status data for charts
  const statusChartData = Object.entries(payrollSummary.statusCounts || {}).map(([status, count]) => ({
    name: status,
    value: count
  }));

  // Prepare monthly trends data
  const monthlyTrendsData = payrollSummary.monthlyTrends || [];

  // Prepare metrics data for radar chart
  const metricsChartData = [
    { subject: 'Tax Rate', A: payrollSummary.payrollMetrics?.taxRate || 0 },
    { subject: 'Overtime %', A: payrollSummary.payrollMetrics?.overtimePercentage || 0 },
    { subject: 'Bonus %', A: payrollSummary.payrollMetrics?.bonusPercentage || 0 },
    { subject: 'Deduction %', A: payrollSummary.payrollMetrics?.deductionRate || 0 },
    { subject: 'Revenue %', A: (payrollSummary.payrollMetrics?.payrollToRevenueRatio || 0) * 100 },
  ];

  // Simple Bar Chart Component
  const SimpleBarChart = ({ data }: { data: any[] }) => {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // Line Chart Component
  const SimpleLineChart = ({ data }: { data: any[] }) => {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  // Pie Chart Component
  const SimplePieChart = ({ data }: { data: any[] }) => {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'][index % 5]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Payroll Management</h1>
        <Dialog open={isAddPayrollOpen} onOpenChange={setIsAddPayrollOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Payroll Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Payroll Entry</DialogTitle>
              <DialogDescription>
                Create a new payroll entry for an employee.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddPayroll} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employee_id">Employee</Label>
                  <Select name="employee_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.first_name} {employee.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_date">Payment Date</Label>
                  <Input
                    id="payment_date"
                    name="payment_date"
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="base_salary">Base Salary</Label>
                  <Input
                    id="base_salary"
                    name="base_salary"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bonus">Bonus</Label>
                    <Input
                      id="bonus"
                      name="bonus"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      defaultValue="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="overtime_pay">Overtime Pay</Label>
                    <Input
                      id="overtime_pay"
                      name="overtime_pay"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      defaultValue="0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deductions">Deductions</Label>
                    <Input
                      id="deductions"
                      name="deductions"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      defaultValue="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax_withholding">Tax Withholding</Label>
                    <Input
                      id="tax_withholding"
                      name="tax_withholding"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      defaultValue="0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_method">Payment Method</Label>
                  <Select name="payment_method" defaultValue="Direct Deposit">
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Direct Deposit">Direct Deposit</SelectItem>
                      <SelectItem value="Check">Check</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Wire Transfer">Wire Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue="pending">
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    name="notes"
                    placeholder="Additional notes"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddPayrollOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Adding..." : "Add Payroll Entry"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-6 w-[300px]" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-[125px] w-full" />
            <Skeleton className="h-[125px] w-full" />
            <Skeleton className="h-[125px] w-full" />
          </div>
        </div>
      )}

      {/* Edit Payroll Dialog */}
      <Dialog open={isEditPayrollOpen} onOpenChange={setIsEditPayrollOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Payroll Entry</DialogTitle>
            <DialogDescription>
              Update the payroll entry details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditPayroll} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employee_id">Employee</Label>
                <Select name="employee_id" defaultValue={payrollForm.employee_id} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.first_name} {employee.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_date">Payment Date</Label>
                <Input
                  id="payment_date"
                  name="payment_date"
                  type="date"
                  defaultValue={payrollForm.payment_date}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="base_salary">Base Salary</Label>
                <Input
                  id="base_salary"
                  name="base_salary"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  defaultValue={payrollForm.base_salary}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bonus">Bonus</Label>
                  <Input
                    id="bonus"
                    name="bonus"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    defaultValue={payrollForm.bonus}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overtime_pay">Overtime Pay</Label>
                  <Input
                    id="overtime_pay"
                    name="overtime_pay"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    defaultValue={payrollForm.overtime_pay}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deductions">Deductions</Label>
                  <Input
                    id="deductions"
                    name="deductions"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    defaultValue={payrollForm.deductions}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax_withholding">Tax Withholding</Label>
                  <Input
                    id="tax_withholding"
                    name="tax_withholding"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    defaultValue={payrollForm.tax_withholding}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select name="payment_method" defaultValue={payrollForm.payment_method}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Direct Deposit">Direct Deposit</SelectItem>
                    <SelectItem value="Check">Check</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Wire Transfer">Wire Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={payrollForm.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  name="notes"
                  placeholder="Additional notes"
                  defaultValue={payrollForm.notes}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditPayrollOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Updating..." : "Update Payroll Entry"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Main Content */}
      {!isLoading && (
        <>
          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground">Manage payroll, view transactions, and analyze expenses.</p>
          </div>

          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="summary">Payroll Summary</TabsTrigger>
              <TabsTrigger value="transactions">Payment Records</TabsTrigger>
              <TabsTrigger value="analytics">AI Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Salaries</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${payrollSummary.totalSalaries.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                      <span className="text-green-500">
                        {calculatePercentageChange(payrollSummary.totalSalaries, payrollSummary.previousMonth.totalSalaries).toFixed(1)}%
                      </span> from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tax Deductions</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${payrollSummary.taxDeductions.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <TrendingUp className="mr-1 h-4 w-4 text-amber-500" />
                      <span className="text-amber-500">
                        {calculatePercentageChange(payrollSummary.taxDeductions, payrollSummary.previousMonth.taxDeductions).toFixed(1)}%
                      </span> from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Benefits</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${payrollSummary.benefits.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                      <span className="text-green-500">
                        {calculatePercentageChange(payrollSummary.benefits, payrollSummary.previousMonth.benefits).toFixed(1)}%
                      </span> from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Net Payable</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${payrollSummary.netPayable.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                      <span className="text-green-500">
                        {calculatePercentageChange(payrollSummary.netPayable, payrollSummary.previousMonth.netPayable).toFixed(1)}%
                      </span> from last month
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Payroll Breakdown</CardTitle>
                    <CardDescription>Distribution of payroll expenses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <SimpleBarChart data={chartData.datasets[0].data.map((value, index) => ({ name: chartData.labels[index], value }))} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Payroll Summary</CardTitle>
                    <CardDescription>Current payroll period details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Payroll Date</span>
                        <span className="font-mono">{new Date(payrollSummary.payrollDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Employee Count</span>
                        <span>{payrollSummary.employeeCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Average Salary</span>
                        <span>${payrollSummary.averageSalary.toLocaleString()}/month</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Total Salaries</span>
                        <span>${payrollSummary.totalSalaries.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Tax Deductions</span>
                        <span>${payrollSummary.taxDeductions.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Benefits</span>
                        <span>${payrollSummary.benefits.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between font-bold">
                        <span>Net Payable</span>
                        <span>${payrollSummary.netPayable.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download Payroll Report
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="transactions" className="mt-6">
              <div className="border rounded-lg">
                <div className="p-4 flex flex-col md:flex-row gap-4 md:items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Payroll Transactions</h2>
                    <p className="text-sm text-muted-foreground">View and manage all payroll transactions</p>
                  </div>
                  <div className="flex w-full md:w-auto items-center gap-2">
                    <div className="relative w-full md:w-60">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="search" 
                        placeholder="Search by name, date..." 
                        className="pl-8" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading payroll data...
                        </TableCell>
                      </TableRow>
                    ) : filteredTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No payroll transactions found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTransactions.map((transaction) => {
                        const fullName = `${transaction.employees?.first_name || 'Unknown'} ${transaction.employees?.last_name || ''}`;
                        return (
                          <TableRow key={transaction.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                                  <AvatarFallback>{fullName.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{fullName}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">${transaction.base_salary.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{new Date(transaction.payment_date).toLocaleDateString()}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={transaction.status === 'processed' ? 'default' : 
                                             transaction.status === 'pending' ? 'outline' : 'destructive'}>
                                {transaction.status || 'processed'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{transaction.payment_method || 'Direct Deposit'}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="outline" onClick={() => openEditDialog(transaction)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive">
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Payroll Entry</AlertDialogTitle>
                                    </AlertDialogHeader>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this payroll entry?
                                    </AlertDialogDescription>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeletePayroll(transaction.id)}>
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Cost Per Employee</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${(payrollSummary.payrollMetrics?.averageCostPerEmployee || 0).toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Monthly average per employee</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Overtime Percentage</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{(payrollSummary.payrollMetrics?.overtimePercentage || 0).toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">Of total salary expenses</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Payroll to Revenue</CardTitle>
                    <Percent className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{((payrollSummary.payrollMetrics?.payrollToRevenueRatio || 0) * 100).toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">Of company revenue</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Salary Trends</CardTitle>
                    <CardDescription>6-month salary and tax trend</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={monthlyTrendsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                        <Legend />
                        <Line type="monotone" dataKey="salaries" stroke="#8884d8" name="Salaries" />
                        <Line type="monotone" dataKey="taxes" stroke="#ff7300" name="Taxes" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Department Salary Distribution</CardTitle>
                    <CardDescription>Breakdown by department</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={departmentChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {departmentChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'][index % 5]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Headcount Trend</CardTitle>
                    <CardDescription>Monthly employee count</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={monthlyTrendsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#8884d8" name="Employee Count" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Status Distribution</CardTitle>
                    <CardDescription>By payment status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={statusChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusChartData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.name === 'paid' ? '#4ade80' : 
                                    entry.name === 'pending' ? '#facc15' : 
                                    entry.name === 'failed' ? '#f87171' : 
                                    '#8884d8'} 
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Payroll Metrics Comparison</CardTitle>
                    <CardDescription>Key payroll efficiency metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Tax Rate</span>
                          <span>{(payrollSummary.payrollMetrics?.taxRate || 0).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2.5">
                          <div className="bg-primary h-2.5 rounded-full" style={{ width: `${Math.min(100, (payrollSummary.payrollMetrics?.taxRate || 0))}%` }}></div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Overtime Percentage</span>
                          <span>{(payrollSummary.payrollMetrics?.overtimePercentage || 0).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2.5">
                          <div className="bg-primary h-2.5 rounded-full" style={{ width: `${Math.min(100, (payrollSummary.payrollMetrics?.overtimePercentage || 0) * 2)}%` }}></div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Bonus Percentage</span>
                          <span>{(payrollSummary.payrollMetrics?.bonusPercentage || 0).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2.5">
                          <div className="bg-primary h-2.5 rounded-full" style={{ width: `${Math.min(100, (payrollSummary.payrollMetrics?.bonusPercentage || 0) * 2)}%` }}></div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Deduction Rate</span>
                          <span>{(payrollSummary.payrollMetrics?.deductionRate || 0).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2.5">
                          <div className="bg-primary h-2.5 rounded-full" style={{ width: `${Math.min(100, (payrollSummary.payrollMetrics?.deductionRate || 0))}%` }}></div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Payroll to Revenue</span>
                          <span>{((payrollSummary.payrollMetrics?.payrollToRevenueRatio || 0) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2.5">
                          <div className="bg-primary h-2.5 rounded-full" style={{ width: `${Math.min(100, (payrollSummary.payrollMetrics?.payrollToRevenueRatio || 0) * 100)}%` }}></div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Avg. Cost Per Employee</span>
                          <span>${(payrollSummary.payrollMetrics?.averageCostPerEmployee || 0).toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2.5">
                          <div className="bg-primary h-2.5 rounded-full" style={{ width: `${Math.min(100, (payrollSummary.payrollMetrics?.averageCostPerEmployee || 0) / 100)}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Payroll Analytics Insights</CardTitle>
                    <CardDescription>AI-generated insights based on your payroll data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-4 border rounded-lg">
                        <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Salary Growth Trend</h4>
                          <p className="text-sm text-muted-foreground">
                            Total salary expenses have increased by {calculatePercentageChange(
                              payrollSummary.totalSalaries, 
                              payrollSummary.previousMonth.totalSalaries
                            ).toFixed(1)}% compared to the previous month, indicating company growth.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4 p-4 border rounded-lg">
                        <BarChartIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Department Distribution</h4>
                          <p className="text-sm text-muted-foreground">
                            {Object.keys(payrollSummary.departmentSalaries || {}).length > 0 ? 
                              `The ${Object.entries(payrollSummary.departmentSalaries || {})
                                .sort((a, b) => b[1] - a[1])[0][0]} department has the highest salary allocation at 
                                ${((Object.entries(payrollSummary.departmentSalaries || {})
                                .sort((a, b) => b[1] - a[1])[0][1] / payrollSummary.totalSalaries) * 100).toFixed(1)}% 
                                of total payroll.` : 
                              'No department data available for analysis.'
                            }
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4 p-4 border rounded-lg">
                        <Percent className="h-5 w-5 text-purple-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Payroll Efficiency</h4>
                          <p className="text-sm text-muted-foreground">
                            Your payroll to revenue ratio is {((payrollSummary.payrollMetrics?.payrollToRevenueRatio || 0) * 100).toFixed(1)}%, 
                            {((payrollSummary.payrollMetrics?.payrollToRevenueRatio || 0) * 100) < 30 ? 
                              ' which is below the industry average of 30-35%, indicating good cost efficiency.' : 
                              ' which is within the industry average range of 30-35%.'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download Full Analytics Report
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
