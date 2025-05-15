import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST() {
  try {
    // Check if the shared admin client is available
    if (!supabaseAdmin) {
      console.error("Database setup error: Supabase admin client is not available.");
      return NextResponse.json({ error: "Server configuration error: Supabase client not initialized" }, { status: 500 });
    }
    
    // First, get existing department IDs
    const { data: departments, error: departmentsError } = await supabaseAdmin
      .from("departments")
      .select("id, name")
      .limit(10);
      
    if (departmentsError) {
      console.error("Error fetching departments:", departmentsError);
      return NextResponse.json({ error: "Failed to fetch existing departments" }, { status: 500 });
    }
    
    if (!departments || departments.length === 0) {
      return NextResponse.json({ error: "No departments found. Please create departments first." }, { status: 400 });
    }
    
    // Find Engineering, Product, and Design departments if they exist
    let engineeringDeptId = null;
    let productDeptId = null;
    let designDeptId = null;
    
    for (const dept of departments) {
      if (dept.name.toLowerCase().includes('engineering')) {
        engineeringDeptId = dept.id;
      } else if (dept.name.toLowerCase().includes('product')) {
        productDeptId = dept.id;
      } else if (dept.name.toLowerCase().includes('design')) {
        designDeptId = dept.id;
      }
    }
    
    // If we didn't find specific departments, use the first one
    const defaultDeptId = departments[0].id;
    engineeringDeptId = engineeringDeptId || defaultDeptId;
    productDeptId = productDeptId || defaultDeptId;
    designDeptId = designDeptId || defaultDeptId;
    
    // 1. Insert skills if they don't exist
    const skills = [
      { name: 'React', category: 'Frontend' },
      { name: 'Node.js', category: 'Backend' },
      { name: 'UI/UX Design', category: 'Design' },
      { name: 'Project Management', category: 'Management' },
      { name: 'DevOps', category: 'Infrastructure' },
      { name: 'TypeScript', category: 'Frontend' },
      { name: 'Python', category: 'Backend' },
      { name: 'Data Analysis', category: 'Data Science' },
      { name: 'GraphQL', category: 'API' },
      { name: 'SQL', category: 'Database' }
    ];
    
    const skillIds = [];
    
    for (const skill of skills) {
      // Check if skill exists
      const { data: existingSkill } = await supabaseAdmin
        .from('skills')
        .select('id')
        .eq('name', skill.name)
        .single();
        
      if (existingSkill) {
        skillIds.push(existingSkill.id);
      } else {
        // Insert new skill
        const { data: newSkill, error: skillError } = await supabaseAdmin
          .from('skills')
          .insert({
            name: skill.name,
            category: skill.category
          })
          .select('id')
          .single();
          
        if (skillError) {
          console.error(`Error inserting skill ${skill.name}:`, skillError);
        } else if (newSkill) {
          skillIds.push(newSkill.id);
        }
      }
    }
    
    // 2. Insert positions if they don't exist
    const positions = [
      { title: 'Senior Software Engineer', department_id: engineeringDeptId, level: 4, avg_salary: 120000 },
      { title: 'Product Manager', department_id: productDeptId, level: 3, avg_salary: 110000 },
      { title: 'UI/UX Designer', department_id: designDeptId, level: 3, avg_salary: 95000 },
      { title: 'DevOps Engineer', department_id: engineeringDeptId, level: 3, avg_salary: 115000 },
      { title: 'Junior Software Developer', department_id: engineeringDeptId, level: 1, avg_salary: 75000 }
    ];
    
    const positionIds = [];
    
    for (const position of positions) {
      // Check if position exists
      const { data: existingPosition } = await supabaseAdmin
        .from('positions')
        .select('id')
        .eq('title', position.title)
        .single();
        
      if (existingPosition) {
        positionIds.push(existingPosition.id);
      } else {
        // Insert new position
        const { data: newPosition, error: positionError } = await supabaseAdmin
          .from('positions')
          .insert({
            title: position.title,
            department_id: position.department_id,
            level: position.level,
            avg_salary: position.avg_salary
          })
          .select('id')
          .single();
          
        if (positionError) {
          console.error(`Error inserting position ${position.title}:`, positionError);
        } else if (newPosition) {
          positionIds.push(newPosition.id);
        }
      }
    }
    
    // 3. Insert employees if they don't exist
    const employees = [
      { email: 'john.doe@example.com', name: 'John Doe', position_id: positionIds[0] || null, department_id: engineeringDeptId },
      { email: 'jane.smith@example.com', name: 'Jane Smith', position_id: positionIds[1] || null, department_id: productDeptId },
      { email: 'mike.j@example.com', name: 'Mike Johnson', position_id: positionIds[2] || null, department_id: designDeptId },
      { email: 'lisa.k@example.com', name: 'Lisa Kim', position_id: positionIds[0] || null, department_id: engineeringDeptId },
      { email: 'david.m@example.com', name: 'David Miller', position_id: positionIds[3] || null, department_id: engineeringDeptId }
    ];
    
    const employeeIds = [];
    
    for (const employee of employees) {
      // Check if employee exists
      const { data: existingEmployee } = await supabaseAdmin
        .from('employees')
        .select('id')
        .eq('email', employee.email)
        .single();
        
      if (existingEmployee) {
        employeeIds.push(existingEmployee.id);
      } else {
        // Insert new employee
        const { data: newEmployee, error: employeeError } = await supabaseAdmin
          .from('employees')
          .insert({
            email: employee.email,
            name: employee.name,
            position_id: employee.position_id,
            department_id: employee.department_id
          })
          .select('id')
          .single();
          
        if (employeeError) {
          console.error(`Error inserting employee ${employee.name}:`, employeeError);
        } else if (newEmployee) {
          employeeIds.push(newEmployee.id);
        }
      }
    }
    
    // 4. Insert projects if they don't exist
    const projects = [
      { name: 'Website Redesign', department_id: designDeptId, start_date: '2023-01-01', end_date: '2023-12-31', status: 'in_progress' },
      { name: 'Mobile App Development', department_id: engineeringDeptId, start_date: '2023-03-15', end_date: '2023-11-30', status: 'in_progress' },
      { name: 'Data Analytics Platform', department_id: productDeptId, start_date: '2023-06-01', end_date: '2024-02-28', status: 'planned' }
    ];
    
    const projectIds = [];
    
    for (const project of projects) {
      // Check if project exists
      const { data: existingProject } = await supabaseAdmin
        .from('projects')
        .select('id')
        .eq('name', project.name)
        .single();
        
      if (existingProject) {
        projectIds.push(existingProject.id);
      } else {
        // Insert new project
        const { data: newProject, error: projectError } = await supabaseAdmin
          .from('projects')
          .insert({
            name: project.name,
            department_id: project.department_id,
            start_date: project.start_date,
            end_date: project.end_date,
            status: project.status
          })
          .select('id')
          .single();
          
        if (projectError) {
          console.error(`Error inserting project ${project.name}:`, projectError);
        } else if (newProject) {
          projectIds.push(newProject.id);
        }
      }
    }
    
    // 5. Insert employee_skills if they don't exist
    const employeeSkills = [
      { employee_id: employeeIds[0], skill_id: skillIds[0], proficiency_level: 5 }, // John - React
      { employee_id: employeeIds[0], skill_id: skillIds[5], proficiency_level: 4 }, // John - TypeScript
      { employee_id: employeeIds[1], skill_id: skillIds[3], proficiency_level: 5 }, // Jane - Project Management
      { employee_id: employeeIds[2], skill_id: skillIds[2], proficiency_level: 5 }, // Mike - UI/UX Design
      { employee_id: employeeIds[3], skill_id: skillIds[1], proficiency_level: 4 }, // Lisa - Node.js
      { employee_id: employeeIds[4], skill_id: skillIds[4], proficiency_level: 5 }  // David - DevOps
    ];
    
    for (const skill of employeeSkills) {
      if (!skill.employee_id || !skill.skill_id) continue;
      
      // Check if employee_skill exists
      const { data: existingSkill } = await supabaseAdmin
        .from('employee_skills')
        .select('id')
        .eq('employee_id', skill.employee_id)
        .eq('skill_id', skill.skill_id)
        .single();
        
      if (!existingSkill) {
        // Insert new employee_skill
        const { error: skillError } = await supabaseAdmin
          .from('employee_skills')
          .insert({
            employee_id: skill.employee_id,
            skill_id: skill.skill_id,
            proficiency_level: skill.proficiency_level
          });
          
        if (skillError) {
          console.error(`Error inserting employee skill:`, skillError);
        }
      }
    }
    
    // 6. Insert project_skills if they don't exist
    const projectSkills = [
      { project_id: projectIds[0], skill_id: skillIds[2], required_level: 4, required_count: 2 }, // Website Redesign - UI/UX Design
      { project_id: projectIds[1], skill_id: skillIds[0], required_level: 4, required_count: 3 }, // Mobile App - React
      { project_id: projectIds[1], skill_id: skillIds[5], required_level: 4, required_count: 3 }, // Mobile App - TypeScript
      { project_id: projectIds[2], skill_id: skillIds[7], required_level: 3, required_count: 2 }, // Data Analytics - Data Analysis
      { project_id: projectIds[2], skill_id: skillIds[9], required_level: 4, required_count: 1 }  // Data Analytics - SQL
    ];
    
    for (const skill of projectSkills) {
      if (!skill.project_id || !skill.skill_id) continue;
      
      // Check if project_skill exists
      const { data: existingSkill } = await supabaseAdmin
        .from('project_skills')
        .select('id')
        .eq('project_id', skill.project_id)
        .eq('skill_id', skill.skill_id)
        .single();
        
      if (!existingSkill) {
        // Insert new project_skill
        const { error: skillError } = await supabaseAdmin
          .from('project_skills')
          .insert({
            project_id: skill.project_id,
            skill_id: skill.skill_id,
            required_level: skill.required_level,
            required_count: skill.required_count
          });
          
        if (skillError) {
          console.error(`Error inserting project skill:`, skillError);
        }
      }
    }
    
    // 7. Insert project_allocations if they don't exist
    const now = new Date();
    const allocations = [
      { project_id: projectIds[0], employee_id: employeeIds[2], allocation_percentage: 75, role: 'Lead Designer', start_date: '2023-01-01', end_date: '2023-12-31' },
      { project_id: projectIds[1], employee_id: employeeIds[0], allocation_percentage: 50, role: 'Tech Lead', start_date: '2023-03-15', end_date: '2023-11-30' },
      { project_id: projectIds[1], employee_id: employeeIds[3], allocation_percentage: 100, role: 'Backend Developer', start_date: '2023-03-15', end_date: '2023-11-30' },
      { project_id: projectIds[2], employee_id: employeeIds[1], allocation_percentage: 25, role: 'Product Owner', start_date: '2023-06-01', end_date: '2024-02-28' },
      { project_id: projectIds[2], employee_id: employeeIds[4], allocation_percentage: 50, role: 'Infrastructure Lead', start_date: '2023-06-01', end_date: '2024-02-28' }
    ];
    
    for (const allocation of allocations) {
      if (!allocation.project_id || !allocation.employee_id) continue;
      
      // Check if allocation exists
      const { data: existingAllocation } = await supabaseAdmin
        .from('project_allocations')
        .select('id')
        .eq('project_id', allocation.project_id)
        .eq('employee_id', allocation.employee_id)
        .single();
        
      if (!existingAllocation) {
        // Insert new allocation
        const { error: allocationError } = await supabaseAdmin
          .from('project_allocations')
          .insert({
            project_id: allocation.project_id,
            employee_id: allocation.employee_id,
            allocation_percentage: allocation.allocation_percentage,
            role: allocation.role,
            start_date: allocation.start_date,
            end_date: allocation.end_date
          });
          
        if (allocationError) {
          console.error(`Error inserting project allocation:`, allocationError);
        }
      }
    }
    
    // 8. Insert employee_performance records if they don't exist
    const performances = [
      { employee_id: employeeIds[0], review_date: '2023-06-30', score: 85, strengths: ['Technical skills', 'Problem solving'], areas_for_improvement: ['Documentation', 'Knowledge sharing'] },
      { employee_id: employeeIds[1], review_date: '2023-06-30', score: 90, strengths: ['Leadership', 'Communication'], areas_for_improvement: ['Technical knowledge'] },
      { employee_id: employeeIds[2], review_date: '2023-06-30', score: 88, strengths: ['Creativity', 'Design thinking'], areas_for_improvement: ['Meeting deadlines'] },
      { employee_id: employeeIds[3], review_date: '2023-06-30', score: 82, strengths: ['Code quality', 'Testing'], areas_for_improvement: ['Verbal communication'] },
      { employee_id: employeeIds[4], review_date: '2023-06-30', score: 87, strengths: ['System architecture', 'Reliability'], areas_for_improvement: ['Documentation', 'Work-life balance'] }
    ];
    
    for (const performance of performances) {
      if (!performance.employee_id) continue;
      
      // Check if performance record exists
      const { data: existingPerformance } = await supabaseAdmin
        .from('employee_performance')
        .select('id')
        .eq('employee_id', performance.employee_id)
        .eq('review_date', performance.review_date)
        .single();
        
      if (!existingPerformance) {
        // Insert new performance record
        const { error: performanceError } = await supabaseAdmin
          .from('employee_performance')
          .insert({
            employee_id: performance.employee_id,
            review_date: performance.review_date,
            score: performance.score,
            strengths: performance.strengths,
            areas_for_improvement: performance.areas_for_improvement
          });
          
        if (performanceError) {
          console.error(`Error inserting employee performance:`, performanceError);
        }
      }
    }
    
    // 9. Insert project_feasibility records if they don't exist
    const feasibilities = [
      {
        project_name: 'Website Redesign',
        analysis_date: new Date().toISOString(),
        start_date: '2023-01-01',
        end_date: '2023-12-31',
        feasibility_score: 85,
        resource_gap: { headcount_gap: 1, budget_gap: 50000 },
        skill_gap: { design: 0, development: 1 },
        recommendation: 'Project is feasible with minor resource adjustments',
        ai_recommendations: {
          actions: [
            'Hire one additional UI developer',
            'Consider extending timeline by 1 month',
            'Allocate 10% more budget for external resources'
          ],
          risks: [
            'Timeline risk: Medium',
            'Resource availability risk: Medium',
            'Budget risk: Low'
          ]
        }
      },
      {
        project_name: 'Mobile App Development',
        analysis_date: new Date().toISOString(),
        start_date: '2023-03-15',
        end_date: '2023-11-30',
        feasibility_score: 70,
        resource_gap: { headcount_gap: 2, budget_gap: 120000 },
        skill_gap: { react_native: 2, backend: 0 },
        recommendation: 'Project needs significant resource adjustment',
        ai_recommendations: {
          actions: [
            'Hire two React Native developers',
            'Extend timeline by 2 months',
            'Consider phased delivery approach'
          ],
          risks: [
            'Timeline risk: High',
            'Resource availability risk: High',
            'Budget risk: Medium'
          ]
        }
      }
    ];
    
    for (const feasibility of feasibilities) {
      // Check if feasibility record exists
      const { data: existingFeasibility } = await supabaseAdmin
        .from('project_feasibility')
        .select('id')
        .eq('project_name', feasibility.project_name)
        .single();
        
      if (!existingFeasibility) {
        // Insert new feasibility record
        const { error: feasibilityError } = await supabaseAdmin
          .from('project_feasibility')
          .insert({
            project_name: feasibility.project_name,
            analysis_date: feasibility.analysis_date,
            start_date: feasibility.start_date,
            end_date: feasibility.end_date,
            feasibility_score: feasibility.feasibility_score,
            resource_gap: feasibility.resource_gap,
            skill_gap: feasibility.skill_gap,
            recommendation: feasibility.recommendation,
            ai_recommendations: feasibility.ai_recommendations
          });
          
        if (feasibilityError) {
          console.error(`Error inserting project feasibility:`, feasibilityError);
        }
      }
    }
    
    // 10. Insert workforce_forecasts records if they don't exist
    const forecastTypes = ['headcount', 'skill_gap', 'cost'];
    const forecastMonths = [1, 3, 6, 12];
    
    for (const deptId of [engineeringDeptId, productDeptId, designDeptId]) {
      for (const type of forecastTypes) {
        for (const month of forecastMonths) {
          // Generate a realistic headcount prediction based on growth
          const baseHeadcount = type === 'headcount' ? 25 : (type === 'skill_gap' ? 5 : 0);
          const growthRate = 0.05; // 5% annual growth
          const attritionRate = 0.03; // 3% annual attrition
          const netMonthlyRate = (growthRate - attritionRate) / 12;
          const headcountPrediction = Math.round(baseHeadcount * (1 + netMonthlyRate * month));
          
          // Check if forecast record exists
          const { data: existingForecast } = await supabaseAdmin
            .from('workforce_forecasts')
            .select('id')
            .eq('department_id', deptId)
            .eq('forecast_type', type)
            .eq('factors->time_horizon', month)
            .single();
            
          if (!existingForecast) {
            // Insert new forecast record
            const { error: forecastError } = await supabaseAdmin
              .from('workforce_forecasts')
              .insert({
                department_id: deptId,
                forecast_date: new Date().toISOString(),
                forecast_type: type,
                headcount_prediction: headcountPrediction,
                confidence_score: Math.floor(85 - month * 5), // Confidence decreases with time
                factors: {
                  time_horizon: month,
                  growth_rate: growthRate,
                  attrition_rate: attritionRate,
                  market_factors: {
                    industry_growth: 'steady',
                    competition: 'medium'
                  }
                }
              });
              
            if (forecastError) {
              console.error(`Error inserting workforce forecast:`, forecastError);
            }
          }
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: "Workforce planning data populated successfully",
      details: {
        skills: skillIds.length,
        positions: positionIds.length,
        employees: employeeIds.length,
        projects: projectIds.length
      }
    })
  } catch (error) {
    console.error("Error populating workforce data:", error);
    return NextResponse.json({ error: "Failed to populate workforce planning data" }, { status: 500 });
  }
} 