import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { generateWithLlama3 } from "@/lib/together"
import type { Json } from "@/types/supabase"
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface WorkforceInsightsRequest {
  department_id?: string;
  insight_type?: "attrition" | "hiring" | "performance" | "skills" | "all";
  time_frame?: number; // in months
}

interface WorkforceInsight {
  id: string;
  insight_type: string;
  title: string;
  summary: string;
  severity: "critical" | "high" | "medium" | "low" | "positive";
  impact_areas: string[];
  recommendations: string[];
  data_points?: Record<string, any>;
  visualizations?: Array<{
    type: string;
    title: string;
    data: any;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    
    // Extract parameters
    const { departmentId } = body
    
    if (!departmentId) {
      return NextResponse.json(
        { error: "Department ID is required" },
        { status: 400 }
      )
    }
    
    // Get department info
    const { data: department, error: deptError } = await supabase
      .from('departments')
      .select('name')
      .eq('id', departmentId)
      .single()
      
    if (deptError) {
      console.error("Error fetching department:", deptError)
      // Continue with mock data instead of failing
    }
    
    // In a real application, we would analyze workforce data and trends
    // For the demo, we'll generate mock insights data
    
    // Create insight categories with multiple insights in each
    const categories = [
      {
        name: "Workforce Composition",
        description: "Analysis of current workforce structure and distribution",
        insights: [
          {
            title: "Team Structure Optimization",
            description: "Current senior-to-junior ratio is 1:5, which is below the industry benchmark of 1:3. Consider promoting 2 mid-level employees to senior roles.",
            priority: "medium",
            actionable: true
          },
          {
            title: "Skills Distribution",
            description: "70% of technical skills are concentrated in 30% of the workforce, creating potential single points of failure in critical projects.",
            priority: "high",
            actionable: true
          }
        ]
      },
      {
        name: "Recruitment & Retention",
        description: "Insights on hiring effectiveness and employee retention",
        insights: [
          {
            title: "Time-to-Hire Improvement",
            description: "Average time-to-hire for engineering roles has increased by 15 days compared to last year. Consider streamlining the interview process.",
            priority: "medium",
            actionable: true
          },
          {
            title: "Retention Risk",
            description: "Employees with 2-3 years tenure have a 25% higher attrition rate than the company average. Consider implementing a mid-career development program.",
            priority: "high",
            actionable: true
          },
          {
            title: "Diversity Progress",
            description: "Gender diversity in technical roles has improved by 8% year-over-year, but remains 12% below the company's target.",
            priority: "medium",
            actionable: false
          }
        ]
      },
      {
        name: "Performance & Development",
        description: "Analysis of employee performance and learning needs",
        insights: [
          {
            title: "Training Effectiveness",
            description: "Employees who completed the leadership training program showed 22% higher performance ratings than non-participants.",
            priority: "low",
            actionable: false
          },
          {
            title: "Feedback Frequency",
            description: "Teams receiving bi-weekly feedback sessions report 30% higher engagement scores than those with quarterly reviews only.",
            priority: "medium",
            actionable: true
          }
        ]
      }
    ]
    
    // Generate a summary based on the insights
    const summary = `The ${department?.name || ''} department shows strong potential for optimization with several actionable insights. Key focus areas should include addressing the high concentration of technical skills, improving retention for mid-career employees, and continuing to build on diversity progress while maintaining the effective training programs.`
    
    return NextResponse.json({
      department_id: departmentId,
      department_name: department?.name,
      analysis_date: new Date().toISOString(),
      categories,
      summary
    })
    
  } catch (error) {
    console.error("Server error in workforce insights API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get("id")
    const department_id = url.searchParams.get("department_id")
    const insight_type = url.searchParams.get("type")
    
    try {
      // Try to query the workforce_insights table
      let query = supabaseAdmin
        .from('workforce_insights')
        .select("*")
        .order("generated_at", { ascending: false })
      
      // Apply filters
      if (id) {
        query = query.eq("id", id)
      }
      
      if (department_id) {
        query = query.eq("department_id", department_id)
      }
      
      if (insight_type) {
        query = query.eq("insight_type", insight_type)
      }
      
      // Limit to 10 insights if no id specified
      if (!id) {
        query = query.limit(10)
      }
      
      const { data: insights, error } = await query
      
      if (error) {
        // If there's an error, it might be because the table doesn't exist
        if (error.message.includes("relation") && error.message.includes("does not exist")) {
          // Return empty array if table doesn't exist
          return NextResponse.json({
            success: true,
            insights: []
          })
        }
        throw error
      }
      
      return NextResponse.json({
        success: true,
        insights
      })
    } catch (queryError) {
      console.error("Error querying workforce_insights:", queryError)
      // Return empty array on error for better UX
      return NextResponse.json({
        success: true,
        insights: []
      })
    }
    
  } catch (error: any) {
    console.error("Error fetching workforce insights:", error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An error occurred while fetching workforce insights"
      },
      { status: 500 }
    )
  }
}

// Fallback function to generate insights without AI
function generateFallbackInsights(
  employeeCount: number,
  avgTenure: number,
  overallocatedCount: number,
  underallocatedCount: number,
  insightType: string
): WorkforceInsight[] {
  const insights: WorkforceInsight[] = []
  
  if (insightType === 'all' || insightType === 'attrition') {
    insights.push({
      id: crypto.randomUUID(),
      insight_type: 'attrition',
      title: 'Potential Attrition Risk',
      summary: 'Based on allocation patterns and tenure data, there might be attrition risks in the next 6 months.',
      severity: avgTenure < 12 ? 'high' : avgTenure < 24 ? 'medium' : 'low',
      impact_areas: ['Retention', 'Productivity', 'Knowledge Retention'],
      recommendations: [
        'Conduct stay interviews with employees who have been with the company 1-2 years',
        'Review compensation packages for competitiveness',
        'Implement a more robust recognition program'
      ],
      data_points: {
        avg_tenure_months: avgTenure,
        employee_count: employeeCount,
        attrition_risk_level: avgTenure < 12 ? 'High' : avgTenure < 24 ? 'Medium' : 'Low'
      }
    })
  }
  
  if (insightType === 'all' || insightType === 'hiring') {
    insights.push({
      id: crypto.randomUUID(),
      insight_type: 'hiring',
      title: 'Resource Allocation Imbalance',
      summary: `Team has ${overallocatedCount} overallocated and ${underallocatedCount} underallocated employees, indicating potential hiring needs.`,
      severity: overallocatedCount > employeeCount * 0.3 ? 'high' : 'medium',
      impact_areas: ['Workload Balance', 'Employee Wellbeing', 'Project Delivery'],
      recommendations: [
        'Consider hiring additional resources for overallocated teams',
        'Redistribute work to balance team workloads',
        'Review project prioritization to better align with available resources'
      ],
      data_points: {
        overallocated_employees: overallocatedCount,
        underallocated_employees: underallocatedCount,
        percentage_overallocated: employeeCount > 0 ? (overallocatedCount / employeeCount) * 100 : 0
      }
    })
  }
  
  if (insightType === 'all' || insightType === 'performance') {
    insights.push({
      id: crypto.randomUUID(),
      insight_type: 'performance',
      title: 'Performance Improvement Opportunity',
      summary: 'Allocation data suggests opportunities for performance improvements through better skill utilization.',
      severity: 'medium',
      impact_areas: ['Productivity', 'Employee Engagement', 'Skills Utilization'],
      recommendations: [
        'Implement cross-training programs to build versatility',
        'Review job roles and responsibilities for better alignment with skills',
        'Set clear performance expectations and provide regular feedback'
      ],
      data_points: {
        avg_productivity_estimate: 75,
        improvement_potential: 'Medium'
      }
    })
  }
  
  if (insightType === 'all' || insightType === 'skills') {
    insights.push({
      id: crypto.randomUUID(),
      insight_type: 'skills',
      title: 'Skills Development Needs',
      summary: 'Current skill distribution indicates potential gaps for future business needs.',
      severity: 'medium',
      impact_areas: ['Capability Building', 'Innovation', 'Strategic Alignment'],
      recommendations: [
        'Conduct a detailed skills gap analysis against future business strategy',
        'Develop targeted learning paths for critical skills',
        'Consider establishing mentoring programs for knowledge transfer'
      ],
      data_points: {
        top_skills_saturation: '65%',
        skills_diversity_index: 0.72
      }
    })
  }
  
  return insights
} 