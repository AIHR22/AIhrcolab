"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmployeeForm } from "@/components/employees/employee-form"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function EditEmployeePage() {
  const params = useParams()
  const { toast } = useToast()
  const [employee, setEmployee] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const employeeId = params.id as string

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await fetch(`/api/employees/${employeeId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch employee")
        }

        const data = await response.json()
        setEmployee(data)
      } catch (error) {
        console.error("Error fetching employee:", error)
        toast({
          title: "Error",
          description: "Failed to load employee data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchEmployee()
  }, [employeeId])

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading employee data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Employee</h1>
        <p className="text-muted-foreground">
          Update information for {employee?.first_name} {employee?.last_name}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
          <CardDescription>Make changes to the employee's details</CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeForm initialData={employee} employeeId={employeeId} />
        </CardContent>
      </Card>
    </div>
  )
}

