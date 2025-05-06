"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { employeeService } from "@/lib/services/employee-service"
import { AddEmployeeDialog } from "@/app/employees/add-employee-dialog"
import { useToast } from "@/hooks/use-toast"
import type { Database } from "@/lib/database.types"

type Employee = Database["public"]["Tables"]["employees"]["Row"]

export default function EmployeeDirectoryPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddingEmployee, setIsAddingEmployee] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const data = await employeeService.getAll()
        setEmployees(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load employees",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadEmployees()

    // Set up real-time subscription
    const subscription = employeeService.onEmployeeUpdate((payload) => {
      if (payload.eventType === "INSERT") {
        setEmployees((prev) => [...prev, payload.new])
      } else if (payload.eventType === "UPDATE") {
        setEmployees((prev) => prev.map((emp) => (emp.id === payload.new.id ? payload.new : emp)))
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
      setEmployees(results)
    } else {
      const allEmployees = await employeeService.getAll()
      setEmployees(allEmployees)
    }
  }

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

      <div className="bg-card rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold p-6">Employee Directory</h2>

        {isLoading ? (
          <div className="p-6">
            <div className="h-20 bg-gray-100 animate-pulse rounded-lg" />
            <div className="h-20 bg-gray-100 animate-pulse rounded-lg mt-4" />
            <div className="h-20 bg-gray-100 animate-pulse rounded-lg mt-4" />
          </div>
        ) : (
          <div className="divide-y">
            {employees.map((employee) => (
              <div key={employee.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                    {employee.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <h3 className="font-medium">{employee.name}</h3>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>{employee.position}</span>
                      <span>•</span>
                      <span>{employee.department}</span>
                      <span>•</span>
                      <span>{employee.email}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge
                    variant={employee.status === "active" ? "default" : "secondary"}
                    className={employee.status === "active" ? "bg-green-500" : ""}
                  >
                    {employee.status === "active" ? "Active" : employee.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddEmployeeDialog
        open={isAddingEmployee}
        onOpenChange={setIsAddingEmployee}
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

