"use client"

import type React from "react"
import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import {
  Mail,
  Phone,
  Briefcase,
  Building,
  DollarSign,
  Calendar,
  Award,
  Edit,
  ArrowLeft,
  Save,
  Trash2,
  FileText,
  Clock,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"
import { employeeService } from "@/lib/services/employee-service"
import { departmentService } from "@/lib/services/department-service"
import { payrollService, PayrollEntry } from "@/lib/services/payroll-service"

// Define types for document and payment history items
type Document = {
  name: string;
  date: string;
  type: string;
}

type PaymentHistory = {
  date: string;
  amount: number;
  type: string;
}

// Default empty employee structure
const defaultEmployee = {
  id: "",
  first_name: "",
  last_name: "",
  email: "",
  position: "",
  department_id: "",
  hire_date: "",
  salary: 0,
  status: "active" as "active" | "on_leave" | "inactive",  // Use appropriate status type
  phone: "",
  avatar: "/placeholder.svg?height=128&width=128",
  performance_rating: 0,
  strengths: [] as string[],
  areas_for_improvement: [] as string[],
  documents: [] as Document[],
  pay_history: [] as PaymentHistory[]
}

// Map database status to appropriate values
const mapStatus = (status: string | null | undefined): "active" | "on_leave" | "inactive" => {
  if (!status) return "active"
  if (status === "active" || status === "on_leave" || status === "inactive") {
    return status
  }
  return "active" // Default fallback
}

export default function EmployeeProfilePage({ params }: { params: { id: string } }) {
  // Unwrap params using React.use() as required by Next.js
  const unwrappedParams = use(params)
  const id = unwrappedParams.id
  
  const [employee, setEmployee] = useState(defaultEmployee)
  const [isEditing, setIsEditing] = useState(false)
  const [editedEmployee, setEditedEmployee] = useState(defaultEmployee)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [departments, setDepartments] = useState<any[]>([])
  const [isPending, setIsPending] = useState(false)
  const [payrollEntries, setPayrollEntries] = useState<PayrollEntry[]>([])
  const [isLoadingPayroll, setIsLoadingPayroll] = useState(false)
  const router = useRouter()

  // Fetch employee data
  useEffect(() => {
    const loadEmployeeData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [employeeData, departmentsData] = await Promise.all([
          employeeService.getById(id),
          departmentService.getAll()
        ])
        
        // Ensure employee data has all required fields with proper types
        const formattedEmployee = {
          ...defaultEmployee,
          ...employeeData,
          status: mapStatus(employeeData.status)
        }
        
        setEmployee(formattedEmployee)
        setEditedEmployee(formattedEmployee)
        setDepartments(departmentsData)

        // Load payroll data for this employee
        loadPayrollData(id)
      } catch (err: any) {
        console.error('Error loading employee data:', err)
        setError(err.message || 'Failed to load employee data')
        toast({
          title: "Error",
          description: "Failed to load employee data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadEmployeeData()
  }, [id])

  // Load payroll data for the employee
  const loadPayrollData = async (employeeId: string) => {
    setIsLoadingPayroll(true)
    try {
      const data = await payrollService.getByEmployeeId(employeeId)
      setPayrollEntries(data)
    } catch (err) {
      console.error('Error loading payroll data:', err)
      // Don't show toast for payroll errors as it's not critical
    } finally {
      setIsLoadingPayroll(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditedEmployee({...employee})
  }

  const handleSave = async () => {
    setIsPending(true)
    try {
      const updatedEmployee = await employeeService.update(id, editedEmployee)
      setEmployee(updatedEmployee)
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Employee updated successfully",
      })
    } catch (error: any) {
      console.error('Error updating employee:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update employee",
        variant: "destructive",
      })
    } finally {
      setIsPending(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedEmployee(employee) // Reset to current employee data
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditedEmployee((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setEditedEmployee((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleDelete = async () => {
    setIsPending(true)
    try {
      await employeeService.delete(id)
      toast({
        title: "Success",
        description: "Employee deleted successfully",
      })
      router.push('/dashboard/employees')
    } catch (error: any) {
      console.error('Error deleting employee:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete employee",
        variant: "destructive",
      })
      setIsPending(false)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading employee data...</div>
  }

  if (error) {
    return <div className="flex justify-center p-8 text-red-500">Error: {error}</div>
  }

  const fullName = `${employee.first_name} ${employee.last_name}`
  const departmentName = departments.find(d => d.id === employee.department_id)?.name || 'Unknown'

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="group transition-all">
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Employees
        </Button>

        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="transition-all duration-300 hover:bg-primary/10"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="transition-all duration-300">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Employee
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the employee record and remove all
                      associated data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive" onClick={handleDelete} disabled={isPending}>
                      {isPending ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={handleCancel} className="transition-all duration-300">
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isPending} className="transition-all duration-300">
                <Save className="mr-2 h-4 w-4" />
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <Avatar className="h-32 w-32 mb-4">
              <AvatarImage src={employee.avatar || "/placeholder.svg?height=128&width=128"} alt={fullName} />
              <AvatarFallback className="text-3xl">
                {employee.first_name?.[0]}{employee.last_name?.[0]}
              </AvatarFallback>
            </Avatar>

            {isEditing ? (
              <div className="w-full space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="first_name">First Name</Label>
                    <Input 
                      id="first_name" 
                      name="first_name" 
                      value={editedEmployee.first_name} 
                      onChange={handleChange} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input 
                      id="last_name" 
                      name="last_name" 
                      value={editedEmployee.last_name} 
                      onChange={handleChange} 
                    />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold">{fullName}</h2>
                <p className="text-muted-foreground">{employee.position}</p>
                <Badge className="mt-2 bg-green-500">{employee.status}</Badge>
              </>
            )}

            <Separator className="my-4" />

            <div className="w-full space-y-3">
              {isEditing ? (
                <>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      value={editedEmployee.email} 
                      onChange={handleChange} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      value={editedEmployee.phone || ''} 
                      onChange={handleChange} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="position">Position</Label>
                    <Input 
                      id="position" 
                      name="position" 
                      value={editedEmployee.position} 
                      onChange={handleChange} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="department_id">Department</Label>
                    <Select 
                      value={editedEmployee.department_id} 
                      onValueChange={(value) => handleSelectChange('department_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="salary">Salary</Label>
                    <Input 
                      id="salary" 
                      name="salary" 
                      type="number" 
                      value={editedEmployee.salary} 
                      onChange={handleChange} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={editedEmployee.status} 
                      onValueChange={(value) => handleSelectChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="on leave">On Leave</SelectItem>
                        <SelectItem value="terminated">Terminated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{employee.email}</span>
                  </div>
                  {employee.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">{employee.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{employee.position}</span>
                  </div>
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{departmentName}</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">${employee.salary?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Hired: {new Date(employee.hire_date).toLocaleDateString()}</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Employee Overview</CardTitle>
            <CardDescription>Information and performance details for {fullName}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="performance">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="payroll">Payroll</TabsTrigger>
              </TabsList>
              <TabsContent value="performance">
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <h3 className="font-semibold">Overall Performance</h3>
                      <span className="text-sm">{(employee.performance_rating || 3.5).toFixed(1)}/5.0</span>
                    </div>
                    <Progress value={(employee.performance_rating || 3.5) * 20} className="h-2" />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Strengths</h3>
                      <ul className="space-y-2">
                        {(employee.strengths || ['Technical skills', 'Team collaboration', 'Communication']).map((strength, i) => (
                          <li key={i} className="flex items-start">
                            <Award className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Areas for Improvement</h3>
                      <ul className="space-y-2">
                        {(employee.areas_for_improvement || ['Documentation', 'Time management']).map((area, i) => (
                          <li key={i} className="flex items-start">
                            <Award className="h-4 w-4 mr-2 text-amber-500 mt-0.5" />
                            <span>{area}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="documents">
                <div className="space-y-4">
                  {(employee.documents || [
                    { name: "Employment Contract", date: "2021-06-15", type: "PDF" },
                    { name: "Performance Review", date: "2022-12-10", type: "PDF" },
                    { name: "Training Certificate", date: "2022-08-22", type: "PDF" },
                  ] as Document[]).map((doc, i) => (
                    <div key={i} className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-3 text-blue-500" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">{new Date(doc.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="payroll">
                <div className="space-y-4">
                  {isLoadingPayroll ? (
                    <div className="flex justify-center p-4">Loading payroll data...</div>
                  ) : payrollEntries.length > 0 ? (
                    payrollEntries.map((payment, i) => (
                      <div key={i} className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-3 text-green-500" />
                          <div>
                            <p className="font-medium">{payment.payment_method || 'Direct Deposit'}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(payment.payment_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="font-medium">
                          ${(payment.base_salary + (payment.bonus || 0)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No payroll records found for this employee.
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
