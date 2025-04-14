import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

async function setupDatabase() {
  // Load environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Read and execute schema.sql
    console.log('Setting up database schema...');
    const schemaPath = path.join(process.cwd(), 'db', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    const { error: schemaError } = await supabase.rpc('exec_sql', {
      sql_query: schemaSql
    });

    if (schemaError) {
      console.error('Error executing schema.sql:', schemaError);
      return;
    }

    // Read and execute all migration files
    console.log('Applying migrations...');
    const migrationsDir = path.join(process.cwd(), 'db', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir);

    for (const file of migrationFiles) {
      if (file.endsWith('.sql')) {
        console.log(`Applying migration: ${file}`);
        const migrationPath = path.join(migrationsDir, file);
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');

        const { error: migrationError } = await supabase.rpc('exec_sql', {
          sql_query: migrationSql
        });

        if (migrationError) {
          console.error(`Error executing ${file}:`, migrationError);
          return;
        }
      }
    }

    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

setupDatabase(); 