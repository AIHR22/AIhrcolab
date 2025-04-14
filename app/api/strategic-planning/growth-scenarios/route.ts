import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import type { Database } from "@/types/supabase"

interface ScenarioParams {
  name: string
  targetRevenue: number
  targetDate: string
  startDate: string
  currentRevenue: number
  growthModel: 'linear' | 'exponential' | 'stepwise'
  efficiencyFactor: number
}

interface DepartmentHeadcount {
  id: string
  name: string
  currentHeadcount: number
  projectedHeadcount: number
  growthPercentage: number
  revenuePerEmployee: number
  hiringNeeded: number
}

interface ScenarioResult {
  totalCurrentHeadcount: number
  totalProjectedHeadcount: number
  overallGrowthPercentage: number
  averageRevenuePerEmployee: number
  timeToHire: number // in days
  departments: DepartmentHeadcount[]
  monthlyProjections: {
    month: string
    revenue: number
    headcount: number
    revenuePerEmployee: number
  }[]
}

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      throw new Error("Supabase client not initialized")
    }

    // Parse the scenario parameters from the request
    const params: ScenarioParams = await request.json()

    // Validate required parameters
    if (!params.targetRevenue || !params.targetDate || !params.currentRevenue) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      )
    }

    // Fetch current department data
    const { data: departments, error: departmentsError } = await supabaseAdmin
      .from("departments")
      .select("id, name, description")

    if (departmentsError) {
      console.error("Error fetching departments:", departmentsError)
      throw departmentsError
    }

    // Fetch current employee data grouped by department
    const { data: employeesByDept, error: employeesError } = await supabaseAdmin
      .from("employees")
      .select("id, department_id, salary")

    if (employeesError) {
      console.error("Error fetching employees:", employeesError)
      throw employeesError
    }

    // Calculate the revenue growth factor
    const revenueGrowthFactor = params.targetRevenue / params.currentRevenue

    // Calculate the time period in months
    const startDate = new Date(params.startDate)
    const targetDate = new Date(params.targetDate)
    const monthsDifference = (targetDate.getFullYear() - startDate.getFullYear()) * 12 + 
                              targetDate.getMonth() - startDate.getMonth()

    // Calculate department-specific current headcounts and revenue contributions
    const departmentHeadcounts: Map<string, number> = new Map()
    const departmentRevenues: Map<string, number> = new Map()
    const departmentSalaries: Map<string, number[]> = new Map()
    
    // Initialize the maps with zero values
    departments?.forEach(dept => {
      departmentHeadcounts.set(dept.id, 0)
      departmentRevenues.set(dept.id, 0)
      departmentSalaries.set(dept.id, [])
    })

    // Calculate current headcount by department
    employeesByDept?.forEach(employee => {
      if (employee.department_id) {
        // Increment headcount
        const currentCount = departmentHeadcounts.get(employee.department_id) || 0
        departmentHeadcounts.set(employee.department_id, currentCount + 1)
        
        // Store salary for calculating averages
        if (employee.salary) {
          const salaries = departmentSalaries.get(employee.department_id) || []
          salaries.push(employee.salary)
          departmentSalaries.set(employee.department_id, salaries)
        }
      }
    })

    // Calculate total current headcount
    const totalCurrentHeadcount = Array.from(departmentHeadcounts.values())
      .reduce((sum, count) => sum + count, 0)
    
    // Determine revenue contribution percentages by department based on headcount and salary
    // If we don't have real revenue attribution data, we'll use a proportional model based on:
    // 1. Relative department size (headcount)
    // 2. Average salary as a proxy for value contribution
    
    let totalWeightedContribution = 0
    departments?.forEach(dept => {
      const headcount = departmentHeadcounts.get(dept.id) || 0
      const salaries = departmentSalaries.get(dept.id) || []
      const avgSalary = salaries.length > 0 ? 
        salaries.reduce((sum, salary) => sum + salary, 0) / salaries.length : 
        75000 // Default average salary if no data
      
      // Weight by headcount and average salary
      const weightedContribution = headcount * avgSalary
      totalWeightedContribution += weightedContribution
      
      // Store for later use
      departmentRevenues.set(dept.id, weightedContribution)
    })
    
    // Convert weighted contributions to revenue percentages
    departments?.forEach(dept => {
      const weightedContribution = departmentRevenues.get(dept.id) || 0
      const revenuePercentage = totalWeightedContribution > 0 ? 
        weightedContribution / totalWeightedContribution : 
        0
      
      // Calculate actual revenue contribution
      const revenueContribution = params.currentRevenue * revenuePercentage
      departmentRevenues.set(dept.id, revenueContribution)
    })

    // Calculate future headcount needs based on selected growth model
    const departmentProjections: DepartmentHeadcount[] = []
    
    // Monthly projections for the chart
    const monthlyProjections = []
    let totalProjectedHeadcount = 0
    
    // Create a month-by-month forecast
    for (let month = 0; month <= monthsDifference; month++) {
      let monthlyRevenue = 0
      
      // Calculate the projected revenue for this month based on the growth model
      if (params.growthModel === 'linear') {
        // Linear growth: even distribution over time
        monthlyRevenue = params.currentRevenue + 
          ((params.targetRevenue - params.currentRevenue) * (month / monthsDifference))
        
      } else if (params.growthModel === 'exponential') {
        // Exponential growth: compound growth rate
        const monthlyRate = Math.pow(revenueGrowthFactor, 1 / monthsDifference) - 1
        monthlyRevenue = params.currentRevenue * Math.pow(1 + monthlyRate, month)
        
      } else if (params.growthModel === 'stepwise') {
        // Stepwise growth: jumps at 1/3 and 2/3 of the time period
        if (month < monthsDifference / 3) {
          monthlyRevenue = params.currentRevenue
        } else if (month < 2 * monthsDifference / 3) {
          monthlyRevenue = params.currentRevenue + 
            (params.targetRevenue - params.currentRevenue) / 2
        } else {
          monthlyRevenue = params.targetRevenue
        }
      }
      
      // For the final month projection, we'll calculate detailed department data
      if (month === monthsDifference) {
        let totalRevenuePerEmployee = 0

        departments?.forEach(dept => {
          const currentHeadcount = departmentHeadcounts.get(dept.id) || 0
          const currentRevenue = departmentRevenues.get(dept.id) || 0
          
          // Calculate the revenue attribution for this department
          const revenuePercentage = currentRevenue / params.currentRevenue
          const projectedRevenue = params.targetRevenue * revenuePercentage
          
          // Current revenue per employee
          const currentRevenuePerEmployee = currentHeadcount > 0 ? 
            currentRevenue / currentHeadcount : 0
          
          // Apply the efficiency factor to calculate projected headcount
          let projectedHeadcount = 0
          
          if (currentRevenuePerEmployee > 0) {
            // Basic projection: new revenue ÷ revenue per employee
            const basicProjection = projectedRevenue / currentRevenuePerEmployee
            
            // Apply efficiency factor (lower means more efficient growth)
            projectedHeadcount = Math.ceil(basicProjection * params.efficiencyFactor)
          } else if (currentHeadcount === 0 && projectedRevenue > 0) {
            // If a department has no employees but will have revenue, assign at least one
            projectedHeadcount = 1
          }
          
          // Calculate metrics
          const hiringNeeded = projectedHeadcount - currentHeadcount
          const growthPercentage = currentHeadcount > 0 ? 
            (projectedHeadcount - currentHeadcount) / currentHeadcount : 
            projectedHeadcount > 0 ? 1 : 0
          
          const revenuePerEmployee = projectedHeadcount > 0 ? 
            projectedRevenue / projectedHeadcount : 0
          
          totalRevenuePerEmployee += revenuePerEmployee
          totalProjectedHeadcount += projectedHeadcount
          
          departmentProjections.push({
            id: dept.id,
            name: dept.name,
            currentHeadcount,
            projectedHeadcount,
            growthPercentage,
            revenuePerEmployee,
            hiringNeeded
          })
        })
      }
      
      // Calculate the projected headcount for this month (simplified for monthly projections)
      const overallFactor = params.efficiencyFactor * (params.growthModel === 'exponential' ? 0.9 : 1.0)
      const monthlyHeadcount = Math.ceil(totalCurrentHeadcount * (monthlyRevenue / params.currentRevenue) * overallFactor)
      
      // Add to monthly projections
      const projDate = new Date(startDate)
      projDate.setMonth(projDate.getMonth() + month)
      
      monthlyProjections.push({
        month: projDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        revenue: monthlyRevenue,
        headcount: monthlyHeadcount,
        revenuePerEmployee: monthlyHeadcount > 0 ? monthlyRevenue / monthlyHeadcount : 0
      })
    }
    
    // Calculate average metrics
    const averageRevenuePerEmployee = totalProjectedHeadcount > 0 ? 
      params.targetRevenue / totalProjectedHeadcount : 0
    
    const overallGrowthPercentage = totalCurrentHeadcount > 0 ? 
      (totalProjectedHeadcount - totalCurrentHeadcount) / totalCurrentHeadcount : 
      1 // If starting from zero, growth is 100%
    
    // Time to hire calculation based on total new hires needed and typical hiring time
    const totalNewHires = totalProjectedHeadcount - totalCurrentHeadcount
    const avgDaysPerHire = 30 // Average days to fill a position
    const parallelHiringCapacity = Math.max(1, Math.ceil(totalCurrentHeadcount / 10)) // One recruiter per 10 employees
    const timeToHire = Math.ceil((totalNewHires * avgDaysPerHire) / parallelHiringCapacity)
    
    // Construct the result
    const result: ScenarioResult = {
      totalCurrentHeadcount,
      totalProjectedHeadcount,
      overallGrowthPercentage,
      averageRevenuePerEmployee,
      timeToHire,
      departments: departmentProjections,
      monthlyProjections
    }
    
    // Save the scenario to the database (optional)
    try {
      await supabaseAdmin
        .from("growth_scenarios")
        .insert({
          name: params.name,
          params: params as any,
          results: result as any,
          created_at: new Date().toISOString()
        })
    } catch (saveError) {
      // Log but don't fail if saving fails
      console.error("Error saving scenario:", saveError)
    }

    return NextResponse.json(result)
    
  } catch (error: any) {
    console.error("Error in growth-scenarios API:", error)
    return NextResponse.json(
      { error: error.message || "An error occurred while processing the growth scenario" },
      { status: 500 }
    )
  }
}
