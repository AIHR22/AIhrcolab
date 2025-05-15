import { NextResponse } from 'next/server';
// import { supabaseAdmin } from '@/lib/supabase'; // This was from the old file, not needed for the new spec
import { cookies } from 'next/headers'; // cookies() is used by createSupabaseServerComponentClient indirectly
import { createSupabaseServerComponentClient } from '@/lib/supabase/server';
// import { deepseekChat } from '@/lib/openrouterFetch'; // Actual path to your AI utility

// export const dynamic = 'force-dynamic'; // This was from the old file, can be kept if needed or removed.

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

// Placeholder for deepseekChat - replace with actual import and implementation
async function deepseekChat(messages: Array<{role: string, content: string}>): Promise<any> {
  console.log('Mock deepseekChat called for profitability simulator:', messages)
  await new Promise(resolve => setTimeout(resolve, 500)) // Simulate AI delay

  let adjustments = [];
  try {
    // Attempt to parse adjustments from the user message for more dynamic mock response
    const userMessageContent = messages.find(m => m.role === 'user')?.content || '';
    // Corrected regex to avoid 's' flag for broader compatibility
    const adjustmentsMatch = userMessageContent.match(/User Adjustments: ([\s\S]*)/);
    if (adjustmentsMatch && adjustmentsMatch[1]) {
        const parsedInput = JSON.parse(adjustmentsMatch[1]);
        adjustments = parsedInput.adjustments || [];
    } else {
        console.warn("Could not parse adjustments from AI prompt for mock response from user message string.")
    }
  } catch (e) {
    console.error("Error parsing adjustments from AI prompt for mock response:", e)
  }

  const simulatedResults = adjustments.map((adj: any) => ({
    departmentId: adj.departmentId,
    newHeadcount: (Math.random() * 50) + (adj.deltaHeadcount || 0), 
    newRevenue: (Math.random() * 1000000) + ((adj.deltaHeadcount || 0) * 20000),
    impact: ((adj.deltaHeadcount || 0) * 20000) * 0.1 
  }));

  return simulatedResults;
}

export async function POST(request: Request) {
  // const cookieStore = cookies(); // Not needed directly if createSupabaseServerComponentClient handles it
  const supabase = createSupabaseServerComponentClient(); // Corrected: No arguments

  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { adjustments } = body; 

    if (!Array.isArray(adjustments)) {
      return NextResponse.json({ error: 'Invalid input: "adjustments" must be an array.' }, { status: 400 });
    }
    
    const { data: departmentsBaseline, error: baselineError } = await supabase
        .from('department_revenue') 
        .select('department_id, department_name, headcount, revenue_per_employee');
        
    if (baselineError) {
        console.warn("Could not fetch department baseline data for AI prompt, proceeding without it.", baselineError);
    }

    const aiMessages = [
      {
        role: 'system',
        content: 'You are a profitability simulation assistant. Given baseline data for departments and user-provided headcount adjustments for specific departments, compute the new headcount, new revenue, and financial impact for each adjusted department. Return the results as a JSON array.'
      },
      {
        role: 'user',
        content: `Baseline Department Data: ${JSON.stringify(departmentsBaseline || [])}. User Adjustments: ${JSON.stringify({ adjustments })}`
      }
    ];

    const aiJsonResponseArray = await deepseekChat(aiMessages);

    return NextResponse.json({
      simulation: aiJsonResponseArray 
    });

  } catch (e: any) {
    console.error('Error in POST /api/revenue/simulate:', e);
    if (e instanceof SyntaxError) { 
        return NextResponse.json({ error: 'Invalid JSON in request body', details: e.message }, { status: 400 });
    }
    if (e.message && e.message.toLowerCase().includes('ai failure')) { 
        return NextResponse.json({ error: 'AI processing failed' }, { status: 502 });
    }
    return NextResponse.json({ error: 'An unexpected error occurred', details: e.message }, { status: 500 });
  }
}
