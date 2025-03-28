import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST() {
  try {
    // Create the create_function_if_not_exists function
    const { error } = await supabaseAdmin.rpc("create_function_if_not_exists", {
      function_name: "create_function_if_not_exists",
      function_definition: `
        CREATE OR REPLACE FUNCTION create_function_if_not_exists(
          function_name text,
          function_definition text
        ) RETURNS void AS $$
        BEGIN
          -- Check if the function exists
          IF NOT EXISTS (
            SELECT 1
            FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public'
            AND p.proname = function_name
          ) THEN
            -- Execute the function definition
            EXECUTE function_definition;
          END IF;
        END;
        $$ LANGUAGE plpgsql;
      `,
    })

    if (error) {
      // If the function doesn't exist yet, create it directly
      const { error: directError } = await supabaseAdmin.rpc("exec", {
        sql: `
          CREATE OR REPLACE FUNCTION create_function_if_not_exists(
            function_name text,
            function_definition text
          ) RETURNS void AS $$
          BEGIN
            -- Check if the function exists
            IF NOT EXISTS (
              SELECT 1
              FROM pg_proc p
              JOIN pg_namespace n ON p.pronamespace = n.oid
              WHERE n.nspname = 'public'
              AND p.proname = function_name
            ) THEN
              -- Execute the function definition
              EXECUTE function_definition;
            END IF;
          END;
          $$ LANGUAGE plpgsql;
        `,
      })

      if (directError) {
        // If exec function doesn't exist, create it first
        await supabaseAdmin.sql(`
          CREATE OR REPLACE FUNCTION exec(sql text) RETURNS void AS $$
          BEGIN
            EXECUTE sql;
          END;
          $$ LANGUAGE plpgsql;
          
          CREATE OR REPLACE FUNCTION create_function_if_not_exists(
            function_name text,
            function_definition text
          ) RETURNS void AS $$
          BEGIN
            -- Check if the function exists
            IF NOT EXISTS (
              SELECT 1
              FROM pg_proc p
              JOIN pg_namespace n ON p.pronamespace = n.oid
              WHERE n.nspname = 'public'
              AND p.proname = function_name
            ) THEN
              -- Execute the function definition
              EXECUTE function_definition;
            END IF;
          END;
          $$ LANGUAGE plpgsql;
        `)
      }
    }

    return NextResponse.json({
      success: true,
      message: "SQL functions created successfully",
    })
  } catch (error) {
    console.error("SQL function setup error:", error)
    return NextResponse.json({ error: "Failed to set up SQL functions" }, { status: 500 })
  }
}

