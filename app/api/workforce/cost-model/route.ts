import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import type { Json } from "@/types/supabase"

interface CostModelRequest {
  department_id?: string;
  scenario_id?: string;
  projection_months?: number;
  include_benefits?: boolean;
  include_bonuses?: boolean;
  compensation_growth_rate?: number;
  headcount_adjustments?: Record<string, number>;
}

interface CompensationCosts {
  department_id: string;
  department_name: string;
  current_costs: {
    base_salary: number;
    benefits: number;
    bonuses: number;
    total: number;
  };
  projected_costs: {
    base_salary: number;
    benefits: number;
    bonuses: number;
    total: number;
    change_percentage: number;
  };
  headcount: {
    current: number;
    projected: number;
    change: number;
  };
  avg_compensation: {
    current: number;
    projected: number;
  };
  breakdown_by_level?: Record<string, {
    headcount: number;
    total_compensation: number;
    avg_compensation: number;
  }>;
}

export async function POST(request: Request) {
  try {
    const {
      department_id,
      scenario_id,
      projection_months = 12,
      include_benefits = true,
      include_bonuses = true,
      compensation_growth_rate = 3,
      headcount_adjustments = {}
    } = await request.json() as CostModelRequest;

    // First, get the employees
    let employeeQuery = supabaseAdmin
      .from("employees")
      .select(`
        id,
        first_name,
        last_name,
        position,
        department_id,
        manager_id,
        departments:department_id (
          id,
          name
        )
      `)
      
    // Filter by department if provided
    if (department_id) {
      employeeQuery = employeeQuery.eq("department_id", department_id)
    }
    
    const { data: employees, error: empError } = await employeeQuery
    
    if (empError) {
      console.error("Error fetching employees:", empError)
      return NextResponse.json(
        { 
          success: false, 
          error: "Failed to fetch employee data: " + empError.message 
        }, 
        { status: 500 }
      )
    }
    
    // Get department data for names
    const { data: departments, error: deptError } = await supabaseAdmin
      .from("departments")
      .select("id, name")
    
    if (deptError) {
      console.error("Error fetching departments:", deptError)
      return NextResponse.json(
        { 
          success: false, 
          error: "Failed to fetch department data: " + deptError.message 
        }, 
        { status: 500 }
      )
    }
    
    // Get position data for salary ranges
    const { data: positions, error: posError } = await supabaseAdmin
      .from("positions")
      .select("id, title, level, is_manager")
    
    if (posError) {
      console.error("Error fetching positions:", posError)
      return NextResponse.json(
        { 
          success: false, 
          error: "Failed to fetch position data: " + posError.message 
        }, 
        { status: 500 }
      )
    }
    
    // Process employees by department
    const departmentMap = new Map(departments.map(d => [d.id, d.name]))
    const costsByDepartment: Record<string, CompensationCosts> = {}
    
    // Apply random but consistent salaries based on position and level
    const getEstimatedSalary = (position: string, isManager: boolean) => {
      const baseSalary = isManager ? 90000 : 60000
      
      // Adjust based on position title
      if (position.toLowerCase().includes('senior') || position.toLowerCase().includes('lead')) {
        return baseSalary * 1.5
      } else if (position.toLowerCase().includes('junior')) {
        return baseSalary * 0.7
      } else if (position.toLowerCase().includes('director')) {
        return baseSalary * 2.2
      } else if (position.toLowerCase().includes('vp') || position.toLowerCase().includes('vice president')) {
        return baseSalary * 3
      } else if (position.toLowerCase().includes('cto') || position.toLowerCase().includes('cio') || position.toLowerCase().includes('ceo')) {
        return baseSalary * 4
      }
      
      return baseSalary
    }
    
    // Process each employee and organize by department
    employees.forEach(emp => {
      const deptId = emp.department_id || 'unknown'
      const deptName = departmentMap.get(deptId) || 'Unknown Department'
      
      // Find position information
      const empPosition = positions.find(p => emp.position === p.id)
      const isManager = empPosition?.is_manager || false
      const positionTitle = empPosition?.title || emp.position || 'Employee'
      
      // Estimate salary based on position
      const estimatedSalary = getEstimatedSalary(positionTitle, isManager)
      
      // Calculate benefits (20% of salary) and bonuses (10% of salary for non-managers, 15% for managers)
      const benefits = include_benefits ? estimatedSalary * 0.2 : 0
      const bonuses = include_bonuses ? estimatedSalary * (isManager ? 0.15 : 0.1) : 0
      
      // Initialize department costs if not exists
      if (!costsByDepartment[deptId]) {
        costsByDepartment[deptId] = {
          department_id: deptId,
          department_name: deptName,
          current_costs: {
            base_salary: 0,
            benefits: 0,
            bonuses: 0,
            total: 0
          },
          projected_costs: {
            base_salary: 0,
            benefits: 0,
            bonuses: 0,
            total: 0,
            change_percentage: 0
          },
          headcount: {
            current: 0,
            projected: 0,
            change: 0
          },
          avg_compensation: {
            current: 0,
            projected: 0
          },
          breakdown_by_level: {}
        }
      }
      
      // Update department costs
      const deptCosts = costsByDepartment[deptId]
      
      // Update current costs
      deptCosts.current_costs.base_salary += estimatedSalary
      deptCosts.current_costs.benefits += benefits
      deptCosts.current_costs.bonuses += bonuses
      deptCosts.current_costs.total += estimatedSalary + benefits + bonuses
      
      // Update headcount
      deptCosts.headcount.current += 1
      
      // Update breakdown by level
      const level = empPosition?.level || 'unknown'
      if (!deptCosts.breakdown_by_level![level]) {
        deptCosts.breakdown_by_level![level] = {
          headcount: 0,
          total_compensation: 0,
          avg_compensation: 0
        }
      }
      
      deptCosts.breakdown_by_level![level].headcount += 1
      deptCosts.breakdown_by_level![level].total_compensation += estimatedSalary + benefits + bonuses
    })
    
    // Calculate projected costs and averages
    Object.values(costsByDepartment).forEach(dept => {
      // Calculate current averages
      dept.avg_compensation.current = dept.headcount.current > 0 
        ? dept.current_costs.total / dept.headcount.current
        : 0
      
      // Apply headcount adjustments for projection if available
      const adjustment = headcount_adjustments[dept.department_id] || 0
      dept.headcount.projected = dept.headcount.current + adjustment
      dept.headcount.change = adjustment
      
      // Calculate growth factor for the projection period
      const growthFactor = 1 + (compensation_growth_rate / 100) * (projection_months / 12)
      
      // Calculate projected costs with growth
      dept.projected_costs.base_salary = dept.current_costs.base_salary * growthFactor * (dept.headcount.projected / Math.max(1, dept.headcount.current))
      dept.projected_costs.benefits = dept.current_costs.benefits * growthFactor * (dept.headcount.projected / Math.max(1, dept.headcount.current))
      dept.projected_costs.bonuses = dept.current_costs.bonuses * growthFactor * (dept.headcount.projected / Math.max(1, dept.headcount.current))
      dept.projected_costs.total = dept.projected_costs.base_salary + dept.projected_costs.benefits + dept.projected_costs.bonuses
      
      // Calculate change percentage
      dept.projected_costs.change_percentage = dept.current_costs.total > 0
        ? ((dept.projected_costs.total - dept.current_costs.total) / dept.current_costs.total) * 100
        : 0
      
      // Calculate projected average compensation
      dept.avg_compensation.projected = dept.headcount.projected > 0
        ? dept.projected_costs.total / dept.headcount.projected
        : 0
      
      // Update average compensation in breakdowns
      Object.values(dept.breakdown_by_level || {}).forEach(level => {
        level.avg_compensation = level.headcount > 0
          ? level.total_compensation / level.headcount
          : 0
      })
    })
    
    // Calculate organization totals
    const totalCosts = {
      department_id: 'all',
      department_name: 'All Departments',
      current_costs: {
        base_salary: 0,
        benefits: 0,
        bonuses: 0,
        total: 0
      },
      projected_costs: {
        base_salary: 0,
        benefits: 0,
        bonuses: 0,
        total: 0,
        change_percentage: 0
      },
      headcount: {
        current: 0,
        projected: 0,
        change: 0
      },
      avg_compensation: {
        current: 0,
        projected: 0
      }
    }
    
    // Sum all department costs for organization totals
    Object.values(costsByDepartment).forEach(dept => {
      totalCosts.current_costs.base_salary += dept.current_costs.base_salary
      totalCosts.current_costs.benefits += dept.current_costs.benefits
      totalCosts.current_costs.bonuses += dept.current_costs.bonuses
      totalCosts.current_costs.total += dept.current_costs.total
      
      totalCosts.projected_costs.base_salary += dept.projected_costs.base_salary
      totalCosts.projected_costs.benefits += dept.projected_costs.benefits
      totalCosts.projected_costs.bonuses += dept.projected_costs.bonuses
      totalCosts.projected_costs.total += dept.projected_costs.total
      
      totalCosts.headcount.current += dept.headcount.current
      totalCosts.headcount.projected += dept.headcount.projected
      totalCosts.headcount.change += dept.headcount.change
    })
    
    // Calculate totals for average and change percentage
    totalCosts.avg_compensation.current = totalCosts.headcount.current > 0
      ? totalCosts.current_costs.total / totalCosts.headcount.current
      : 0
    
    totalCosts.avg_compensation.projected = totalCosts.headcount.projected > 0
      ? totalCosts.projected_costs.total / totalCosts.headcount.projected
      : 0
    
    totalCosts.projected_costs.change_percentage = totalCosts.current_costs.total > 0
      ? ((totalCosts.projected_costs.total - totalCosts.current_costs.total) / totalCosts.current_costs.total) * 100
      : 0
    
    // Apply scenario information if provided
    let scenarioInfo = null
    if (scenario_id) {
      try {
        const { data: scenario, error: scenarioError } = await supabaseAdmin
          .from('workforce_scenarios')
          .select('*')
          .eq('id', scenario_id)
          .single()
        
        if (!scenarioError && scenario) {
          scenarioInfo = {
            id: scenario.id,
            name: scenario.name,
            type: scenario.scenario_type,
            description: scenario.description
          }
        }
      } catch (err) {
        console.error("Error fetching scenario:", err)
        // Continue without scenario info
      }
    }
    
    // Save the cost model results
    const costModelResult = {
      id: crypto.randomUUID(),
      generated_at: new Date().toISOString(),
      department_costs: costsByDepartment,
      total_costs: totalCosts,
      parameters: {
        department_id,
        scenario_id,
        projection_months,
        include_benefits,
        include_bonuses,
        compensation_growth_rate,
        headcount_adjustments
      },
      scenario_info: scenarioInfo
    }
    
    try {
      // Try to save cost model results to the database
      const { error: saveError } = await supabaseAdmin
        .from('workforce_cost_models')
        .insert({
          id: costModelResult.id,
          generated_at: costModelResult.generated_at,
          department_id: department_id || null,
          scenario_id: scenario_id || null,
          results: costModelResult as unknown as Json,
          parameters: {
            projection_months,
            include_benefits,
            include_bonuses,
            compensation_growth_rate,
            headcount_adjustments
          } as unknown as Json
        })
      
      if (saveError) {
        console.error("Error saving cost model:", saveError)
        // Continue without saving
      }
    } catch (saveErr) {
      console.error("Exception saving cost model:", saveErr)
      // Continue without saving
    }
    
    return NextResponse.json({
      success: true,
      cost_model: costModelResult
    })
    
  } catch (error: any) {
    console.error("Error in cost model analysis:", error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An error occurred during cost model analysis"
      },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get("id")
    const department_id = url.searchParams.get("department_id")
    const scenario_id = url.searchParams.get("scenario_id")
    
    try {
      // Try to query the workforce_cost_models table
      let query = supabaseAdmin
        .from('workforce_cost_models')
        .select("*")
        .order("generated_at", { ascending: false })
      
      // Apply filters
      if (id) {
        query = query.eq("id", id)
      }
      
      if (department_id) {
        query = query.eq("department_id", department_id)
      }
      
      if (scenario_id) {
        query = query.eq("scenario_id", scenario_id)
      }
      
      // Limit to 10 cost models if no id specified
      if (!id) {
        query = query.limit(10)
      }
      
      const { data: costModels, error } = await query
      
      if (error) {
        // If there's an error, it might be because the table doesn't exist
        if (error.message.includes("relation") && error.message.includes("does not exist")) {
          // Return empty array if table doesn't exist
          return NextResponse.json({
            success: true,
            cost_models: []
          })
        }
        throw error
      }
      
      return NextResponse.json({
        success: true,
        cost_models
      })
    } catch (queryError) {
      console.error("Error querying workforce_cost_models:", queryError)
      // Return empty array on error for better UX
      return NextResponse.json({
        success: true,
        cost_models: []
      })
    }
    
  } catch (error: any) {
    console.error("Error fetching cost models:", error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An error occurred while fetching cost models"
      },
      { status: 500 }
    )
  }
} 