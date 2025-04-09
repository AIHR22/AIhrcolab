import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Add necessary types (adjust based on your actual table structures)
type Skill = { id: string; name: string; }
// Adjusted EmployeeSkill to expect skills as an object, not array, based on query structure
type EmployeeSkill = { skill_id: string; proficiency_level: number; skills: Skill | null }
// Updated Employee type to include salary
type Employee = { 
  id: string; 
  first_name: string; 
  last_name: string; 
  salary: number | null; // Added salary
  employee_skills: EmployeeSkill[]; 
}
// Updated RequiredSkill type
type RequiredSkill = { 
  skill_id: string; 
  required_proficiency: number; 
  headcount_needed: number; // Added headcount needed per skill
}
// Type for budget analysis result
type BudgetAnalysisResult = {
  feasible: boolean;
  estimatedCost: number;
  budget: number;
  variance: number;
  details: string;
}

import { aiRecommendationService } from './ai-recommendation-service';

export const workforcePlanningService = {
  async getDepartmentOverview() {
    console.log("Fetching department overview data...")
    try {
      const { data: departments, error: deptError } = await supabase
        .from('departments')
        .select('id, name, description') // Only select fields that definitely exist

      if (deptError) {
        console.error("Error fetching departments:", deptError)
        throw deptError
      }

      const { data: employees, error: empError } = await supabase
        .from('employees')
        .select('id, department_id')
        // Optionally filter by status if needed, e.g., only active employees
        // .eq('status', 'active') 

      if (empError) {
        console.error("Error fetching employees:", empError)
        throw empError
      }

      const headcountByDept = employees.reduce((acc, employee) => {
        if (employee.department_id) {
          acc[employee.department_id] = (acc[employee.department_id] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>)

      const overviewData = departments.map(dept => ({
        id: dept.id,
        name: dept.name,
        description: dept.description,
        currentHeadcount: headcountByDept[dept.id] || 0,
        // Use a default value for required headcount since the field doesn't exist
        requiredHeadcount: 0 
      }))

      console.log("Department Overview Data:", overviewData)
      return overviewData
    } catch (error) {
      console.error("Error in getDepartmentOverview:", error)
      throw error // Re-throw the error to be handled by the caller
    }
  },
  
  // Placeholder for the combined dashboard data fetcher
  async getDashboardData() {
    console.log("Fetching workforce planning dashboard data...")
    try {
      const departmentOverview = await this.getDepartmentOverview()
      // Fetch data for other dashboard components here later
      return {
        departmentOverview,
        attritionRisk: [], // Placeholder
        skillDemand: [], // Placeholder
        budgetVsActual: [], // Placeholder
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      return { // Return default structure on error
        departmentOverview: [],
        attritionRisk: [],
        skillDemand: [],
        budgetVsActual: [],
      }
    }
  },

  async getProjectsList() {
    console.log("Fetching projects list...")
    try {
      const { data: projects, error } = await supabase
        .from('projects')
        .select('id, name, start_date, end_date, status') // Select relevant columns
        .order('created_at', { ascending: false }) // Order by creation date or name

      if (error) {
        console.error("Error fetching projects list:", error)
        throw error
      }

      console.log("Fetched Projects List:", projects)
      return projects || []
    } catch (error) {
      console.error("Error in getProjectsList:", error)
      throw error
    }
  },

  async getProjectDetails(projectId: string) {
    console.log(`Fetching details for project ID: ${projectId}...`);
    try {
      const { data: project, error } = await supabase
        .from('projects')
        .select('id, name, description, start_date, end_date, status, budget, required_skills')
        .eq('id', projectId)
        .single();

      // Better error check
      if (error) {
        console.error(`Supabase error fetching project ${projectId}:`, JSON.stringify(error, null, 2));
        throw new Error(`Database error fetching project details: ${error.message} (Code: ${error.code})`);
      }
      if (!project) {
        // This case might happen if the ID is valid UUID but doesn't exist
        console.warn(`Project with ID ${projectId} not found in database.`);
        throw new Error(`Project with ID ${projectId} not found.`);
      }

      console.log(`Fetched Project Details for ${projectId}:`, project);
      return { ...project, required_skills: (project.required_skills || []) as RequiredSkill[] };
    } catch (error: any) {
      // Catch potential errors from casting or other issues too
      console.error(`Error in getProjectDetails for ${projectId}:`, error);
      // Re-throw with a more specific message if it's not already informative
      throw new Error(error.message || `Failed to get project details for ${projectId}`); 
    }
  },

  // getEmployeesWithSkills - Updated to fetch salary
  async getEmployeesWithSkills() {
    console.log("Fetching employees with skills and salary...");
    try {
      const { data: employees, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, salary, employee_skills (skill_id, proficiency_level, skills ( id, name ))');

      // Better error check
      if (error) {
        console.error(`Supabase error fetching employees with skills:`, JSON.stringify(error, null, 2));
        throw new Error(`Database error fetching employees: ${error.message} (Code: ${error.code})`);
      }
      return (employees || []) as unknown as Employee[];
    } catch (error: any) {
      console.error("Error in getEmployeesWithSkills:", error);
      throw new Error(error.message || "Failed to get employees with skills"); 
    }
  },

  // Combined method for project analysis page - Updated Budget Logic
  async getProjectAnalysisData(projectId: string): Promise<{
    projectDetails: any; 
    skillAnalysis: any[]; // Define more specific type later
    overallGap: number;
    budgetAnalysis: BudgetAnalysisResult; // Use defined type
    timelineAnalysis: { feasible: boolean; details: string };
    profitabilityAnalysis: { score: number; details: string };
    aiRecommendations: any;
  }> {
    console.log(`Fetching analysis data for project ID: ${projectId}...`)
    try {
      // First fetch skills directly to ensure we have the names
      const { data: skillsData, error: skillsError } = await supabase
        .from('skills')
        .select('id, name')

      if (skillsError) {
        console.error('Error fetching skills:', skillsError)
        throw skillsError
      }

      // Create a map for quick skill lookups
      const skillsMap = new Map()
      skillsData?.forEach(skill => {
        skillsMap.set(skill.id, skill.name)
      })

      const [projectDetails, employeesWithSkills] = await Promise.all([
        this.getProjectDetails(projectId),
        this.getEmployeesWithSkills(),
      ])

      // --- Skill Matching Logic (Refined) --- 
      const requiredSkills = projectDetails.required_skills
      const skillAnalysis = requiredSkills.map((reqSkill: RequiredSkill) => {
        const qualifiedEmployees = employeesWithSkills.filter(emp => 
          emp.employee_skills.some(empSkill => 
            empSkill.skill_id === reqSkill.skill_id && 
            empSkill.proficiency_level >= (reqSkill.required_proficiency || 1)
          )
        ).map(emp => ({ id: emp.id, name: `${emp.first_name} ${emp.last_name}` }))

        const needed = reqSkill.headcount_needed || 1
        const availableCount = qualifiedEmployees.length
        const gap = needed - availableCount 

        // Look up skill name directly from our skills map, only falling back to employee data if needed
        const skillName = skillsMap.get(reqSkill.skill_id) || 
          employeesWithSkills
            .flatMap(emp => emp.employee_skills)
            .find(empSkill => empSkill.skill_id === reqSkill.skill_id && empSkill.skills)?.skills?.name || 
          `Skill ID: ${reqSkill.skill_id}`  // Last resort fallback with ID for clarity

        return {
          skillId: reqSkill.skill_id,
          skillName: skillName,
          requiredProficiency: reqSkill.required_proficiency || 1,
          headcountNeeded: needed,
          qualifiedEmployees: qualifiedEmployees,
          gap: gap, 
        }
      })
      
      const overallGap = skillAnalysis.reduce((sum, skill) => sum + Math.max(0, skill.gap), 0)

      // --- Budget Analysis Logic --- 
      let estimatedCost = 0
      let budgetAnalysis: BudgetAnalysisResult
      const budget = projectDetails.budget || 0
      const startDate = projectDetails.start_date ? new Date(projectDetails.start_date) : null
      const endDate = projectDetails.end_date ? new Date(projectDetails.end_date) : null

      if (startDate && endDate && endDate > startDate) {
        // Calculate duration in months (simplified)
        const durationMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth()) + 1
        
        // Calculate average salary (simplification - use only employees with salary)
        const salaries = employeesWithSkills.map(e => e.salary).filter(s => s !== null && s > 0) as number[]
        const averageSalary = salaries.length > 0 ? salaries.reduce((a, b) => a + b, 0) / salaries.length : 60000; // Default avg salary if none found
        const averageMonthlySalary = averageSalary / 12
        
        // Estimate cost based on total skill shortfall
        estimatedCost = overallGap * averageMonthlySalary * durationMonths
        
        const variance = budget - estimatedCost
        const feasible = variance >= 0

        budgetAnalysis = {
          feasible,
          estimatedCost,
          budget,
          variance,
          details: feasible 
            ? `Estimated cost is within budget. $${variance.toLocaleString(undefined, { maximumFractionDigits: 0 })} remaining.` 
            : `Estimated cost exceeds budget by $${(-variance).toLocaleString(undefined, { maximumFractionDigits: 0 })}.`
        }
      } else {
        // Cannot calculate cost if dates are invalid
        budgetAnalysis = {
          feasible: false,
          estimatedCost: 0,
          budget: budget,
          variance: budget, // Variance equals budget if cost is 0
          details: "Cannot estimate cost due to missing or invalid project dates."
        }
      }

      // --- Calculate timeline analysis --- 
      let timelineAnalysis = { feasible: false, details: "Cannot analyze timeline due to missing or invalid project dates." }
      
      if (startDate && endDate && endDate > startDate) {
        // Calculate how many days are needed per skill gap
        const daysPerResource = 15 // Avg days to onboard a new resource
        const timelineImpactDays = overallGap * daysPerResource
        
        // Calculate total project duration
        const projectDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        
        // Calculate % buffer in the timeline (assuming 20% is considered good)
        const bufferPercentage = Math.max(0, 1 - (timelineImpactDays / projectDuration))
        const bufferDays = projectDuration - timelineImpactDays
        
        // Determine if timeline is feasible
        const feasible = bufferPercentage >= 0.8 // At least 80% of time remains after accounting for delays
        
        timelineAnalysis = {
          feasible,
          details: feasible 
            ? `Project timeline includes sufficient buffer (${Math.round(bufferPercentage * 100)}% or ${bufferDays} days).`
            : `Project timeline may be at risk. Estimated impact: ${timelineImpactDays} days delay with only ${Math.round(bufferPercentage * 100)}% buffer.`
        }
      }

      // --- Calculate profitability analysis ---
      let profitabilityAnalysis = { score: 0, details: "Cannot analyze profitability due to missing financial data." }
      
      // Check if estimated_revenue exists in projectDetails or fallback to a calculated value
      const projectRevenue = (projectDetails as any).estimated_revenue || 
                            (projectDetails as any).expected_revenue || 
                            (projectDetails.budget ? projectDetails.budget * 1.5 : 0) // Fallback to 1.5x budget if no revenue specified
      
      if (projectRevenue > 0 && estimatedCost > 0) {
        // Calculate ROI
        const roi = (projectRevenue - estimatedCost) / estimatedCost
        
        // Calculate profitability score (0 to 1)
        const score = Math.min(1, Math.max(0, (roi + 0.2) / 1.2)) // Normalize: -0.2 ROI = 0 score, 1.0 ROI = 1.0 score
        
        profitabilityAnalysis = {
          score,
          details: score >= 0.5 
            ? `Expected ROI: ${(roi * 100).toFixed(1)}%. Project is likely to be profitable.`
            : `Expected ROI: ${(roi * 100).toFixed(1)}%. Profitability is below target threshold.`
        }
      }

      return {
        projectDetails,
        skillAnalysis,
        overallGap,
        budgetAnalysis, // Return calculated analysis
        timelineAnalysis, // Now uses actual calculations
        profitabilityAnalysis, // Now uses actual calculations
        aiRecommendations: await aiRecommendationService.getRecommendations({
          projectDetails,
          skillGaps: skillAnalysis.filter(s => s.gap > 0).map(s => ({
            skillId: s.skillId,
            skillName: s.skillName,
            gap: s.gap
          })),
          budgetAnalysis
        })
      }

    } catch (error: any) {
      // This catch block will now receive the more detailed error thrown from getProjectDetails or getEmployeesWithSkills
      console.error(`Error fetching analysis data for project ${projectId}:`, error);
      // Return a default/error structure compatible with the expected return type
       return {
        projectDetails: { id: projectId, name: "Error Loading Project", required_skills: [] },
        skillAnalysis: [],
        overallGap: 0,
        budgetAnalysis: { feasible: false, estimatedCost: 0, budget: 0, variance: 0, details: `Error loading analysis data: ${error.message}` }, // Include error message
        timelineAnalysis: { feasible: false, details: "Error loading analysis data." },
        profitabilityAnalysis: { score: 0, details: "Error loading analysis data." },
        aiRecommendations: []
      };
       // Optionally re-throw if the calling component should handle the error state explicitly 
       // throw new Error(error.message || `Failed to get project analysis for ${projectId}`);
    }
  }
} 