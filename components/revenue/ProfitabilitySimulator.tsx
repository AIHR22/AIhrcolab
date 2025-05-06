"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

interface Department {
  name: string
  currentHeadcount: number
  revenuePerEmployee: number
  totalRevenue: number
  adjustedHeadcount: number
}

export function ProfitabilitySimulator() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [totalImpact, setTotalImpact] = useState(0)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  // Fetch initial department data
  useEffect(() => {
    async function fetchDepartments() {
      try {
        const { data, error } = await supabase
          .from('departments')
          .select('*')

        if (error) throw error

        const formattedDepartments = data.map(dept => ({
          name: dept.name,
          currentHeadcount: dept.headcount,
          revenuePerEmployee: dept.revenue_per_employee,
          totalRevenue: dept.total_revenue,
          adjustedHeadcount: dept.headcount // Initially same as current
        }))

        setDepartments(formattedDepartments)
      } catch (error) {
        console.error('Error fetching departments:', error)
        toast({
          title: "Error",
          description: "Failed to load department data",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDepartments()

    // Subscribe to department changes
    const channel = supabase
      .channel('department_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'departments'
        },
        (payload) => {
          setDepartments(current => {
            return current.map(dept => {
              if (dept.name === payload.new.name) {
                return {
                  ...dept,
                  currentHeadcount: payload.new.headcount,
                  revenuePerEmployee: payload.new.revenue_per_employee,
                  totalRevenue: payload.new.total_revenue
                }
              }
              return dept
            })
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, toast])

  // Handle headcount adjustment
  const handleHeadcountChange = (departmentName: string, change: number) => {
    setDepartments(current =>
      current.map(dept => {
        if (dept.name === departmentName) {
          const newHeadcount = Math.max(0, dept.adjustedHeadcount + change)
          return { ...dept, adjustedHeadcount: newHeadcount }
        }
        return dept
      })
    )
  }

  // Simulate revenue impact
  const simulateImpact = async () => {
    try {
      const response = await fetch('/api/revenue/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departments: departments.map(dept => ({
            department: dept.name,
            currentHeadcount: dept.currentHeadcount,
            adjustedHeadcount: dept.adjustedHeadcount
          }))
        })
      })

      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error)
      
      setTotalImpact(data.totalImpact)
      
      toast({
        title: "Simulation Complete",
        description: `Total projected impact: ${new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(data.totalImpact)}`,
      })
    } catch (error) {
      console.error('Error simulating impact:', error)
      toast({
        title: "Error",
        description: "Failed to simulate revenue impact",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return <div>Loading department data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-6 dark:border-gray-800">
        <h2 className="text-2xl font-bold mb-4">Profitability Simulator</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Adjust hiring/firing decisions and see revenue impact in real time
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-6 gap-4 font-medium p-2">
            <div>Department</div>
            <div>Current Headcount</div>
            <div>Revenue per Employee</div>
            <div>Total Revenue</div>
            <div>Adjust Headcount</div>
            <div>Projected Impact</div>
          </div>

          {departments.map(dept => {
            const impact = (dept.adjustedHeadcount - dept.currentHeadcount) * dept.revenuePerEmployee

            return (
              <div key={dept.name} className="grid grid-cols-6 gap-4 items-center p-2">
                <div>{dept.name}</div>
                <div>{dept.currentHeadcount}</div>
                <div>{new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(dept.revenuePerEmployee)}</div>
                <div>{new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(dept.totalRevenue)}</div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleHeadcountChange(dept.name, -1)}
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    value={dept.adjustedHeadcount}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0
                      setDepartments(current =>
                        current.map(d =>
                          d.name === dept.name
                            ? { ...d, adjustedHeadcount: Math.max(0, value) }
                            : d
                        )
                      )
                    }}
                    className="w-20 text-center"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleHeadcountChange(dept.name, 1)}
                  >
                    +
                  </Button>
                </div>
                <div className={impact >= 0 ? "text-green-500" : "text-red-500"}>
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(impact)}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div className="text-lg font-semibold">
            Total Projected Impact: {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(totalImpact)}
          </div>
          <Button onClick={simulateImpact}>
            Apply Changes
          </Button>
        </div>
      </div>
    </div>
  )
} 