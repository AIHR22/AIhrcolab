import { supabaseAdmin } from '@/lib/supabase';

async function checkEmployee() {
  const { data, error } = await supabaseAdmin
    .from('employees')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  console.log('Employee data:', {
    salary: data.salary,
    type: typeof data.salary,
    asNumber: Number(data.salary)
  });
}

checkEmployee(); 