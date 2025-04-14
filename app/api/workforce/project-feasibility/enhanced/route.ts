import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import type { ProjectFeasibilityRequest } from "@/types/workforce-planning"

export async function POST(request: Request) {
  try {
    // Parse request data
    let data: ProjectFeasibilityRequest;
    try {
      data = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!data.project_name || !data.start_date || !data.end_date || !data.required_skills?.length) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calculate project duration in days
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Initialize variables to store database results
    let skillsData: any[] = [];
    let employeesData: any[] = [];
    let employeeSkillsData: any[] = [];
    let skillGapAnalysisData: any[] = [];
    let departmentsData: any[] = [];

    // Flag to track if we're using mock data
    let usingMockData = false;
    
    // Try to fetch data from Supabase
    if (supabaseAdmin) {
      try {
        // Fetch all skills from database
        const { data: skills, error: skillsError } = await supabaseAdmin
          .from("skills")
          .select("id, name, category, description");

        if (!skillsError && skills) {
          skillsData = skills;
        } else {
          console.error("Error fetching skills:", skillsError);
          usingMockData = true;
        }

        // Fetch employees with their skills
        const { data: employees, error: employeesError } = await supabaseAdmin
          .from("employees")
          .select(`
            id, 
            first_name, 
            last_name, 
            position, 
            department_id, 
            status
          `)
          .eq("status", "active");

        if (!employeesError && employees) {
          employeesData = employees;
        } else {
          console.error("Error fetching employees:", employeesError);
          usingMockData = true;
        }

        // Fetch employee skills
        const { data: empSkills, error: employeeSkillsError } = await supabaseAdmin
          .from("employee_skills")
          .select("employee_id, skill_id, proficiency_level");

        if (!employeeSkillsError && empSkills) {
          employeeSkillsData = empSkills;
        } else {
          console.error("Error fetching employee skills:", employeeSkillsError);
          usingMockData = true;
        }

        // Fetch skill gap analysis from database
        const { data: gapAnalysis, error: skillGapAnalysisError } = await supabaseAdmin
          .from("skill_gap_analysis")
          .select("*")
          .in("skill_id", data.required_skills.map(s => s.skill_id));

        if (!skillGapAnalysisError && gapAnalysis) {
          skillGapAnalysisData = gapAnalysis;
        } else {
          console.error("Error fetching skill gap analysis:", skillGapAnalysisError);
        }

        // Get department details
        const { data: departments, error: departmentsError } = await supabaseAdmin
          .from("departments")
          .select("id, name, description");

        if (!departmentsError && departments) {
          departmentsData = departments;
        } else {
          console.error("Error fetching departments:", departmentsError);
        }
      } catch (dbError) {
        console.error("Database error:", dbError);
        usingMockData = true;
      }
    } else {
      console.log("Supabase admin client not available, using mock data");
      usingMockData = true;
    }

    // Generate mock data if needed
    if (usingMockData) {
      console.log("Using mock data for project feasibility analysis");
      
      // Create mock skills data
      skillsData = data.required_skills.map(skill => ({
        id: skill.skill_id,
        name: skill.skill_name || `Skill ${skill.skill_id.substring(0, 8)}`,
        category: "Technical",
        description: `Description for ${skill.skill_name}`
      }));

      // Create mock employees (20 employees)
      const mockEmployeeNames = [
        { first: "John", last: "Smith" },
        { first: "Emily", last: "Johnson" },
        { first: "Michael", last: "Williams" },
        { first: "Sarah", last: "Brown" },
        { first: "David", last: "Jones" },
        { first: "Emma", last: "Garcia" },
        { first: "James", last: "Miller" },
        { first: "Olivia", last: "Davis" },
        { first: "Robert", last: "Rodriguez" },
        { first: "Sophia", last: "Martinez" }
      ];
      
      employeesData = Array(20).fill(0).map((_, index) => {
        const nameIndex = index % mockEmployeeNames.length;
        return {
          id: `mock-emp-${index + 1}`,
          first_name: mockEmployeeNames[nameIndex].first,
          last_name: mockEmployeeNames[nameIndex].last,
          position: index % 3 === 0 ? "Senior Developer" : index % 3 === 1 ? "Developer" : "Junior Developer",
          department_id: `mock-dept-${(index % 4) + 1}`,
          status: "active"
        };
      });

      // Create mock employee skills
      employeeSkillsData = [];
      employeesData.forEach(emp => {
        // Each employee has 1-3 skills
        const skillCount = (emp.position === "Senior Developer" ? 3 : emp.position === "Developer" ? 2 : 1);
        
        for (let i = 0; i < skillCount; i++) {
          const skillIndex = (parseInt(emp.id.split('-')[2]) + i) % data.required_skills.length;
          employeeSkillsData.push({
            employee_id: emp.id,
            skill_id: data.required_skills[skillIndex].skill_id,
            proficiency_level: emp.position === "Senior Developer" ? 4 : emp.position === "Developer" ? 3 : 2
          });
        }
      });

      // Create mock departments
      departmentsData = [
        { id: "mock-dept-1", name: "Engineering", description: "Software Engineering Department" },
        { id: "mock-dept-2", name: "Product", description: "Product Management Department" },
        { id: "mock-dept-3", name: "Design", description: "User Experience Design Department" },
        { id: "mock-dept-4", name: "Data Science", description: "Data Science and Analytics Department" }
      ];
    }

    // Create a map of skill IDs to skill details
    const skillsMap = new Map<string, any>();
    skillsData.forEach((skill: any) => {
      skillsMap.set(skill.id, skill);
    });

    // Create a map of employee IDs to their skills
    const employeeSkillsMap = new Map<string, any[]>();
    employeeSkillsData.forEach((empSkill: any) => {
      if (!employeeSkillsMap.has(empSkill.employee_id)) {
        employeeSkillsMap.set(empSkill.employee_id, []);
      }
      employeeSkillsMap.get(empSkill.employee_id)!.push({
        skill_id: empSkill.skill_id,
        proficiency_level: empSkill.proficiency_level
      });
    });

    // Analyze skill gaps based on required skills
    const skillGaps = data.required_skills.map(reqSkill => {
      // Find skill details
      const skillDetails = skillsMap.get(reqSkill.skill_id) || { name: reqSkill.skill_name || "Unknown Skill" };
      
      // Count employees with this skill at the required level
      const availableCount = employeesData.filter(emp => {
        const empSkills = employeeSkillsMap.get(emp.id) || [];
        return empSkills.some(skill => 
          skill.skill_id === reqSkill.skill_id && 
          skill.proficiency_level >= (reqSkill.required_level || 1)
        );
      }).length;
      
      const gap = Math.max(0, reqSkill.required_count - availableCount);
      
      // Determine severity based on gap percentage
      let severity;
      if (gap > reqSkill.required_count * 0.5) {
        severity = "Critical";
      } else if (gap > reqSkill.required_count * 0.3) {
        severity = "High";
      } else if (gap > reqSkill.required_count * 0.1) {
        severity = "Medium";
      } else {
        severity = "Low";
      }

      return {
        skill_id: reqSkill.skill_id,
        skill_name: skillDetails.name,
        category: skillDetails.category,
        required_count: reqSkill.required_count,
        available_count: availableCount,
        gap,
        severity
      };
    });

    // Calculate resource metrics
    const totalRequired = data.required_skills.reduce((sum, skill) => sum + skill.required_count, 0);
    const totalAvailable = skillGaps.reduce((sum, gap: any) => sum + gap.available_count, 0);
    const resourceRatio = totalRequired > 0 ? totalAvailable / totalRequired : 1;

    // Get average salary from database or use default
    const avgSalary = 85000; // Default value

    // Budget calculations
    const estimatedCost = totalRequired * avgSalary * 1.2; // 20% overhead
    const budgetRatio = data.budget ? Math.min(1, data.budget / estimatedCost) : 0.75;

    // Timeline calculations
    const estimatedTimeDays = Math.ceil(totalDays * (1 / resourceRatio));
    const timeRatio = Math.min(1, totalDays / estimatedTimeDays);

    // Calculate costs
    const hiringCosts = skillGaps.reduce((sum, gap: any) => {
      return sum + (gap.gap * avgSalary * 1.5); // 50% premium for hiring
    }, 0);

    const trainingCosts = skillGaps.reduce((sum, gap: any) => {
      return sum + (gap.gap * avgSalary * 0.3); // 30% of salary for training
    }, 0);

    // Generate risk factors
    const riskFactors = [];
    if (resourceRatio < 0.7) {
      riskFactors.push("Significant resource shortage may impact project timeline");
    }
    if (budgetRatio < 0.8) {
      riskFactors.push("Budget constraints may limit resource acquisition");
    }
    if (timeRatio < 0.7) {
      riskFactors.push("Timeline may be extended due to resource constraints");
    }
    skillGaps.forEach(gap => {
      if (gap.severity === "Critical") {
        riskFactors.push(`Critical shortage of ${gap.skill_name}`);
      }
    });

    // Generate recommendations
    const recommendations = [];
    
    // Add recommendations from skill gap analysis if available
    if (skillGapAnalysisData.length > 0) {
      skillGapAnalysisData.forEach(analysis => {
        if (analysis.recommendation) {
          recommendations.push(analysis.recommendation);
        }
      });
    }
    
    // Add general recommendations based on analysis
    if (resourceRatio < 1) {
      recommendations.push("Consider upskilling existing employees to fill skill gaps");
      recommendations.push("Evaluate external contractors for temporary resource needs");
    }
    if (budgetRatio < 1) {
      recommendations.push("Review project scope to align with available budget");
      recommendations.push("Consider phased implementation to spread costs");
    }
    if (timeRatio < 1) {
      recommendations.push("Break down project into smaller milestones");
      recommendations.push("Consider parallel workstreams to optimize timeline");
    }
    skillGaps.forEach(gap => {
      if (gap.severity === "Critical" || gap.severity === "High") {
        recommendations.push(`Develop training program for ${gap.skill_name}`);
        recommendations.push(`Create hiring plan for ${gap.skill_name} specialists`);
      }
    });

    // Calculate overall feasibility score
    const feasibilityScore = Math.round(
      (resourceRatio * 0.4 + budgetRatio * 0.3 + timeRatio * 0.3) * 100
    );

    // Analyze department impact
    let departmentImpact = [];
    try {
      // Create a map to track skill requirements by department
      const departmentSkillNeeds = new Map();
      
      employeesData.forEach(emp => {
        if (!departmentSkillNeeds.has(emp.department_id)) {
          const dept = departmentsData.find((d: any) => d.id === emp.department_id);
          if (dept) {
            departmentSkillNeeds.set(emp.department_id, {
              id: dept.id,
              name: dept.name,
              description: dept.description,
              impactScore: 0,
              skillsImpacted: []
            });
          }
        }
      });
      
      // For each skill gap, identify which departments are impacted
      skillGaps.forEach(gap => {
        if (gap.gap > 0) {
          // Find employees with this skill
          const empWithSkill = employeesData.filter(emp => {
            const empSkills = employeeSkillsMap.get(emp.id) || [];
            return empSkills.some(skill => skill.skill_id === gap.skill_id);
          });
          
          // Track which departments have these employees
          const impactedDepts = new Set();
          empWithSkill.forEach(emp => {
            impactedDepts.add(emp.department_id);
          });
          
          // Update department impact scores
          impactedDepts.forEach(deptId => {
            const deptInfo = departmentSkillNeeds.get(deptId);
            if (deptInfo) {
              deptInfo.impactScore += gap.gap;
              deptInfo.skillsImpacted.push({
                skill_name: gap.skill_name,
                gap: gap.gap,
                severity: gap.severity
              });
            }
          });
        }
      });
      
      // Convert to array and sort by impact score
      departmentImpact = Array.from(departmentSkillNeeds.values())
        .filter(dept => dept.impactScore > 0)
        .sort((a, b) => b.impactScore - a.impactScore);
    } catch (err) {
      console.error("Error analyzing department impact:", err);
      // Continue without department impact analysis
    }

    // Construct the result
    const result = {
      feasibility_score: feasibilityScore,
      using_mock_data: usingMockData,
      resource_analysis: {
        resource_ratio: resourceRatio,
        available_resources: totalAvailable,
        required_resources: totalRequired
      },
      budget_analysis: {
        budget_ratio: budgetRatio,
        estimated_cost: estimatedCost,
        available_budget: data.budget || 0
      },
      time_analysis: {
        time_ratio: timeRatio,
        estimated_time_days: estimatedTimeDays
      },
      skill_gaps: skillGaps,
      recommendations: Array.from(new Set(recommendations)), // Remove duplicates
      risk_factors: Array.from(new Set(riskFactors)), // Remove duplicates
      cost_analysis: {
        hiring_costs: hiringCosts,
        training_costs: trainingCosts,
        timeline_impact_days: Math.max(0, estimatedTimeDays - totalDays)
      },
      department_impact: departmentImpact
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in project feasibility analysis:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
} 