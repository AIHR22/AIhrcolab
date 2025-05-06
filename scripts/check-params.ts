import { supabaseAdmin } from '@/lib/supabase';

async function checkModelParams() {
  const { data, error } = await supabaseAdmin
    .from('revenue_model_params')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  console.log('Current Model Parameters:', JSON.stringify(data, null, 2));
}

checkModelParams(); 