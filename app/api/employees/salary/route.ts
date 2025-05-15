import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Constants for salary validation
const MIN_SALARY = 30000; // $30k minimum
const MAX_SALARY = 500000; // $500k maximum

export async function GET() {
  try {
    // Get all employees with their salaries
    const { data: employees, error } = await supabaseAdmin
      .from('employees')
      .select('id, salary');

    if (error) {
      console.error('Failed to fetch employees:', error);
      return NextResponse.json(
        { error: 'Failed to fetch employees' },
        { status: 500 }
      );
    }

    // Calculate salary metrics with outlier handling
    const employeeCount = employees?.length || 0;
    const validSalaries = employees?.map(emp => Number(emp.salary))
      .filter(salary => !isNaN(salary) && salary >= MIN_SALARY && salary <= MAX_SALARY) || [];
    
    const totalSalary = validSalaries.reduce((sum, salary) => sum + salary, 0);
    const avgSalary = validSalaries.length > 0 ? Math.round(totalSalary / validSalaries.length) : 0;

    // Calculate median salary (more robust to outliers)
    const sortedSalaries = [...validSalaries].sort((a, b) => a - b);
    const medianSalary = sortedSalaries.length > 0 
      ? sortedSalaries.length % 2 === 0
        ? Math.round((sortedSalaries[sortedSalaries.length / 2 - 1] + sortedSalaries[sortedSalaries.length / 2]) / 2)
        : sortedSalaries[Math.floor(sortedSalaries.length / 2)]
      : 0;

    return NextResponse.json({
      count: employeeCount,
      validCount: validSalaries.length,
      totalSalary,
      avgSalary,
      medianSalary,
      _debug: {
        validSalaries,
        outliers: employees?.filter(emp => {
          const salary = Number(emp.salary);
          return !isNaN(salary) && (salary < MIN_SALARY || salary > MAX_SALARY);
        }).map(emp => ({ id: emp.id, salary: emp.salary }))
      }
    });
  } catch (error: any) {
    console.error('Error calculating salary metrics:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 