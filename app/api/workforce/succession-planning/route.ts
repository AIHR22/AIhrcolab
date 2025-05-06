import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { generateWithLlama3 } from "@/lib/together"
import type { Json } from "@/types/supabase"

interface SuccessionPlanningRequest {
  project_id?: string
  department_id?: string
  position_id?: string
  performance_threshold?: number
  include_development_plans?: boolean
}

export const POST = async (request: Request) => {
  try {
    const body: SuccessionPlanningRequest = await request.json()
    
    // Validate request
    if (!body.project_id && !body.department_id && !body.position_id) {
      return NextResponse.json({
        error: "Missing required parameter: project_id, department_id, or position_id"
      }, { status: 400 })
    }
    
    // Set default performance threshold if not provided (85%)
    const performanceThreshold = body.performance_threshold || 85
    
    // Get employees based on project, department, or position
    let employees: any[] = []
    let projectName = ""
    let departmentName = ""
    let positionTitle = ""
    
    if (body.project_id) {
      // Get project data
      const { data: project, error: projError } = await supabaseAdmin
        .from("projects")
        .select("id, name")
        .eq("id", body.project_id)
        .single()
      
      if (projError) {
        console.error("[API] Error fetching project:", projError)
        throw projError
      }
      
      projectName = project.name
      
      // Get employees allocated to this project
      const { data: allocations, error: allocError } = await supabaseAdmin
        .from("project_allocations")
        .select(`
          project_id,
          employee_id,
          role,
          employees (
            id,
            name,
            position_id,
            department_id,
            hire_date,
            status,
            positions (
              id,
              title,
              level,
              is_manager
            ),
            departments (
              id,
              name
            )
          )
        `)
        .eq("project_id", body.project_id)
      
      if (allocError) {
        console.error("[API] Error fetching allocations:", allocError)
        throw allocError
      }
      
      employees = (allocations || []).map(alloc => ({
        id: alloc.employee_id,
        name: alloc.employees?.name,
        position_id: alloc.employees?.position_id,
        position_title: alloc.employees?.positions?.title,
        level: alloc.employees?.positions?.level,
        is_manager: alloc.employees?.positions?.is_manager,
        department_id: alloc.employees?.department_id,
        department_name: alloc.employees?.departments?.name,
        project_role: alloc.role,
        hire_date: alloc.employees?.hire_date,
        status: alloc.employees?.status
      })).filter(emp => emp.name) // Filter out any undefined employees
    } else if (body.department_id) {
      // Get department data
      const { data: department, error: deptError } = await supabaseAdmin
        .from("departments")
        .select("id, name")
        .eq("id", body.department_id)
        .single()
      
      if (deptError) {
        console.error("[API] Error fetching department:", deptError)
        throw deptError
      }
      
      departmentName = department.name
      
      // Get employees in this department
      const { data: deptEmployees, error: empError } = await supabaseAdmin
        .from("employees")
        .select(`
          id,
          name,
          position_id,
          department_id,
          hire_date,
          status,
          positions (
            id,
            title,
            level,
            is_manager
          ),
          departments (
            id,
            name
          )
        `)
        .eq("department_id", body.department_id)
        .eq("status", "active")
      
      if (empError) {
        console.error("[API] Error fetching employees:", empError)
        throw empError
      }
      
      employees = (deptEmployees || []).map(emp => ({
        id: emp.id,
        name: emp.name,
        position_id: emp.position_id,
        position_title: emp.positions?.title,
        level: emp.positions?.level,
        is_manager: emp.positions?.is_manager,
        department_id: emp.department_id,
        department_name: emp.departments?.name,
        hire_date: emp.hire_date,
        status: emp.status
      }))
    } else if (body.position_id) {
      // Get position data
      const { data: position, error: posError } = await supabaseAdmin
        .from("positions")
        .select("id, title, level, is_manager")
        .eq("id", body.position_id)
        .single()
      
      if (posError) {
        console.error("[API] Error fetching position:", posError)
        throw posError
      }
      
      positionTitle = position.title
      
      // Get employees with this position
      const { data: posEmployees, error: empError } = await supabaseAdmin
        .from("employees")
        .select(`
          id,
          name,
          position_id,
          department_id,
          hire_date,
          status,
          departments (
            id,
            name
          )
        `)
        .eq("position_id", body.position_id)
        .eq("status", "active")
      
      if (empError) {
        console.error("[API] Error fetching employees by position:", empError)
        throw empError
      }
      
      employees = (posEmployees || []).map(emp => ({
        id: emp.id,
        name: emp.name,
        position_id: emp.position_id,
        position_title: positionTitle,
        level: position.level,
        is_manager: position.is_manager,
        department_id: emp.department_id,
        department_name: emp.departments?.name,
        hire_date: emp.hire_date,
        status: emp.status
      }))
    }
    
    if (employees.length === 0) {
      return NextResponse.json({
        message: "No employees found for the specified criteria",
        data: []
      }, { status: 200 })
    }
    
    // Get all employees to create talent pool from
    const { data: allEmployees, error: allEmpError } = await supabaseAdmin
      .from("employees")
      .select(`
        id,
        name,
        position_id,
        department_id,
        hire_date,
        status,
        positions (
          id,
          title,
          level,
          is_manager
        ),
        departments (
          id,
          name
        ),
        employee_skills (
          skill_id,
          proficiency_level,
          skills (
            id,
            name,
            category
          )
        )
      `)
      .eq("status", "active")
    
    if (allEmpError) {
      console.error("[API] Error fetching all employees:", allEmpError)
      throw allEmpError
    }
    
    // Get performance data
    const { data: performanceData, error: perfError } = await supabaseAdmin
      .from("employee_performance")
      .select("employee_id, overall_score, review_date")
      .order("review_date", { ascending: false })
    
    let employeePerformance: Record<string, number> = {}
    
    if (!perfError && performanceData) {
      // Group by employee and get latest review
      const latestPerformance: Record<string, any> = {}
      
      performanceData.forEach(review => {
        if (!latestPerformance[review.employee_id] || 
            new Date(review.review_date) > new Date(latestPerformance[review.employee_id].review_date)) {
          latestPerformance[review.employee_id] = review
        }
      })
      
      // Extract overall scores
      Object.values(latestPerformance).forEach((review: any) => {
        employeePerformance[review.employee_id] = review.overall_score
      })
    } else {
      console.error("[API] Error fetching performance data:", perfError)
      // Use default performance values
      employees.forEach(emp => {
        employeePerformance[emp.id] = 75 // Default performance score
      })
      
      allEmployees?.forEach(emp => {
        if (!employeePerformance[emp.id]) {
          employeePerformance[emp.id] = 75 // Default performance score
        }
      })
    }
    
    // Current leadership positions
    const currentLeaders = employees.filter(emp => emp.is_manager)
    
    // Format current leadership for the response
    const leadershipPositions = currentLeaders.map(leader => ({
      position_id: leader.position_id,
      position_title: leader.position_title,
      employee_id: leader.id,
      employee_name: leader.name,
      department: leader.department_name,
      level: leader.level
    }))
    
    // Identify potential successors for each leadership position
    const successionPlans: any[] = []
    
    // For each leadership position, identify potential successors
    leadershipPositions.forEach(position => {
      // Find potential successors based on:
      // 1. Performance above threshold
      // 2. One level below current leader
      // 3. Similar skills to the leader
      
      // Extract leadership position level
      const leaderLevel = position.level
      const targetLevel = leaderLevel && typeof leaderLevel === 'string' 
        ? getPreviousLevel(leaderLevel) 
        : null
      
      // Filter potential candidates
      let candidates = allEmployees?.filter(emp => {
        // Must meet performance threshold
        const performance = employeePerformance[emp.id] || 0
        
        // Should not be already a manager (unless we're looking for higher level managers)
        const isAlreadyManager = emp.positions?.is_manager
        
        // Should be at the appropriate level
        const correctLevel = targetLevel 
          ? emp.positions?.level === targetLevel
          : true
        
        return performance >= performanceThreshold && 
               (!isAlreadyManager || leaderLevel === 'executive' || leaderLevel === 'director') &&
               correctLevel
      }) || []
      
      // Score candidates based on:
      // - Performance (40%)
      // - Tenure (20%)
      // - Skills match (30%)
      // - Department match (10%)
      
      // Get leader's skills
      const leaderEmployee = allEmployees?.find(emp => emp.id === position.employee_id)
      const leaderSkills = leaderEmployee?.employee_skills || []
      
      // Calculate scores
      const scoredCandidates = candidates.map(candidate => {
        const performanceScore = employeePerformance[candidate.id] || 0
        
        // Calculate tenure score (0-100)
        const hireDate = candidate.hire_date ? new Date(candidate.hire_date) : new Date()
        const now = new Date()
        const tenureMonths = ((now.getFullYear() - hireDate.getFullYear()) * 12) + 
                             (now.getMonth() - hireDate.getMonth())
        const tenureScore = Math.min(100, tenureMonths / 36 * 100) // Max score at 3 years
        
        // Calculate skills match
        const candidateSkills = candidate.employee_skills || []
        let skillMatchScore = 0
        
        if (leaderSkills.length > 0 && candidateSkills.length > 0) {
          const leaderSkillIds = leaderSkills.map((s: any) => s.skill_id)
          const matchingSkills = candidateSkills.filter((s: any) => 
            leaderSkillIds.includes(s.skill_id)
          )
          
          skillMatchScore = (matchingSkills.length / leaderSkills.length) * 100
        }
        
        // Department match
        const departmentMatchScore = candidate.department_id === position.department 
          ? 100 
          : 0
        
        // Calculate total score with weights
        const totalScore = (performanceScore * 0.4) + 
                          (tenureScore * 0.2) + 
                          (skillMatchScore * 0.3) + 
                          (departmentMatchScore * 0.1)
        
        return {
          employee_id: candidate.id,
          employee_name: candidate.name,
          position_id: candidate.position_id,
          position_title: candidate.positions?.title,
          department_id: candidate.department_id,
          department_name: candidate.departments?.name,
          level: candidate.positions?.level,
          performance_score: performanceScore,
          tenure_months: tenureMonths,
          tenure_score: tenureScore,
          skill_match_score: skillMatchScore,
          department_match_score: departmentMatchScore,
          total_score: totalScore,
          readiness_level: getReadinessLevel(totalScore),
          key_skills: candidate.employee_skills?.map((s: any) => ({
            skill_id: s.skill_id,
            skill_name: s.skills?.name,
            proficiency: s.proficiency_level
          }))
        }
      })
      
      // Sort by total score (descending)
      scoredCandidates.sort((a, b) => b.total_score - a.total_score)
      
      // Get top 3 candidates
      const topCandidates = scoredCandidates.slice(0, 3)
      
      // Generate development plans if requested
      let developmentPlans: Record<string, string[]> = {}
      
      if (body.include_development_plans && topCandidates.length > 0) {
        try {
          // Generate development plans for top candidates
          for (const candidate of topCandidates) {
            // Create placeholder development plan
            developmentPlans[candidate.employee_id] = [
              "Strengthen leadership skills through our leadership development program",
              "Shadow the current position holder for 1-2 days per month",
              "Take on additional responsibilities in team projects to build experience",
              "Receive mentoring from senior leaders in the organization"
            ]
            
            // Try to enhance with AI if score below 85
            if (candidate.total_score < 85) {
              try {
                // Define an async function to handle AI development plan generation
                const generateAIDevelopmentPlan = async () => {
                  const promptContext = `
                    Candidate Name: ${candidate.employee_name}
                    Current Position: ${candidate.position_title}
                    Target Position: ${position.position_title}
                    Performance Score: ${candidate.performance_score}/100
                    Tenure: ${candidate.tenure_months} months
                    Skill Match Score: ${candidate.skill_match_score}/100
                    Department Match: ${candidate.department_match_score === 100 ? 'Same department' : 'Different department'}
                    Readiness Level: ${candidate.readiness_level}
                    
                    Key Skills: ${candidate.key_skills?.map((s: any) => 
                      `${s.skill_name} (Level ${s.proficiency})`
                    ).join(', ') || 'No skills data available'}
                  `
                  
                  const prompt = `
                    Create a development plan for a potential succession candidate with the following profile:
                    
                    ${promptContext}
                    
                    Return ONLY a JSON array of 4-5 specific and actionable development recommendations 
                    for this candidate to prepare for the target position. No explanation or other text.
                  `
                  
                  return await generateWithLlama3(
                    prompt, 
                    "You are an HR talent development expert specializing in succession planning.",
                    0.2,
                    1000
                  )
                }
                
                // Call the async function to get the AI response
                const aiResponse = await generateAIDevelopmentPlan()
                
                try {
                  const aiRecommendations = JSON.parse(aiResponse)
                  if (Array.isArray(aiRecommendations) && aiRecommendations.length > 0) {
                    developmentPlans[candidate.employee_id] = aiRecommendations
                  }
                } catch (parseError) {
                  console.error("Failed to parse AI development plan:", parseError)
                  // Continue with default plan
                }
              } catch (aiError) {
                console.error("Error generating AI development plan:", aiError)
              }
            }
          }
        } catch (planError) {
          console.error("Error generating development plans:", planError)
        }
      }
      
      // Add to succession plans
      successionPlans.push({
        position_id: position.position_id,
        position_title: position.position_title,
        current_leader: {
          employee_id: position.employee_id,
          employee_name: position.employee_name,
          department: position.department
        },
        candidates: topCandidates.map(candidate => ({
          ...candidate,
          development_plan: developmentPlans[candidate.employee_id] || []
        }))
      })
    })
    
    // Create response object
    const result = {
      context: {
        source_type: body.project_id ? "project" : body.department_id ? "department" : "position",
        source_id: body.project_id || body.department_id || body.position_id,
        source_name: projectName || departmentName || positionTitle,
        employee_count: employees.length,
        leadership_positions: leadershipPositions.length
      },
      leadership_positions: leadershipPositions,
      succession_plans: successionPlans,
      created_at: new Date().toISOString()
    }
    
    // Save to database if configured
    try {
      const { error: saveError } = await supabaseAdmin
        .from("succession_plans")
        .insert({
          project_id: body.project_id || null,
          department_id: body.department_id || null,
          position_id: body.position_id || null,
          plan_date: new Date().toISOString(),
          leadership_positions: leadershipPositions as Json,
          succession_plans: successionPlans as Json
        })
      
      if (saveError) {
        console.error("[API] Error saving succession plan:", saveError)
      }
    } catch (saveError) {
      console.error("[API] Error in database operation:", saveError)
    }
    
    return NextResponse.json(result, {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error: any) {
    console.error("[API] Error in succession planning:", error)
    return NextResponse.json({
      error: error.message || "Internal server error",
      details: error.details || null
    }, { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Helper function to get the previous level in hierarchy
function getPreviousLevel(currentLevel: string): string | null {
  const levelHierarchy = [
    'entry',
    'junior',
    'mid',
    'senior',
    'lead',
    'manager',
    'director',
    'executive'
  ]
  
  const currentIndex = levelHierarchy.indexOf(currentLevel.toLowerCase())
  if (currentIndex <= 0) return null
  
  return levelHierarchy[currentIndex - 1]
}

// Helper function to determine readiness level
function getReadinessLevel(score: number): string {
  if (score >= 90) return "Ready Now"
  if (score >= 75) return "Ready in 1-2 Years"
  if (score >= 60) return "Ready in 2-3 Years"
  return "Development Needed"
} 