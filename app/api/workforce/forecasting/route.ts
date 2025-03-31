import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    // Extract parameters
    const { departmentId, months = 12 } = body;
    
    if (!departmentId) {
      return NextResponse.json(
        { error: "Department ID is required" },
        { status: 400 }
      );
    }
    
    // First, get current department headcount
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('id')
      .eq('department_id', departmentId)
      .eq('status', 'active');
      
    if (employeesError) {
      console.error("Error fetching employees:", employeesError);
      return NextResponse.json(
        { error: "Failed to fetch current headcount" },
        { status: 500 }
      );
    }
    
    const currentHeadcount = employees?.length || 0;
    
    // Get department info
    const { data: department, error: deptError } = await supabase
      .from('departments')
      .select('name, growth_rate, attrition_rate')
      .eq('id', departmentId)
      .single();
      
    if (deptError) {
      console.error("Error fetching department:", deptError);
      // Continue with mock data instead of failing
    }
    
    // In a real application, we would use ML models or complex analysis
    // For the demo, we'll use a simple growth model based on department data
    const growthRate = department?.growth_rate || 0.05; // 5% default quarterly growth
    const attritionRate = department?.attrition_rate || 0.03; // 3% default quarterly attrition
    
    // Generate monthly projections
    const projections = [];
    let currentMonth = new Date();
    let projectedHeadcount = currentHeadcount;
    
    for (let i = 0; i < months; i++) {
      currentMonth = new Date(currentMonth);
      currentMonth.setMonth(currentMonth.getMonth() + 1);
      
      // Simple growth model (quarterly adjusted)
      const monthlyGrowth = (growthRate / 4) - (attritionRate / 4); 
      projectedHeadcount = Math.round(projectedHeadcount * (1 + monthlyGrowth));
      
      projections.push({
        month: currentMonth.toISOString().substring(0, 7), // YYYY-MM format
        headcount: projectedHeadcount
      });
    }
    
    // Generate some relevant findings based on the projections
    const netChange = projections[projections.length - 1].headcount - currentHeadcount;
    const percentChange = ((netChange / currentHeadcount) * 100).toFixed(1);
    
    const keyFindings = [
      `Projected ${netChange >= 0 ? 'growth' : 'reduction'} of ${Math.abs(netChange)} employees (${percentChange}%) over the next ${months} months.`,
      `Expected to reach ${projections[projections.length - 1].headcount} employees by ${projections[projections.length - 1].month}.`,
      `Average quarterly growth rate of ${(growthRate * 100).toFixed(1)}% with ${(attritionRate * 100).toFixed(1)}% attrition.`
    ];
    
    if (netChange > 10) {
      keyFindings.push("Significant hiring will be required to meet projected growth.");
    } else if (netChange < 0) {
      keyFindings.push("Workforce reduction strategies may be needed to avoid layoffs.");
    }
    
    return NextResponse.json({
      department_id: departmentId,
      department_name: department?.name,
      current_headcount: currentHeadcount,
      projections,
      growth_rate: growthRate * 100,
      attrition_rate: attritionRate * 100,
      confidence: 85, // Mock confidence level
      key_findings: keyFindings
    });
    
  } catch (error) {
    console.error("Server error in forecasting API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

