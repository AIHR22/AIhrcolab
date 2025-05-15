import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

interface CrossOrgScenarioRequest {
  revenue_targets: {
    current_revenue: number
    target_revenue: number
    target_date: string
  }
  growth_model: 'linear' | 'exponential' | 'stepwise'
  efficiency_factor: number
  attrition_rate: number
  hiring_capacity_per_month: number
  prioritize_departments?: string[]
  include_projects?: string[]
}

export async function POST(request: Request) {
  console.log('[API] Cross-Organization Scenarios: Request received')
  
  try {
    if (!supabaseAdmin) {
      console.error('[API] Supabase admin client not initialized')
      throw new Error("Database client not initialized")
    }
    
    console.log('[API] Using Supabase admin client:', !!supabaseAdmin)

    // Parse request data
    let data: CrossOrgScenarioRequest;
    try {
      data = await request.json();
      console.log('[API] Request data parsed:', JSON.stringify(data))
    } catch (e) {
      console.error('[API] Error parsing request JSON:', e)
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!data.revenue_targets || !data.growth_model) {
      console.error('[API] Missing required fields in request')
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Initialize variables to store database results
    let departmentsData: any[] = [];
    let skillsData: any[] = [];
    let employeesData: any[] = [];
    let employeeSkillsData: any[] = [];
    let projectsData: any[] = [];
    let projectSkillsData: any[] = [];

    // Fetch department data - with improved error handling
    console.log('[API] Fetching departments data')
    try {
      const { data: departments, error: departmentsError } = await supabaseAdmin
        .from("departments")
        .select("id, name, description")

      if (departmentsError) {
        console.error("[API] Error fetching departments:", departmentsError);
        // Continue with an empty array instead of failing completely
        departmentsData = [];
      } else {
        departmentsData = departments || [];
        console.log(`[API] Found ${departmentsData.length} departments`)
      }
    } catch (error) {
      console.error('[API] Unexpected error when fetching departments:', error)
      // Continue with empty array
      departmentsData = [];
    }

    // Fetch skills data - with improved error handling
    console.log('[API] Fetching skills data')
    try {
      const { data: skills, error: skillsError } = await supabaseAdmin
        .from("skills")
        .select("id, name, category, description");

      if (skillsError) {
        console.error("[API] Error fetching skills:", skillsError);
        // Continue with an empty array instead of failing completely
        skillsData = [];
      } else {
        skillsData = skills || [];
        console.log(`[API] Found ${skillsData.length} skills`)
      }
    } catch (error) {
      console.error('[API] Unexpected error when fetching skills:', error)
      // Continue with empty array
      skillsData = [];
    }

    // Fetch employees data with their departments - with improved error handling
    console.log('[API] Fetching employees data')
    try {
      const { data: employees, error: employeesError } = await supabaseAdmin
        .from("employees")
        .select(`
          id, 
          first_name, 
          last_name, 
          position, 
          department_id, 
          salary,
          status
        `);
        // Removed the .eq("status", "active") filter to get all employees

      if (employeesError) {
        console.error("[API] Error fetching employees:", employeesError);
        // Continue with an empty array instead of failing completely
        employeesData = [];
      } else {
        // Filter active employees in memory if the status field exists
        employeesData = (employees || []).filter(emp => !emp.status || emp.status === 'active');
        console.log(`[API] Found ${employeesData.length} active employees`)
      }
    } catch (error) {
      console.error('[API] Unexpected error when fetching employees:', error)
      // Continue with empty array
      employeesData = [];
    }

    // Fetch employee skills - with improved error handling and simplified query
    console.log('[API] Fetching employee skills data')
    try {
      // First try with the complex query including the skills relation
      try {
        const { data: empSkills, error: empSkillsError } = await supabaseAdmin
          .from("employee_skills")
          .select(`
            employee_id, 
            skill_id, 
            proficiency_level,
            skills:skill_id(id, name, category)
          `);
  
        if (empSkillsError) {
          throw empSkillsError; // Will be caught by the outer catch
        }
        
        employeeSkillsData = empSkills || [];
        console.log(`[API] Found ${employeeSkillsData.length} employee skills with relation`)
      } catch (relationError) {
        // If the complex query fails, try a simpler one without the relation
        console.warn('[API] Error with skills relation, trying simpler query:', relationError)
        
        const { data: empSkills, error: empSkillsError } = await supabaseAdmin
          .from("employee_skills")
          .select("employee_id, skill_id, proficiency_level");
  
        if (empSkillsError) {
          console.error("[API] Error fetching employee skills with simple query:", empSkillsError);
          employeeSkillsData = [];
        } else {
          employeeSkillsData = empSkills || [];
          console.log(`[API] Found ${employeeSkillsData.length} employee skills without relation`)
        }
      }
    } catch (error) {
      console.error('[API] Unexpected error when fetching employee skills:', error)
      // Continue with empty array
      employeeSkillsData = [];
    }

    // Fetch projects data if specific projects are included - with improved error handling
    if (data.include_projects && data.include_projects.length > 0) {
      console.log('[API] Fetching projects data for specific projects')
      try {
        const { data: projects, error: projectsError } = await supabaseAdmin
          .from("projects")
          .select(`
            id, 
            name, 
            start_date, 
            end_date, 
            budget,
            status
          `)
          .in("id", data.include_projects);

        if (projectsError) {
          console.error("[API] Error fetching projects:", projectsError);
          projectsData = [];
        } else {
          projectsData = projects || [];
          console.log(`[API] Found ${projectsData.length} projects`)

          // Fetch project skills requirements
          try {
            const { data: projSkills, error: projSkillsError } = await supabaseAdmin
              .from("project_skills")
              .select(`
                project_id, 
                skill_id, 
                required_proficiency, 
                headcount_needed
              `)
              .in("project_id", data.include_projects);

            if (projSkillsError) {
              console.error("[API] Error fetching project skills:", projSkillsError);
              projectSkillsData = [];
            } else {
              projectSkillsData = projSkills || [];
              console.log(`[API] Found ${projectSkillsData.length} project skills`)
            }
          } catch (error) {
            console.error('[API] Unexpected error when fetching project skills:', error)
            projectSkillsData = [];
          }
        }
      } catch (error) {
        console.error('[API] Unexpected error when fetching projects:', error)
        projectsData = [];
      }
    }

    console.log('[API] All database fetching completed. Calculating projections...')

    // IMPORTANT: From this point on, we need to ensure we handle potential empty arrays
    // and avoid operations that might throw exceptions

    // Calculate timeframe in months
    const startDate = new Date();
    const targetDate = new Date(data.revenue_targets.target_date);
    const monthsDuration = Math.max(1, (
      (targetDate.getFullYear() - startDate.getFullYear()) * 12 + 
      targetDate.getMonth() - startDate.getMonth()
    ));

    console.log(`[API] Calculated ${monthsDuration} months duration between now and target date`)

    // Generate monthly revenue projections based on growth model
    const monthlyProjections: Array<{
      month: number;
      date: string;
      formatted_date: string;
      revenue: number;
    }> = [];
    const revenueGrowth = data.revenue_targets.target_revenue - data.revenue_targets.current_revenue;
    
    for (let month = 0; month <= monthsDuration; month++) {
      let monthlyRevenue = 0;
      
      if (data.growth_model === 'linear') {
        // Linear growth: consistent month-over-month growth
        monthlyRevenue = data.revenue_targets.current_revenue + 
          (revenueGrowth * (month / monthsDuration));
      } else if (data.growth_model === 'exponential') {
        // Exponential growth: accelerating growth rate
        const growthRate = Math.pow(
          data.revenue_targets.target_revenue / data.revenue_targets.current_revenue, 
          1 / monthsDuration
        ) - 1;
        monthlyRevenue = data.revenue_targets.current_revenue * Math.pow(1 + growthRate, month);
      } else if (data.growth_model === 'stepwise') {
        // Stepwise growth: jumps at certain intervals
        if (month < monthsDuration / 3) {
          monthlyRevenue = data.revenue_targets.current_revenue;
        } else if (month < 2 * monthsDuration / 3) {
          monthlyRevenue = data.revenue_targets.current_revenue + revenueGrowth * 0.5;
        } else {
          monthlyRevenue = data.revenue_targets.target_revenue;
        }
      }
      
      // Calculate projected date
      const projDate = new Date(startDate);
      projDate.setMonth(startDate.getMonth() + month);
      
      monthlyProjections.push({
        month: month,
        date: projDate.toISOString().split('T')[0],
        formatted_date: projDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        revenue: monthlyRevenue
      });
    }
    
    console.log(`[API] Generated ${monthlyProjections.length} monthly projections`)
    
    // Calculate current department metrics
    const departmentMetrics = new Map();
    
    // Group employees by department
    departmentsData.forEach((dept: any) => {
      const deptEmployees = employeesData.filter(emp => emp.department_id === dept.id);
      const totalSalary = deptEmployees.reduce((sum, emp) => sum + (emp.salary || 0), 0);
      
      // Get all skills in this department
      const deptSkills = new Map();
      deptEmployees.forEach(emp => {
        const empSkills = employeeSkillsData.filter(es => es.employee_id === emp.id);
        empSkills.forEach(es => {
          const skillInfo = es.skills || skillsData.find(s => s.id === es.skill_id);
          if (skillInfo) {
            const skillName = skillInfo.name || `Skill ${es.skill_id}`;
            const skillCount = deptSkills.get(es.skill_id)?.count || 0;
            deptSkills.set(es.skill_id, {
              id: es.skill_id,
              name: skillName,
              category: skillInfo.category || 'Unknown',
              count: skillCount + 1
            });
          }
        });
      });
      
      departmentMetrics.set(dept.id, {
        id: dept.id,
        name: dept.name,
        description: dept.description,
        current_headcount: deptEmployees.length,
        monthly_salary_cost: totalSalary,
        annual_salary_cost: totalSalary * 12,
        revenue_contribution: 0, // Will calculate after totals
        skills: Array.from(deptSkills.values()),
        projected_headcount: []
      });
    });
    
    console.log(`[API] Calculated metrics for ${departmentMetrics.size} departments`)
    
    // Calculate revenue contribution by department (based on salary proportion as proxy)
    const totalSalary = employeesData.reduce((sum, emp) => sum + (emp.salary || 0), 0);
    let totalWeightedContribution = 0;
    
    departmentMetrics.forEach((dept) => {
      const salaryProportion = dept.annual_salary_cost / (totalSalary * 12 || 1);
      const revenueContribution = data.revenue_targets.current_revenue * salaryProportion;
      dept.revenue_contribution = revenueContribution;
      dept.revenue_per_employee = dept.current_headcount > 0 ? 
        revenueContribution / dept.current_headcount : 0;
      
      totalWeightedContribution += dept.current_headcount * (dept.revenue_per_employee || 0);
    });
    
    console.log('[API] Calculated revenue contributions for departments')
    
    // Calculate projected headcount by department based on revenue growth
    departmentMetrics.forEach((dept) => {
      // Apply priorities if specified
      const isPrioritized = data.prioritize_departments?.includes(dept.id);
      const priorityMultiplier = isPrioritized ? 1.2 : 1.0;
      
      monthlyProjections.forEach((projection, i) => {
        const revenueGrowthFactor = projection.revenue / data.revenue_targets.current_revenue;
        
        // Calculate revenue-based headcount need, adjusted by efficiency factor
        let projectedHeadcount = Math.ceil(
          dept.current_headcount * 
          revenueGrowthFactor * 
          priorityMultiplier * 
          data.efficiency_factor
        );
        
        // Account for attrition
        const attrition = Math.floor(dept.current_headcount * (data.attrition_rate / 100) * (i / monthsDuration));
        projectedHeadcount += attrition;
        
        dept.projected_headcount.push({
          month: projection.month,
          date: projection.date,
          headcount: projectedHeadcount,
          new_hires_needed: Math.max(0, projectedHeadcount - dept.current_headcount),
          monthly_salary_cost: (projectedHeadcount / Math.max(1, dept.current_headcount)) * dept.monthly_salary_cost || 0,
          monthly_revenue: projection.revenue * (dept.revenue_contribution / Math.max(1, data.revenue_targets.current_revenue))
        });
      });
    });
    
    console.log('[API] Calculated projected headcounts for all departments')
    
    // Calculate skill-level projections across organization
    const skillProjections = new Map();
    
    // First, identify all skills in the organization
    employeeSkillsData.forEach(es => {
      const skillInfo = es.skills || skillsData.find(s => s.id === es.skill_id);
      if (skillInfo && !skillProjections.has(es.skill_id)) {
        skillProjections.set(es.skill_id, {
          id: es.skill_id,
          name: skillInfo.name || `Skill ${es.skill_id}`,
          category: skillInfo.category || 'Unknown',
          current_count: 0,
          required_for_projects: 0,
          projected_needs: []
        });
      }
    });
    
    // Also add any skills from our skills table not already included
    skillsData.forEach(skill => {
      if (!skillProjections.has(skill.id)) {
        skillProjections.set(skill.id, {
          id: skill.id,
          name: skill.name || `Skill ${skill.id}`,
          category: skill.category || 'Unknown',
          current_count: 0,
          required_for_projects: 0,
          projected_needs: []
        });
      }
    });
    
    console.log(`[API] Identified ${skillProjections.size} skills for projection`)
    
    // Count current skills across organization
    employeesData.forEach(emp => {
      const empSkills = employeeSkillsData.filter(es => es.employee_id === emp.id);
      empSkills.forEach(es => {
        const skillProj = skillProjections.get(es.skill_id);
        if (skillProj) {
          skillProj.current_count += 1;
        }
      });
    });
    
    // Add required skills from projects
    projectSkillsData.forEach(ps => {
      const skillProj = skillProjections.get(ps.skill_id);
      if (skillProj) {
        skillProj.required_for_projects += ps.headcount_needed || 1;
      }
    });
    
    // Project skill needs based on department growth
    skillProjections.forEach((skillProj) => {
      monthlyProjections.forEach((projection, monthIndex) => {
        // Calculate total employees with this skill needed across all departments
        let totalNeeded = 0;
        
        departmentMetrics.forEach((dept) => {
          // Get initial proportion of employees with this skill in the dept
          const deptSkillInfo = dept.skills.find((s: { id: string }) => s.id === skillProj.id);
          if (deptSkillInfo) {
            const skillProportion = deptSkillInfo.count / Math.max(1, dept.current_headcount);
            const deptProjection = dept.projected_headcount[monthIndex];
            if (deptProjection) {
              totalNeeded += Math.ceil(deptProjection.headcount * skillProportion);
            }
          }
        });
        
        // Add skills needed specifically for projects in this timeframe
        if (monthIndex === monthlyProjections.length - 1) {
          totalNeeded += skillProj.required_for_projects;
        }
        
        skillProj.projected_needs.push({
          month: projection.month,
          date: projection.date,
          count_needed: totalNeeded,
          gap: totalNeeded - skillProj.current_count,
          severity: calculateSeverity(totalNeeded, skillProj.current_count)
        });
      });
    });
    
    console.log('[API] Calculated skill projections for all skills')
    
    // Analyze hiring feasibility based on hiring capacity
    let totalNewHires = 0;
    departmentMetrics.forEach(dept => {
      const finalProjection = dept.projected_headcount[dept.projected_headcount.length - 1];
      if (finalProjection) {
        totalNewHires += finalProjection.new_hires_needed;
      }
    });
    
    const totalHiringMonths = Math.ceil(totalNewHires / Math.max(1, (data.hiring_capacity_per_month || 1)));
    const hiringFeasible = totalHiringMonths <= monthsDuration;
    
    console.log(`[API] Calculated hiring feasibility: ${totalNewHires} new hires needed, feasible: ${hiringFeasible}`)
    
    // Identify critical skills with the largest gaps
    const criticalSkills = Array.from(skillProjections.values())
      .map(skill => {
        const finalProjection = skill.projected_needs[skill.projected_needs.length - 1];
        if (!finalProjection) return null;
        
        return {
          id: skill.id,
          name: skill.name,
          category: skill.category,
          current_count: skill.current_count,
          needed_count: finalProjection.count_needed,
          gap: finalProjection.gap,
          severity: finalProjection.severity
        };
      })
      .filter(skill => skill && skill.gap > 0)
      .sort((a, b) => {
        if (!a || !b) return 0;
        return b.gap - a.gap;
      })
      .slice(0, 5); // Top 5 critical skills
      
    console.log(`[API] Identified ${criticalSkills.length} critical skills`)
    
    // Prepare departments array for the response
    const departmentsArray = Array.from(departmentMetrics.values()).map(dept => ({
      id: dept.id,
      name: dept.name,
      description: dept.description,
      current_headcount: dept.current_headcount,
      revenue_contribution: dept.revenue_contribution,
      revenue_per_employee: dept.revenue_per_employee,
      skills: dept.skills,
      projections: dept.projected_headcount
    }));
    
    // Generate recommendations
    const recommendations = [];
    
    // Timeline recommendations
    if (!hiringFeasible) {
      recommendations.push(`Extend timeline: Current hiring capacity insufficient to meet headcount needs. Need ${totalHiringMonths} months to hire ${totalNewHires} new employees`);
    }
    
    // Department-specific recommendations
    departmentsArray
      .sort((a, b) => {
        const aFinalProj = a.projections[a.projections.length - 1];
        const bFinalProj = b.projections[b.projections.length - 1];
        if (!aFinalProj || !bFinalProj) return 0;
        
        const aGrowth = aFinalProj.headcount - a.current_headcount;
        const bGrowth = bFinalProj.headcount - b.current_headcount;
        return bGrowth - aGrowth;
      })
      .slice(0, 3) // Top 3 departments by growth
      .forEach(dept => {
        const finalProjection = dept.projections[dept.projections.length - 1];
        if (!finalProjection) return;
        
        const growthPercent = ((finalProjection.headcount - dept.current_headcount) / Math.max(1, dept.current_headcount) * 100).toFixed(0);
        recommendations.push(`${dept.name}: Plan to grow by ${growthPercent}% (${finalProjection.new_hires_needed} new hires) to support revenue targets`);
      });
    
    // Skills recommendations
    criticalSkills.forEach(skill => {
      if (skill) {
        recommendations.push(`${skill.name} (${skill.category}): Critical skill gap of ${skill.gap} employees needed to meet revenue goals`);
      }
    });
    
    console.log(`[API] Generated ${recommendations.length} recommendations`)
    
    // Construct the final response
    const result = {
      revenue_analysis: {
        current_revenue: data.revenue_targets.current_revenue,
        target_revenue: data.revenue_targets.target_revenue,
        growth_percentage: (data.revenue_targets.target_revenue / data.revenue_targets.current_revenue - 1) * 100,
        months_to_target: monthsDuration
      },
      hiring_analysis: {
        total_current_headcount: employeesData.length,
        total_new_hires_needed: totalNewHires,
        hiring_capacity_per_month: data.hiring_capacity_per_month,
        hiring_feasible: hiringFeasible,
        hiring_timeline_months: totalHiringMonths
      },
      departments: departmentsArray,
      critical_skills: criticalSkills,
      monthly_projections: monthlyProjections,
      recommendations: recommendations
    };
    
    console.log('[API] Successfully prepared response')
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[API] Fatal error in cross-organization scenario analysis:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

// Helper function to calculate severity based on gap
function calculateSeverity(required: number, available: number): string {
  if (available === 0 && required > 0) return "Critical";
  if (required === 0) return "Low";
  
  const coverage = available / required;
  
  if (coverage < 0.5) return "Critical";
  if (coverage < 0.75) return "High";
  if (coverage < 0.9) return "Medium";
  return "Low";
}
