/**
 * AI Analysis Service
 *
 * This service provides AI-powered analysis for project feasibility, skill matching,
 * capacity planning, revenue estimation, and hiring recommendations.
 */

// Types for AI analysis
export interface SkillRequirement {
  skill: string
  level: number
  count: number
}

export interface ProjectRequirements {
  projectName: string
  projectDescription: string
  startDate: Date
  endDate: Date
  budget: number
  complexity: number
  priority: "low" | "medium" | "high" | "critical"
  requiredSkills: string[]
}

export interface EmployeeSkill {
  employeeId: string
  name: string
  skills: { skill: string; level: number }[]
  currentProjects: number
  utilization: number
  department: string
}

export interface SkillMatchingResult {
  skill: string
  matchedCount: number
  totalRequired: number
  availableEmployees: {
    id: string
    name: string
    matchScore: number
    currentProjects: number
  }[]
}

export interface CapacityAnalysisResult {
  totalRequired: number
  availableCapacity: number
  capacityGap: number
  utilizationRate: number
  teamAvailability: {
    department: string
    available: number
    required: number
  }[]
}

export interface RevenueEstimationResult {
  estimatedRevenue: number
  costEstimate: number
  profitMargin: number
  roi: number
  confidenceScore: number
}

export interface HiringRecommendation {
  role: string
  count: number
  skills: string[]
  employmentType: "Full-time" | "Part-time" | "Freelance"
  annualCost: number
}

export interface HiringRecommendationsResult {
  recommendedHires: HiringRecommendation[]
  totalCost: number
  timeToHire: number
  impactOnTimeline: string
  alternativeSolutions: {
    description: string
    pros: string[]
    cons: string[]
  }[]
}

export interface ProjectAnalysisResult {
  skillMatching: {
    matchedEmployees: SkillMatchingResult[]
    overallMatch: number
  }
  capacityAnalysis: CapacityAnalysisResult
  revenueEstimation: RevenueEstimationResult
  hiringRecommendations: HiringRecommendationsResult
}

// Mock employee data for analysis
const employeesData: EmployeeSkill[] = [
  {
    employeeId: "EMP001",
    name: "John Smith",
    skills: [
      { skill: "JavaScript", level: 5 },
      { skill: "React", level: 4 },
      { skill: "Node.js", level: 4 },
      { skill: "TypeScript", level: 3 },
    ],
    currentProjects: 2,
    utilization: 85,
    department: "Engineering",
  },
  {
    employeeId: "EMP002",
    name: "Emily Johnson",
    skills: [
      { skill: "Marketing Strategy", level: 5 },
      { skill: "Content Marketing", level: 4 },
      { skill: "SEO", level: 4 },
      { skill: "Analytics", level: 3 },
    ],
    currentProjects: 1,
    utilization: 70,
    department: "Marketing",
  },
  {
    employeeId: "EMP003",
    name: "Michael Brown",
    skills: [
      { skill: "Python", level: 4 },
      { skill: "Data Analysis", level: 5 },
      { skill: "Machine Learning", level: 3 },
      { skill: "SQL", level: 4 },
    ],
    currentProjects: 1,
    utilization: 60,
    department: "Finance",
  },
  {
    employeeId: "EMP004",
    name: "Jessica Davis",
    skills: [
      { skill: "Recruitment", level: 5 },
      { skill: "Employee Relations", level: 4 },
      { skill: "Training", level: 4 },
      { skill: "Compliance", level: 5 },
    ],
    currentProjects: 1,
    utilization: 90,
    department: "Human Resources",
  },
  {
    employeeId: "EMP005",
    name: "David Wilson",
    skills: [
      { skill: "Product Management", level: 5 },
      { skill: "Agile", level: 4 },
      { skill: "User Research", level: 4 },
      { skill: "Roadmapping", level: 5 },
    ],
    currentProjects: 2,
    utilization: 75,
    department: "Product",
  },
  {
    employeeId: "EMP006",
    name: "Sarah Martinez",
    skills: [
      { skill: "Sales", level: 5 },
      { skill: "Negotiation", level: 4 },
      { skill: "CRM", level: 4 },
      { skill: "Client Relations", level: 5 },
    ],
    currentProjects: 1,
    utilization: 80,
    department: "Sales",
  },
  {
    employeeId: "EMP007",
    name: "Robert Taylor",
    skills: [
      { skill: "JavaScript", level: 4 },
      { skill: "React", level: 3 },
      { skill: "QA", level: 5 },
      { skill: "Testing", level: 5 },
    ],
    currentProjects: 1,
    utilization: 70,
    department: "Engineering",
  },
  {
    employeeId: "EMP008",
    name: "Jennifer Anderson",
    skills: [
      { skill: "UI/UX Design", level: 5 },
      { skill: "Figma", level: 5 },
      { skill: "User Research", level: 4 },
      { skill: "Prototyping", level: 4 },
    ],
    currentProjects: 1,
    utilization: 85,
    department: "Design",
  },
  {
    employeeId: "EMP009",
    name: "Christopher Thomas",
    skills: [
      { skill: "Operations", level: 5 },
      { skill: "Process Improvement", level: 4 },
      { skill: "Project Management", level: 3 },
      { skill: "Vendor Management", level: 4 },
    ],
    currentProjects: 1,
    utilization: 65,
    department: "Operations",
  },
  {
    employeeId: "EMP010",
    name: "Lisa Rodriguez",
    skills: [
      { skill: "JavaScript", level: 2 },
      { skill: "Customer Support", level: 5 },
      { skill: "Documentation", level: 4 },
      { skill: "Training", level: 4 },
    ],
    currentProjects: 1,
    utilization: 75,
    department: "Customer Support",
  },
]

// AI Analysis Service
export class AIAnalysisService {
  // Analyze skill matching between project requirements and available employees
  analyzeSkillMatching(requirements: ProjectRequirements): SkillMatchingResult[] {
    const results: SkillMatchingResult[] = []

    // For each required skill, find matching employees
    for (const skill of requirements.requiredSkills) {
      const matchingEmployees = employeesData.filter((employee) =>
        employee.skills.some((s) => s.skill.toLowerCase() === skill.toLowerCase()),
      )

      // Calculate the number of employees needed for this skill (based on project complexity)
      const totalRequired = Math.max(1, Math.ceil(requirements.complexity / 33))

      // Format the result
      results.push({
        skill,
        matchedCount: matchingEmployees.length,
        totalRequired,
        availableEmployees: matchingEmployees
          .map((employee) => {
            const skillMatch = employee.skills.find((s) => s.skill.toLowerCase() === skill.toLowerCase())
            return {
              id: employee.employeeId,
              name: employee.name,
              matchScore: skillMatch ? skillMatch.level * 20 : 0, // Convert level (1-5) to percentage
              currentProjects: employee.currentProjects,
            }
          })
          .sort((a, b) => b.matchScore - a.matchScore), // Sort by match score
      })
    }

    return results
  }

  // Analyze capacity based on project requirements and employee availability
  analyzeCapacity(requirements: ProjectRequirements): CapacityAnalysisResult {
    // Calculate total required resources based on project complexity, duration, and skills
    const projectDuration = Math.ceil(
      (requirements.endDate.getTime() - requirements.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30),
    ) // in months
    const totalRequired = Math.max(
      3,
      Math.ceil((requirements.complexity / 25) * (requirements.requiredSkills.length / 3)),
    )

    // Calculate available capacity based on employee utilization
    const availableCapacity = employeesData.reduce((total, employee) => {
      // Only count employees with at least one matching skill
      const hasMatchingSkill = requirements.requiredSkills.some((skill) =>
        employee.skills.some((s) => s.skill.toLowerCase() === skill.toLowerCase()),
      )

      if (hasMatchingSkill) {
        // Calculate available capacity as percentage of time not utilized
        const availablePercentage = Math.max(0, 100 - employee.utilization) / 100
        return total + availablePercentage
      }

      return total
    }, 0)

    // Calculate capacity gap
    const capacityGap = Math.max(0, totalRequired - availableCapacity)

    // Calculate average utilization rate
    const avgUtilizationRate =
      employeesData.reduce((total, employee) => total + employee.utilization, 0) / employeesData.length

    // Calculate team availability by department
    const departmentAvailability: { department: string; available: number; required: number }[] = []
    const departmentRequirements = new Map<string, number>()

    // Estimate required resources by department based on skills
    for (const skill of requirements.requiredSkills) {
      // Find which departments typically have this skill
      const employeesWithSkill = employeesData.filter((employee) =>
        employee.skills.some((s) => s.skill.toLowerCase() === skill.toLowerCase()),
      )

      // Count departments
      const departmentCounts = new Map<string, number>()
      for (const employee of employeesWithSkill) {
        departmentCounts.set(employee.department, (departmentCounts.get(employee.department) || 0) + 1)
      }

      // Find the department with the most employees having this skill
      let maxCount = 0
      let primaryDepartment = ""
      for (const [department, count] of departmentCounts.entries()) {
        if (count > maxCount) {
          maxCount = count
          primaryDepartment = department
        }
      }

      // Assign this skill requirement to the primary department
      if (primaryDepartment) {
        departmentRequirements.set(primaryDepartment, (departmentRequirements.get(primaryDepartment) || 0) + 1)
      }
    }

    // Calculate available resources by department
    for (const [department, required] of departmentRequirements.entries()) {
      const departmentEmployees = employeesData.filter((employee) => employee.department === department)
      const availableInDepartment = departmentEmployees.reduce((total, employee) => {
        const availablePercentage = Math.max(0, 100 - employee.utilization) / 100
        return total + availablePercentage
      }, 0)

      departmentAvailability.push({
        department,
        available: Math.round(availableInDepartment),
        required: Math.ceil(required * (totalRequired / requirements.requiredSkills.length)),
      })
    }

    return {
      totalRequired,
      availableCapacity: Math.round(availableCapacity),
      capacityGap: Math.ceil(capacityGap),
      utilizationRate: Math.round(avgUtilizationRate),
      teamAvailability: departmentAvailability,
    }
  }

  // Estimate revenue based on project requirements and historical data
  estimateRevenue(requirements: ProjectRequirements): RevenueEstimationResult {
    // Calculate project duration in months
    const projectDuration = Math.ceil(
      (requirements.endDate.getTime() - requirements.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30),
    )

    // Base revenue calculation on budget, complexity, and priority
    let estimatedRevenue = requirements.budget * 1.5 // Base revenue is 1.5x the budget

    // Adjust based on priority
    const priorityMultiplier = {
      low: 1.2,
      medium: 1.4,
      high: 1.6,
      critical: 1.8,
    }

    estimatedRevenue *= priorityMultiplier[requirements.priority]

    // Adjust based on complexity
    const complexityFactor = 1 + (requirements.complexity / 100) * 0.5
    estimatedRevenue *= complexityFactor

    // Calculate cost estimate
    const costEstimate = requirements.budget * 0.8 // Base cost is 80% of budget

    // Calculate profit margin
    const profitMargin = ((estimatedRevenue - costEstimate) / estimatedRevenue) * 100

    // Calculate ROI
    const roi = ((estimatedRevenue - costEstimate) / costEstimate) * 100

    // Calculate confidence score based on data quality
    const confidenceScore = 85 // In a real implementation, this would be calculated based on historical data

    return {
      estimatedRevenue: Math.round(estimatedRevenue),
      costEstimate: Math.round(costEstimate),
      profitMargin: Math.round(profitMargin),
      roi: Math.round(roi),
      confidenceScore,
    }
  }

  // Generate hiring recommendations based on skill gaps and capacity analysis
  generateHiringRecommendations(
    requirements: ProjectRequirements,
    skillMatching: SkillMatchingResult[],
    capacityAnalysis: CapacityAnalysisResult,
  ): HiringRecommendationsResult {
    const recommendedHires: HiringRecommendation[] = []

    // Identify skill gaps
    const skillGaps = skillMatching.filter((skill) => skill.matchedCount < skill.totalRequired)

    // Group similar skills for roles
    const roleSkills = new Map<string, string[]>()

    // Technical skills
    const technicalSkills = ["JavaScript", "TypeScript", "React", "Node.js", "Python", "Java", "C#", ".NET"]
    const designSkills = ["UI/UX Design", "Figma", "User Research", "Prototyping"]
    const dataSkills = ["Data Analysis", "Machine Learning", "SQL", "Analytics"]

    // Check which skill categories have gaps
    const hasTechnicalGap = skillGaps.some((gap) =>
      technicalSkills.some((skill) => gap.skill.toLowerCase() === skill.toLowerCase()),
    )

    const hasDesignGap = skillGaps.some((gap) =>
      designSkills.some((skill) => gap.skill.toLowerCase() === skill.toLowerCase()),
    )

    const hasDataGap = skillGaps.some((gap) =>
      dataSkills.some((skill) => gap.skill.toLowerCase() === skill.toLowerCase()),
    )

    // Generate role recommendations based on gaps
    if (hasTechnicalGap) {
      const relevantSkills = skillGaps
        .filter((gap) => technicalSkills.some((skill) => gap.skill.toLowerCase() === skill.toLowerCase()))
        .map((gap) => gap.skill)

      recommendedHires.push({
        role: "Full-stack Developer",
        count: Math.min(2, Math.ceil(capacityAnalysis.capacityGap / 2)),
        skills: relevantSkills.slice(0, 3),
        employmentType: "Full-time",
        annualCost: 180000,
      })
    }

    if (hasDesignGap) {
      const relevantSkills = skillGaps
        .filter((gap) => designSkills.some((skill) => gap.skill.toLowerCase() === skill.toLowerCase()))
        .map((gap) => gap.skill)

      recommendedHires.push({
        role: "UX Designer",
        count: 1,
        skills: relevantSkills.slice(0, 2),
        employmentType: "Freelance",
        annualCost: 45000,
      })
    }

    if (hasDataGap) {
      const relevantSkills = skillGaps
        .filter((gap) => dataSkills.some((skill) => gap.skill.toLowerCase() === skill.toLowerCase()))
        .map((gap) => gap.skill)

      recommendedHires.push({
        role: "Data Analyst",
        count: 1,
        skills: relevantSkills.slice(0, 2),
        employmentType: "Full-time",
        annualCost: 120000,
      })
    }

    // If no specific gaps but we need capacity, recommend a general role
    if (recommendedHires.length === 0 && capacityAnalysis.capacityGap > 0) {
      recommendedHires.push({
        role: "Project Specialist",
        count: Math.ceil(capacityAnalysis.capacityGap),
        skills: requirements.requiredSkills.slice(0, 3),
        employmentType: "Full-time",
        annualCost: 100000,
      })
    }

    // Calculate total cost
    const totalCost = recommendedHires.reduce((total, hire) => total + hire.annualCost * hire.count, 0)

    // Estimate time to hire based on roles and market conditions
    const timeToHire = 45 // In a real implementation, this would be calculated based on role complexity and market data

    // Determine impact on timeline
    let impactOnTimeline = "Low"
    if (capacityAnalysis.capacityGap > capacityAnalysis.totalRequired * 0.5) {
      impactOnTimeline = "High"
    } else if (capacityAnalysis.capacityGap > capacityAnalysis.totalRequired * 0.2) {
      impactOnTimeline = "Medium"
    }

    // Generate alternative solutions
    const alternativeSolutions = [
      {
        description: "Outsource development",
        pros: ["Faster start", "Lower upfront cost"],
        cons: ["Less control", "Potential quality issues"],
      },
      {
        description: "Delay project start",
        pros: ["Use existing team", "No hiring costs"],
        cons: ["Miss market opportunity", "Potential revenue loss"],
      },
    ]

    return {
      recommendedHires,
      totalCost,
      timeToHire,
      impactOnTimeline,
      alternativeSolutions,
    }
  }

  // Run a complete project analysis
  analyzeProject(requirements: ProjectRequirements): ProjectAnalysisResult {
    // Analyze skill matching
    const skillMatchingResults = this.analyzeSkillMatching(requirements)

    // Calculate overall match percentage
    const totalSkills = skillMatchingResults.length
    const totalRequired = skillMatchingResults.reduce((sum, skill) => sum + skill.totalRequired, 0)
    const totalMatched = skillMatchingResults.reduce(
      (sum, skill) => sum + Math.min(skill.matchedCount, skill.totalRequired),
      0,
    )
    const overallMatch = Math.round((totalMatched / totalRequired) * 100)

    // Analyze capacity
    const capacityAnalysis = this.analyzeCapacity(requirements)

    // Estimate revenue
    const revenueEstimation = this.estimateRevenue(requirements)

    // Generate hiring recommendations
    const hiringRecommendations = this.generateHiringRecommendations(
      requirements,
      skillMatchingResults,
      capacityAnalysis,
    )

    return {
      skillMatching: {
        matchedEmployees: skillMatchingResults,
        overallMatch,
      },
      capacityAnalysis,
      revenueEstimation,
      hiringRecommendations,
    }
  }
}

// Create and export the AI analysis service
export const createAIAnalysisService = () => {
  return new AIAnalysisService()
}

