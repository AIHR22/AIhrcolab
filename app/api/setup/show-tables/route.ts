import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables for Supabase');
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Query to get all table information
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('table_name, column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .order('table_name')
      .order('ordinal_position');

    if (error) {
      console.error('Error fetching table info:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If no data found
    if (!data || data.length === 0) {
      return NextResponse.json({ message: 'No tables found' }, { status: 404 });
    }

    // Transform the data into a more readable format
    const tables = data.reduce((acc: any, curr) => {
      if (!acc[curr.table_name]) {
        acc[curr.table_name] = [];
      }
      acc[curr.table_name].push({
        column_name: curr.column_name,
        data_type: curr.data_type,
        is_nullable: curr.is_nullable,
        default_value: curr.column_default
      });
      return acc;
    }, {});

    return NextResponse.json({ tables });
  } catch (error) {
    console.error('Error in show-tables endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch table information' },
      { status: 500 }
    );
  }
} 