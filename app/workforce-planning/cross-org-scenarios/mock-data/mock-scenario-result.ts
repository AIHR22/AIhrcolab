// Mock data for cross-organization scenario planning

export const mockScenarioResult = {
  revenue_analysis: {
    current_revenue: 5000000,
    target_revenue: 10000000,
    growth_percentage: 100,
    months_to_target: 12
  },
  hiring_analysis: {
    total_current_headcount: 42,
    total_new_hires_needed: 35,
    hiring_capacity_per_month: 10,
    hiring_feasible: true,
    hiring_timeline_months: 4
  },
  departments: [
    {
      id: "dept-1",
      name: "Engineering",
      description: "Software Engineering",
      current_headcount: 15,
      revenue_contribution: 2000000,
      revenue_per_employee: 133333,
      skills: [
        { id: "skill-1", name: "JavaScript", category: "Programming", count: 12 },
        { id: "skill-2", name: "Python", category: "Programming", count: 8 },
        { id: "skill-3", name: "React", category: "Frontend", count: 10 }
      ],
      projections: [
        { month: 0, date: "2025-04-06", headcount: 15, new_hires_needed: 0, monthly_salary_cost: 150000, monthly_revenue: 166666 },
        { month: 3, date: "2025-07-06", headcount: 19, new_hires_needed: 4, monthly_salary_cost: 190000, monthly_revenue: 250000 },
        { month: 6, date: "2025-10-06", headcount: 23, new_hires_needed: 8, monthly_salary_cost: 230000, monthly_revenue: 333333 },
        { month: 9, date: "2026-01-06", headcount: 27, new_hires_needed: 12, monthly_salary_cost: 270000, monthly_revenue: 416666 },
        { month: 12, date: "2026-04-06", headcount: 30, new_hires_needed: 15, monthly_salary_cost: 300000, monthly_revenue: 500000 }
      ]
    },
    {
      id: "dept-2",
      name: "Product",
      description: "Product Management",
      current_headcount: 8,
      revenue_contribution: 1000000,
      revenue_per_employee: 125000,
      skills: [
        { id: "skill-4", name: "Product Management", category: "Management", count: 8 },
        { id: "skill-5", name: "UX Design", category: "Design", count: 3 },
        { id: "skill-6", name: "Marketing", category: "Business", count: 2 }
      ],
      projections: [
        { month: 0, date: "2025-04-06", headcount: 8, new_hires_needed: 0, monthly_salary_cost: 80000, monthly_revenue: 83333 },
        { month: 3, date: "2025-07-06", headcount: 10, new_hires_needed: 2, monthly_salary_cost: 100000, monthly_revenue: 125000 },
        { month: 6, date: "2025-10-06", headcount: 12, new_hires_needed: 4, monthly_salary_cost: 120000, monthly_revenue: 166666 },
        { month: 9, date: "2026-01-06", headcount: 14, new_hires_needed: 6, monthly_salary_cost: 140000, monthly_revenue: 208333 },
        { month: 12, date: "2026-04-06", headcount: 16, new_hires_needed: 8, monthly_salary_cost: 160000, monthly_revenue: 250000 }
      ]
    },
    {
      id: "dept-3",
      name: "Design",
      description: "UX/UI Design",
      current_headcount: 6,
      revenue_contribution: 750000,
      revenue_per_employee: 125000,
      skills: [
        { id: "skill-7", name: "UI Design", category: "Design", count: 6 },
        { id: "skill-8", name: "Graphic Design", category: "Design", count: 4 },
        { id: "skill-9", name: "Figma", category: "Tools", count: 6 }
      ],
      projections: [
        { month: 0, date: "2025-04-06", headcount: 6, new_hires_needed: 0, monthly_salary_cost: 60000, monthly_revenue: 62500 },
        { month: 3, date: "2025-07-06", headcount: 7, new_hires_needed: 1, monthly_salary_cost: 70000, monthly_revenue: 93750 },
        { month: 6, date: "2025-10-06", headcount: 9, new_hires_needed: 3, monthly_salary_cost: 90000, monthly_revenue: 125000 },
        { month: 9, date: "2026-01-06", headcount: 10, new_hires_needed: 4, monthly_salary_cost: 100000, monthly_revenue: 156250 },
        { month: 12, date: "2026-04-06", headcount: 12, new_hires_needed: 6, monthly_salary_cost: 120000, monthly_revenue: 187500 }
      ]
    },
    {
      id: "dept-4",
      name: "Sales",
      description: "Sales and Business Development",
      current_headcount: 10,
      revenue_contribution: 1250000,
      revenue_per_employee: 125000,
      skills: [
        { id: "skill-10", name: "Sales", category: "Business", count: 10 },
        { id: "skill-11", name: "Negotiation", category: "Soft Skills", count: 10 },
        { id: "skill-12", name: "CRM", category: "Tools", count: 8 }
      ],
      projections: [
        { month: 0, date: "2025-04-06", headcount: 10, new_hires_needed: 0, monthly_salary_cost: 100000, monthly_revenue: 104166 },
        { month: 3, date: "2025-07-06", headcount: 12, new_hires_needed: 2, monthly_salary_cost: 120000, monthly_revenue: 156250 },
        { month: 6, date: "2025-10-06", headcount: 15, new_hires_needed: 5, monthly_salary_cost: 150000, monthly_revenue: 208333 },
        { month: 9, date: "2026-01-06", headcount: 17, new_hires_needed: 7, monthly_salary_cost: 170000, monthly_revenue: 260416 },
        { month: 12, date: "2026-04-06", headcount: 19, new_hires_needed: 9, monthly_salary_cost: 190000, monthly_revenue: 312500 }
      ]
    }
  ],
  critical_skills: [
    { id: "skill-1", name: "JavaScript", category: "Programming", current_count: 12, needed_count: 20, gap: 8, severity: "High" },
    { id: "skill-2", name: "Python", category: "Programming", current_count: 8, needed_count: 15, gap: 7, severity: "High" },
    { id: "skill-13", name: "Data Science", category: "Analytics", current_count: 2, needed_count: 8, gap: 6, severity: "Critical" },
    { id: "skill-14", name: "DevOps", category: "Operations", current_count: 3, needed_count: 8, gap: 5, severity: "High" },
    { id: "skill-15", name: "Product Marketing", category: "Marketing", current_count: 1, needed_count: 5, gap: 4, severity: "High" }
  ],
  monthly_projections: [
    { month: 0, date: "2025-04-06", formatted_date: "Apr 2025", revenue: 5000000 },
    { month: 1, date: "2025-05-06", formatted_date: "May 2025", revenue: 5416666 },
    { month: 2, date: "2025-06-06", formatted_date: "Jun 2025", revenue: 5833333 },
    { month: 3, date: "2025-07-06", formatted_date: "Jul 2025", revenue: 6250000 },
    { month: 4, date: "2025-08-06", formatted_date: "Aug 2025", revenue: 6666666 },
    { month: 5, date: "2025-09-06", formatted_date: "Sep 2025", revenue: 7083333 },
    { month: 6, date: "2025-10-06", formatted_date: "Oct 2025", revenue: 7500000 },
    { month: 7, date: "2025-11-06", formatted_date: "Nov 2025", revenue: 7916666 },
    { month: 8, date: "2025-12-06", formatted_date: "Dec 2025", revenue: 8333333 },
    { month: 9, date: "2026-01-06", formatted_date: "Jan 2026", revenue: 8750000 },
    { month: 10, date: "2026-02-06", formatted_date: "Feb 2026", revenue: 9166666 },
    { month: 11, date: "2026-03-06", formatted_date: "Mar 2026", revenue: 9583333 },
    { month: 12, date: "2026-04-06", formatted_date: "Apr 2026", revenue: 10000000 }
  ],
  recommendations: [
    "Engineering: Plan to grow by 100% (15 new hires) to support revenue targets",
    "Sales: Plan to grow by 90% (9 new hires) to support revenue targets",
    "Product: Plan to grow by 100% (8 new hires) to support revenue targets",
    "JavaScript (Programming): Critical skill gap of 8 employees needed to meet revenue goals",
    "Python (Programming): Critical skill gap of 7 employees needed to meet revenue goals",
    "Data Science (Analytics): Critical skill gap of 6 employees needed to meet revenue goals"
  ]
};
