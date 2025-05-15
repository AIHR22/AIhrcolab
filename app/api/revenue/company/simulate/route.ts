import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface DepartmentSimulation {
  department: string;
  currentHeadcount: number;
  adjustedHeadcount: number;
  revenuePerEmployee: number;
  totalRevenue: number;
  projectedImpact: number;
  averageSalary: number;
  totalSalaryImpact: number;
}

interface SimulationRequest {
  departments: {
    department: string;
    currentHeadcount: number;
    adjustedHeadcount: number;
  }[];
}

export async function POST(req: Request) {
  try {
    const body: SimulationRequest = await req.json();

    // Get current department metrics with employee data
    const { data: departments, error: deptError } = await supabaseAdmin
      .from('departments')
      .select(`
        id,
        name,
        headcount,
        employees (
          salary
        ),
        department_revenue (
          amount,
          date,
          growth_rate
        )
      `);

    if (deptError) throw deptError;

    // Process department data
    const metricsMap = departments.reduce((acc: Record<string, any>, dept) => {
      // Calculate average salary
      const salaries = dept.employees.map(e => Number(e.salary)).filter(s => !isNaN(s));
      const avgSalary = salaries.length > 0 
        ? salaries.reduce((sum, s) => sum + s, 0) / salaries.length 
        : 0;

      // Calculate revenue per employee
      const latestRevenue = dept.department_revenue
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      const monthlyRevenue = latestRevenue?.amount || 0;
      const revenuePerEmployee = dept.headcount > 0 
        ? monthlyRevenue / dept.headcount 
        : 0;

      // Get growth rate from latest revenue entry
      const growthRate = latestRevenue?.growth_rate || 0;

      acc[dept.name] = {
        id: dept.id,
        revenuePerEmployee,
        totalRevenue: monthlyRevenue,
        averageSalary: avgSalary,
        growthRate
      };

      return acc;
    }, {});

    // Calculate impact for each department
    const simulationResults: DepartmentSimulation[] = body.departments.map(dept => {
      const metrics = metricsMap[dept.department] || {
        revenuePerEmployee: 0,
        totalRevenue: 0,
        averageSalary: 0,
        growthRate: 0
      };

      const headcountDiff = dept.adjustedHeadcount - dept.currentHeadcount;
      
      // Calculate revenue impact with growth rate
      const baseImpact = headcountDiff * metrics.revenuePerEmployee;
      const projectedImpact = baseImpact * (1 + metrics.growthRate);

      // Calculate salary impact
      const totalSalaryImpact = headcountDiff * metrics.averageSalary;

      return {
        department: dept.department,
        currentHeadcount: dept.currentHeadcount,
        adjustedHeadcount: dept.adjustedHeadcount,
        revenuePerEmployee: metrics.revenuePerEmployee,
        totalRevenue: metrics.totalRevenue,
        projectedImpact,
        averageSalary: metrics.averageSalary,
        totalSalaryImpact
      };
    });

    // Calculate total impacts
    const totalImpact = simulationResults.reduce(
      (sum, dept) => sum + dept.projectedImpact,
      0
    );

    const totalSalaryImpact = simulationResults.reduce(
      (sum, dept) => sum + dept.totalSalaryImpact,
      0
    );

    // Calculate net impact (revenue - salary costs)
    const netImpact = totalImpact - totalSalaryImpact;

    return NextResponse.json({
      departments: simulationResults,
      totalImpact,
      totalSalaryImpact,
      netImpact
    });
  } catch (error: any) {
    console.error('Error in revenue simulation:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
