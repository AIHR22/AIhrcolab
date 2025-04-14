"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { employeeService } from "@/lib/services/employee-service"
import { departmentService } from "@/lib/services/department-service"
import { EmployeeCard } from "./employee-card"
import { AddEmployeeDialog } from "./add-employee-dialog"
import { useToast } from "@/hooks/use-toast"
import type { Database } from "@/lib/database.types"

type Employee = Database["public"]["Tables"]["employees"]["Row"]
type Department = Database["public"]["Tables"]["departments"]["Row"]

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddingEmployee, setIsAddingEmployee] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const loadData = async () => {
      try {
        const [employeesData, departmentsData] = await Promise.all([
          employeeService.getAll(),
          departmentService.getAll()
        ])
        setEmployees(employeesData as Employee[])
        setDepartments(departmentsData as Department[])
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()

    // Set up real-time subscription
    const subscription = employeeService.onEmployeeUpdate((payload) => {
      if (payload.eventType === "INSERT") {
        setEmployees((prev) => [...prev, payload.new as Employee])
      } else if (payload.eventType === "UPDATE") {
        setEmployees((prev) => prev.map((emp) => (emp.id === payload.new.id ? payload.new as Employee : emp)))
      } else if (payload.eventType === "DELETE") {
        setEmployees((prev) => prev.filter((emp) => emp.id !== payload.old.id))
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [toast])

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      const results = await employeeService.search(query)
      setEmployees(results as Employee[])
    } else {
      const allEmployees = await employeeService.getAll()
      setEmployees(allEmployees as Employee[])
    }
  }

  // Filter employees to get potential managers (excluding those without an id)
  const managers = employees.filter(emp => emp.id)

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Employees</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search employees..."
                className="pl-10 w-[300px]"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => setIsAddingEmployee(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onDelete={async () => {
                try {
                  await employeeService.delete(employee.id)
                  toast({
                    title: "Success",
                    description: "Employee deleted successfully",
                  })
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to delete employee",
                    variant: "destructive",
                  })
                }
              }}
            />
          ))}
        </div>
      )}

      <AddEmployeeDialog
        open={isAddingEmployee}
        onOpenChange={setIsAddingEmployee}
        departments={departments.map(d => ({ id: d.id, name: d.name }))}
        managers={managers.map(m => ({ id: m.id, first_name: m.first_name || '', last_name: m.last_name || '' }))}
        onSubmit={async (data) => {
          try {
            await employeeService.create(data)
            setIsAddingEmployee(false)
            toast({
              title: "Success",
              description: "Employee added successfully",
            })
          } catch (error) {
            toast({
              title: "Error",
              description: "Failed to add employee",
              variant: "destructive",
            })
          }
        }}
      />
    </div>
  )
}
