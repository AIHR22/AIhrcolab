"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { getRecentHires } from "@/lib/supabase/api"
import { Skeleton } from "@/components/ui/skeleton"

interface Employee {
  id: string
  name: string
  position: string
  department: string
  avatar_url: string | null
  start_date: string
}

export function RecentHires() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRecentHires() {
      try {
        const data = await getRecentHires(4)
        setEmployees(data)
      } catch (err) {
        console.error("Error fetching recent hires:", err)
        setError("Failed to load recent hires")
      } finally {
        setLoading(false)
      }
    }

    fetchRecentHires()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="bg-red-50 p-4 rounded-md text-red-500">{error}</div>
  }

  if (employees.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">No recent hires to display</div>
  }

  return (
    <div className="space-y-4">
      {employees.map((employee) => (
        <div key={employee.id} className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={employee.avatar_url || "/placeholder.svg?height=32&width=32"} alt={employee.name} />
            <AvatarFallback>
              {employee.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium leading-none">{employee.name}</p>
              <Badge variant="outline" className="text-xs">
                {formatDistanceToNow(new Date(employee.start_date), { addSuffix: true })}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{employee.position}</p>
            <p className="text-xs text-muted-foreground">{employee.department}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

