/**
 * Workforce Planning API
 * 
 * This module provides comprehensive workforce planning capabilities including:
 * - Project-based demand forecasting
 * - Project feasibility analysis
 * - Workforce reallocation
 * - Attrition prediction
 * - Cost optimization
 * - Succession planning
 */

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

export async function getSupabase() {
  const cookieStore = cookies();
  return createRouteHandlerClient<Database>({ cookies: () => cookieStore });
}

// API endpoint reexports
export { POST as projectForecast } from "./forecast/project/route";
export { POST as projectFeasibility } from "./project-feasibility/enhanced/route";
export { POST as workforceReallocate } from "./reallocate/route";
export { POST as attritionPrediction } from "./attrition-prediction/route";
export { POST as costOptimization } from "./cost-optimization/route";
export { POST as successionPlanning } from "./succession-planning/route";

// Types for the API
export type TimePeriod = "monthly" | "quarterly" | "annual";
export type RiskLevel = "Low" | "Medium" | "High" | "Critical";
export type ReadinessLevel = "Ready Now" | "Ready in 6 Months" | "Ready in 1 Year" | "Development Needed";
export type ProjectComplexity = "low" | "medium" | "high";
export type ProjectPriority = "low" | "medium" | "high" | "critical";

// Common utility functions
export function calculateDaysInRange(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function convertToYearly(amount: number, period: TimePeriod): number {
  switch (period) {
    case "monthly":
      return amount * 12;
    case "quarterly":
      return amount * 4;
    case "annual":
      return amount;
    default:
      return amount;
  }
}

export function calculateSkillMatchScore(
  requiredSkills: Array<{ skill_id: string; required_level: number }>,
  employeeSkills: Array<{ skill_id: string; proficiency_level: number }>
): number {
  if (!requiredSkills.length || !employeeSkills.length) return 0;
  
  let totalScore = 0;
  let totalPossible = 0;
  
  requiredSkills.forEach((requiredSkill) => {
    const matched = employeeSkills.find(s => s.skill_id === requiredSkill.skill_id);
    
    if (matched) {
      // Calculate match percentage (employee proficiency / required level)
      const matchPercentage = Math.min(matched.proficiency_level / requiredSkill.required_level, 1) * 100;
      totalScore += matchPercentage;
    }
    
    totalPossible += 100;
  });
  
  return totalPossible > 0 ? Math.round(totalScore / totalPossible * 100) : 0;
}

// Helper for generating recommendations based on analysis
export function generateRecommendations(type: string, data: any): string[] {
  // This would ideally be implemented with a more sophisticated approach
  // For now, we return generic recommendations based on the analysis type
  switch (type) {
    case "forecast":
      return [
        `Project requires a total of ${data.required_headcount} employees based on skill requirements.`,
        `Current allocation: ${data.current_headcount} employees (Gap of ${data.headcount_gap}).`,
        `Projected shortage of ${data.end_gap} employees by the end of the forecast period.`,
        `Need to hire or reallocate at least ${Math.max(data.end_gap, 0)} employees to meet project demands.`
      ];
    case "feasibility":
      const recommendations = [
        data.resource_ratio < 0.7 ? 
          `Consider extending the project timeline by ${Math.ceil((1 - data.resource_ratio) * 30)} days to accommodate current resource constraints.` : 
          "Resource allocation is adequate for the project requirements.",
        data.budget_ratio < 0.8 ? 
          `Allocate a ${Math.ceil((1 - data.budget_ratio) * 100)}% budget buffer to account for potential scope changes.` : 
          "Budget allocation is sufficient for the estimated costs."
      ];
      
      // Add skill gap recommendations
      data.skill_gaps.forEach((gap: any) => {
        if (gap.gap > 0) {
          recommendations.push(`Hire ${gap.gap} additional ${gap.skill_name} specialists to fill the critical skill gap.`);
        }
      });
      
      return recommendations;
    default:
      return [
        "Review current resource allocation to optimize workforce efficiency.",
        "Consider cross-training employees to fill skill gaps.",
        "Implement regular workforce planning reviews to stay ahead of demand changes."
      ];
  }
} 