# Workforce Planning API Documentation

This document provides information about the workforce planning module API endpoints.

## Table of Contents

1. [Project-Based Workforce Demand Forecasting](#project-based-workforce-demand-forecasting)
2. [Enhanced Project Feasibility Analysis](#enhanced-project-feasibility-analysis)
3. [Workforce Reallocation](#workforce-reallocation)
4. [Attrition Prediction](#attrition-prediction)
5. [Workforce Cost Optimization](#workforce-cost-optimization) 
6. [Succession Planning](#succession-planning)

## Project-Based Workforce Demand Forecasting

Forecasts workforce needs for specific projects based on skill requirements and historical data.

### Endpoint

```
POST /api/workforce/forecast/project
```

### Request

```json
{
  "project_id": "uuid-of-project",
  "start_date": "2024-01-01",
  "end_date": "2024-12-31",
  "months": 12
}
```

You can also forecast by department:

```json
{
  "department_id": "uuid-of-department",
  "months": 12
}
```

### Response

```json
{
  "project_id": "uuid-of-project",
  "project_name": "AI Implementation",
  "current_headcount": 15,
  "required_headcount": 25,
  "headcount_gap": 10,
  "attrition_rate": 15,
  "growth_rate": 5,
  "projections": [
    {
      "month": "2024-04",
      "projected_headcount": 16,
      "demand_headcount": 25,
      "gap": 9
    },
    // Additional months...
  ],
  "key_findings": [
    "Project requires a total of 25 employees based on skill requirements.",
    "Current allocation: 15 employees (Gap of 10).",
    "Projected shortage of 5 employees by the end of the forecast period.",
    "Need to hire or reallocate at least 5 employees to meet project demands."
  ],
  "confidence": 80,
  "factors": {
    "historical_trend": 0.05,
    "attrition_risk": 0.15,
    "market_conditions": 0.02,
    "project_complexity": "medium"
  }
}
```

## Enhanced Project Feasibility Analysis

Analyzes project feasibility based on resources, budget, and timeline constraints.

### Endpoint

```
POST /api/workforce/project-feasibility/enhanced
```

### Request

```json
{
  "project_name": "Cloud Migration",
  "start_date": "2024-04-01",
  "end_date": "2024-10-31",
  "budget": 500000,
  "required_skills": [
    {
      "skill_id": "uuid-of-skill",
      "required_level": 3,
      "required_count": 5
    },
    {
      "skill_id": "uuid-of-another-skill",
      "required_level": 4,
      "required_count": 2
    }
  ],
  "description": "Migrate our on-premise systems to cloud infrastructure",
  "priority": "high",
  "complexity": "medium"
}
```

### Response

```json
{
  "id": "generated-uuid",
  "feasibility_score": 75,
  "resource_analysis": {
    "available_resources": 4,
    "required_resources": 7,
    "resource_ratio": 0.57,
    "resource_score": 57
  },
  "budget_analysis": {
    "available_budget": 500000,
    "estimated_cost": 420000,
    "budget_ratio": 0.84,
    "budget_score": 84
  },
  "time_analysis": {
    "available_time_days": 214,
    "estimated_time_days": 175,
    "time_ratio": 0.82,
    "time_score": 82
  },
  "skill_gaps": [
    {
      "skill_id": "uuid-of-skill",
      "skill_name": "Cloud Architecture",
      "required_count": 5,
      "available_count": 3,
      "gap": 2,
      "severity": "Medium"
    },
    {
      "skill_id": "uuid-of-another-skill",
      "skill_name": "DevOps",
      "required_count": 2,
      "available_count": 1,
      "gap": 1,
      "severity": "Low"
    }
  ],
  "recommendations": [
    "Consider extending the project timeline by 2-3 weeks to accommodate current resource constraints.",
    "Hire 2 additional Cloud Architects to fill the critical skill gap.",
    "Allocate a 10% budget buffer to account for potential scope changes.",
    "Implement a phased migration approach to better manage resource allocation."
  ],
  "risk_factors": [
    "Insufficient cloud architecture expertise available in-house.",
    "Tight timeline creates risk of missed milestones.",
    "Potential for scope creep due to complexity of migration."
  ],
  "cost_analysis": {
    "hiring_costs": 32000,
    "training_costs": 15000,
    "timeline_impact_days": 0
  },
  "created_at": "2024-03-31T12:00:00Z"
}
```

## Workforce Reallocation

Identifies underutilized employees and recommends reallocation to projects needing resources.

### Endpoint

```
POST /api/workforce/reallocate
```

### Request

```json
{
  "project_id": "uuid-of-project",
  "target_utilization": 90,
  "skill_ids": ["uuid-of-skill-1", "uuid-of-skill-2"],
  "required_count": 3,
  "implementation": false
}
```

You can also search across departments:

```json
{
  "department_id": "uuid-of-department",
  "target_utilization": 85
}
```

### Response

```json
{
  "success": true,
  "target_project": {
    "id": "uuid-of-project",
    "name": "Mobile Application Development",
    "required_skills": [
      {
        "skill_id": "uuid-of-skill-1",
        "skill_name": "React Native",
        "required_level": 3,
        "required_count": 2
      },
      {
        "skill_id": "uuid-of-skill-2",
        "skill_name": "TypeScript",
        "required_level": 3,
        "required_count": 3
      }
    ]
  },
  "summary": {
    "total_underutilized": 12,
    "total_matching": 8,
    "total_high_matches": 5,
    "total_recommended": 5,
    "total_implemented": 0,
    "average_skill_match": 87,
    "additional_capacity": 210
  },
  "recommendations": [
    {
      "employee_id": "uuid-of-employee",
      "employee_name": "Jane Smith",
      "department_id": "uuid-of-department",
      "department_name": "Engineering",
      "current_allocation": 60,
      "recommended_allocation": 30,
      "total_after_allocation": 90,
      "skill_match_score": 95,
      "matched_skills": [
        {
          "skill_id": "uuid-of-skill-1",
          "skill_name": "React Native",
          "proficiency_level": 4
        },
        {
          "skill_id": "uuid-of-skill-2",
          "skill_name": "TypeScript",
          "proficiency_level": 3
        }
      ]
    }
    // Additional recommendations...
  ],
  "implemented": null
}
```

If `implementation: true` is set, the `implemented` field will contain details of the allocations created.

## Attrition Prediction

Predicts employees at risk of leaving using a multi-factor analysis model.

### Endpoint

```
POST /api/workforce/attrition-prediction
```

### Request

```json
{
  "project_id": "uuid-of-project",
  "threshold": 70,
  "include_factors": true
}
```

Or by department:

```json
{
  "department_id": "uuid-of-department",
  "threshold": 65,
  "include_factors": false
}
```

### Response

```json
{
  "context": {
    "source_type": "project",
    "source_id": "uuid-of-project",
    "source_name": "Platform Redesign",
    "total_employees": 18,
    "high_risk_count": 3,
    "high_risk_percentage": 17
  },
  "risk_threshold": 70,
  "attrition_risk": [
    {
      "employee_id": "uuid-of-employee",
      "employee_name": "John Doe",
      "position": "Senior Developer",
      "department": "Engineering",
      "project_role": "Lead Developer",
      "allocation_percentage": 100,
      "risk_score": 82,
      "risk_level": "Critical",
      "factors": {
        "workload": {
          "score": 95,
          "weight": 0.35,
          "contribution": 33
        },
        "job_satisfaction": {
          "score": 70,
          "weight": 0.25,
          "contribution": 18
        },
        "pay_disparity": {
          "score": 85,
          "weight": 0.25,
          "contribution": 21
        },
        "tenure": {
          "score": 65,
          "weight": 0.15,
          "contribution": 10,
          "months": 14
        }
      }
    }
    // Additional employees...
  ],
  "recommendations": [
    "Conduct stay interviews with the 3 high-risk employees within the next 2 weeks.",
    "Review workload distribution across the Platform Redesign project team.",
    "Consider a 10-15% compensation adjustment for critical team members.",
    "Implement a recognition program specifically for the engineering department.",
    "Create growth opportunities through mentorship and career development planning."
  ],
  "created_at": "2024-03-31T12:00:00Z"
}
```

## Workforce Cost Optimization

Analyzes in-house vs. outsourcing costs and provides optimization recommendations.

### Endpoint

```
POST /api/workforce/cost-optimization
```

### Request

```json
{
  "project_id": "uuid-of-project",
  "time_frame": "annual",
  "include_outsourcing": true,
  "market_rates": {
    "Developer": 85,
    "Designer": 75,
    "Project Manager": 100
  }
}
```

Or by department:

```json
{
  "department_id": "uuid-of-department",
  "time_frame": "quarterly",
  "include_outsourcing": true
}
```

### Response

```json
{
  "context": {
    "source_type": "project",
    "source_id": "uuid-of-project",
    "source_name": "Data Analytics Platform",
    "time_frame": "annual",
    "employee_count": 12,
    "total_allocations": 8.5
  },
  "in_house_costs": {
    "total": 1250000,
    "breakdown": {
      "salaries": 850000,
      "benefits": 212500,
      "overhead": 187500
    },
    "per_employee": [
      {
        "employee_id": "uuid-of-employee",
        "name": "Alice Johnson",
        "position": "Senior Data Scientist",
        "allocation_percentage": 80,
        "total_cost": 156000
      }
      // Additional employees...
    ]
  },
  "outsourcing_costs": {
    "total": 1420000,
    "per_role": [
      {
        "role": "Data Scientist",
        "fte": 3.2,
        "total_cost": 614400
      },
      {
        "role": "Developer",
        "fte": 4.5,
        "total_cost": 734400
      }
      // Additional roles...
    ]
  },
  "recommendation": {
    "approach": "in-house",
    "cost_savings": 170000,
    "savings_percentage": 12,
    "recommendations": [
      "Maintain the current in-house team structure for optimal cost efficiency.",
      "Consider reviewing the allocation of the UX design resources, as they have potential for outsourcing.",
      "Implement cross-training for developers to reduce future hiring needs.",
      "Improve resource utilization by optimizing project scheduling.",
      "Consolidate project management roles to increase cost efficiency."
    ]
  },
  "created_at": "2024-03-31T12:00:00Z"
}
```

## Succession Planning

Identifies potential candidates for leadership roles within projects.

### Endpoint

```
POST /api/workforce/succession-planning
```

### Request

```json
{
  "project_id": "uuid-of-project",
  "performance_threshold": 85,
  "include_development_plans": true
}
```

Or by department or position:

```json
{
  "department_id": "uuid-of-department",
  "performance_threshold": 80,
  "include_development_plans": true
}
```

```json
{
  "position_id": "uuid-of-position",
  "performance_threshold": 85,
  "include_development_plans": true
}
```

### Response

```json
{
  "context": {
    "source_type": "project",
    "source_id": "uuid-of-project",
    "source_name": "Digital Transformation",
    "employee_count": 24,
    "leadership_positions": 3
  },
  "leadership_positions": [
    {
      "position_id": "uuid-of-position",
      "position_title": "Project Manager",
      "employee_id": "uuid-of-employee",
      "employee_name": "Michael Chen",
      "department": "Product",
      "level": "manager"
    },
    {
      "position_id": "uuid-of-position-2",
      "position_title": "Technical Lead",
      "employee_id": "uuid-of-employee-2",
      "employee_name": "Sarah Johnson",
      "department": "Engineering",
      "level": "lead"
    }
    // Additional positions...
  ],
  "succession_plans": [
    {
      "position_id": "uuid-of-position",
      "position_title": "Project Manager",
      "current_leader": {
        "employee_id": "uuid-of-employee",
        "employee_name": "Michael Chen",
        "department": "Product"
      },
      "candidates": [
        {
          "employee_id": "uuid-of-candidate",
          "employee_name": "Jessica Liu",
          "position_id": "uuid-of-position-3",
          "position_title": "Senior Product Manager",
          "department_id": "uuid-of-department",
          "department_name": "Product",
          "level": "senior",
          "performance_score": 92,
          "tenure_months": 36,
          "tenure_score": 100,
          "skill_match_score": 85,
          "department_match_score": 100,
          "total_score": 93,
          "readiness_level": "Ready Now",
          "key_skills": [
            {
              "skill_id": "uuid-of-skill",
              "skill_name": "Agile Project Management",
              "proficiency": 4
            }
            // Additional skills...
          ],
          "development_plan": [
            "Shadow Michael Chen on the Digital Transformation project for 2 days per week over the next month",
            "Complete the Advanced Project Management certification",
            "Take lead on the next quarterly planning session",
            "Participate in executive leadership training program",
            "Gain experience with budget management by assisting with the next fiscal year planning"
          ]
        }
        // Additional candidates...
      ]
    }
    // Additional succession plans...
  ],
  "created_at": "2024-03-31T12:00:00Z"
}
``` 