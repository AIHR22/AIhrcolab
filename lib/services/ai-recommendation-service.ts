type RecommendationRequest = {
  projectDetails: any;
  skillGaps: {
    skillId: string;
    skillName: string;
    gap: number;
  }[];
  budgetAnalysis: any;
};

type EnhancedRecommendationResponse = {
  assessment: string;
  recommendations: string[];
  risk_factors: string[];
  cost_analysis: {
    hiring_costs: number;
    training_costs: number;
    timeline_impact_days: number;
  };
  mitigation_strategies?: string[];
  department_impact?: {
    most_affected: string[];
    impact_description: string;
  };
};

export const aiRecommendationService = {
  async getRecommendations(data: RecommendationRequest): Promise<EnhancedRecommendationResponse> {
    try {
      // First try to get recommendations from the enhanced project feasibility endpoint
      const projectData = {
        project_name: data.projectDetails.name,
        start_date: data.projectDetails.start_date,
        end_date: data.projectDetails.end_date,
        budget: data.budgetAnalysis.budget,
        required_skills: data.skillGaps.map(gap => ({
          skill_id: gap.skillId,
          skill_name: gap.skillName,
          required_level: 3, // Assuming medium proficiency level
          required_count: gap.gap
        }))
      };

      // Call the enhanced project feasibility endpoint
      const response = await fetch('/api/workforce/project-feasibility/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });

      if (!response.ok) {
        throw new Error(`Enhanced feasibility API failed: ${response.status}`);
      }

      const result = await response.json();
      
      // Return the enhanced AI recommendations
      return {
        assessment: result.assessment || "Project feasibility assessment based on resource analysis.",
        recommendations: result.recommendations || [],
        risk_factors: result.risk_factors || [],
        cost_analysis: result.cost_analysis || {
          hiring_costs: data.skillGaps.reduce((sum, gap) => sum + (gap.gap * 75000), 0), // Default estimate
          training_costs: data.skillGaps.reduce((sum, gap) => sum + (gap.gap * 5000), 0), // Default estimate
          timeline_impact_days: Math.ceil(data.skillGaps.reduce((sum, gap) => sum + gap.gap, 0) * 10) // Default estimate
        },
        mitigation_strategies: result.mitigation_strategies || [
          "Consider phased recruitment to address critical skill gaps first.",
          "Implement cross-training programs for existing employees.",
          "Explore contractor options for specialized short-term needs."
        ],
        department_impact: result.department_impact || {
          most_affected: ["Engineering", "Product", "Design"], // Default departments
          impact_description: "Multiple departments will be affected by the resource constraints."
        }
      };
    } catch (error) {
      console.error("Error fetching enhanced AI recommendations:", error);
      
      // Fallback to simpler recommendations if enhanced endpoint fails
      return {
        assessment: "Feasibility assessment could not be generated due to a service error.",
        recommendations: [
          "Review resource allocation for this project.",
          "Consider prioritizing critical skill gaps.",
          "Evaluate timeline feasibility based on available resources."
        ],
        risk_factors: [
          "Potential timeline delays due to resource constraints.",
          "Quality risks from skill shortages.",
          "Budget overruns from unexpected hiring needs."
        ],
        cost_analysis: {
          hiring_costs: data.skillGaps.reduce((sum, gap) => sum + (gap.gap * 75000), 0),
          training_costs: data.skillGaps.reduce((sum, gap) => sum + (gap.gap * 5000), 0),
          timeline_impact_days: Math.ceil(data.skillGaps.reduce((sum, gap) => sum + gap.gap, 0) * 10)
        },
        mitigation_strategies: [
          "Consider phased implementation to manage resource constraints.",
          "Implement cross-training for existing staff.",
          "Explore contractor options for specialized skills."
        ],
        department_impact: {
          most_affected: ["Engineering", "Product"],
          impact_description: "Engineering and product teams will be most affected by resource constraints."
        }
      };
    }
  }
};
