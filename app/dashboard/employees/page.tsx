"use client"

import { useState, useEffect, useTransition } from "react"
import { Plus, Search, Download, MoreHorizontal, Edit, Trash2, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { employeeService } from "@/lib/services/employee-service"
import { departmentService } from "@/lib/services/department-service"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

type Employee = {
  id: string
  first_name: string
  last_name: string
  email: string
  position: string
  department_id: string
  hire_date: string
  salary: number
  status: "active" | "on leave" | "terminated" | undefined
  department?: string
  avatar?: string
  phone?: string
  contractType?: string
}

type Department = {
  id: string
  name: string
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [page, setPage] = useState(1)
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Map database status values to our application status values
  const mapDatabaseStatus = (dbStatus: string | null | undefined): "active" | "on leave" | "terminated" | undefined => {
    if (!dbStatus) return "active"
    if (dbStatus === "on_leave") return "on leave"
    if (dbStatus === "inactive") return "terminated"
    if (dbStatus === "active") return "active"
    return "active" // Default fallback
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const [employeesData, departmentsData] = await Promise.all([
          employeeService.getAll(),
          departmentService.getAll()
        ])
        
        // Map department IDs to names
        const departmentMap = departmentsData.reduce((acc, dept) => {
          acc[dept.id] = dept.name
          return acc
        }, {} as Record<string, string>)
        
        // Add department name to each employee
        const employeesWithDepartment = employeesData.map(emp => ({
          ...emp,
          department: departmentMap[emp.department_id] || 'Unknown',
          status: mapDatabaseStatus(emp.status)
        }))
        
        setEmployees(employeesWithDepartment)
        setDepartments(departmentsData)
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          title: "Error",
          description: "Failed to load employees data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [])

  // Filter employees based on search term, department, and status
  const filteredEmployees = employees.filter((employee) => {
    const fullName = `${employee.first_name} ${employee.last_name}`.toLowerCase()
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      (employee.position || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDepartment = selectedDepartment === "all" || employee.department === selectedDepartment
    const matchesStatus = selectedStatus === "all" || (employee.status || 'active') === selectedStatus

    return matchesSearch && matchesDepartment && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "on leave":
        return <Badge className="bg-yellow-500">On Leave</Badge>
      case "terminated":
        return <Badge className="bg-red-500">Terminated</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const handleAddEmployee = async (formData: FormData) => {
    try {
      startTransition(async () => {
        const newEmployee = {
          first_name: formData.get('firstName') as string,
          last_name: formData.get('lastName') as string,
          email: formData.get('email') as string,
          department_id: formData.get('department') as string,
          position: formData.get('role') as string,
          hire_date: new Date().toISOString(),
          salary: Number(formData.get('salary') || 0),
          status: 'active' as const
        }

        const result = await employeeService.create(newEmployee)
        
        if (result) {
          toast({
            title: "Success",
            description: "Employee added successfully",
          })
          
          // Refresh employee list
          const employeesData = await employeeService.getAll()
          const departmentMap = departments.reduce((acc, dept) => {
            acc[dept.id] = dept.name
            return acc
          }, {} as Record<string, string>)
          
          const employeesWithDepartment = employeesData.map(emp => ({
            ...emp,
            department: departmentMap[emp.department_id] || 'Unknown',
            status: mapDatabaseStatus(emp.status)
          }))
          
          setEmployees(employeesWithDepartment)
          setIsAddEmployeeOpen(false)
        }
      })
    } catch (error) {
      console.error('Error adding employee:', error)
      toast({
        title: "Error",
        description: "Failed to add employee",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (employeeId: string) => {
    try {
      startTransition(async () => {
        await employeeService.delete(employeeId)
        
        toast({
          title: "Success",
          description: "Employee deleted successfully",
        })
        
        // Refresh employee list
        const employeesData = await employeeService.getAll()
        const departmentMap = departments.reduce((acc, dept) => {
          acc[dept.id] = dept.name
          return acc
        }, {} as Record<string, string>)
        
        const employeesWithDepartment = employeesData.map(emp => ({
          ...emp,
          department: departmentMap[emp.department_id] || 'Unknown',
          status: mapDatabaseStatus(emp.status)
        }))
        
        setEmployees(employeesWithDepartment)
      })
    } catch (error) {
      console.error('Error deleting employee:', error)
      toast({
        title: "Error",
        description: "Failed to delete employee",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading employees...</div>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
        <p className="text-muted-foreground">Manage your employees, view details, and track performance.</p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search employees..."
              className="pl-8 w-full md:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on leave">On Leave</SelectItem>
              <SelectItem value="terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>
                  Fill in the details to add a new employee to the system.
                </DialogDescription>
              </DialogHeader>
              <form action={handleAddEmployee}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" name="firstName" placeholder="John" required />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" name="lastName" placeholder="Doe" required />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="john.doe@example.com" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="department">Department</Label>
                      <Select name="department">
                        <SelectTrigger id="department">
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
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="role">Role</Label>
                      <Input id="role" name="role" placeholder="Software Engineer" required />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="salary">Salary</Label>
                    <Input id="salary" name="salary" type="number" placeholder="50000" required />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddEmployeeOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Adding..." : "Add Employee"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={employee.avatar || "/placeholder.svg?height=32&width=32"} alt={`${employee.first_name} ${employee.last_name}`} />
                        <AvatarFallback>{employee.first_name[0]}{employee.last_name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{employee.first_name} {employee.last_name}</div>
                        <div className="text-sm text-muted-foreground">{employee.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>${employee.salary?.toLocaleString() || "N/A"}</TableCell>
                  <TableCell>{getStatusBadge(employee.status || "active")}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/employees/${employee.id}`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
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
                              <AlertDialogAction className="bg-destructive" onClick={() => handleDelete(employee.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  No employees found. Try adjusting your filters or add a new employee.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-end p-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" onClick={() => setPage(Math.max(1, page - 1))} />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive={page === 1} onClick={() => setPage(1)}>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive={page === 2} onClick={() => setPage(2)}>
                  2
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive={page === 3} onClick={() => setPage(3)}>
                  3
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" onClick={() => setPage(page + 1)} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  )
}
