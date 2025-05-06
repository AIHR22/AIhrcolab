"use client"

import { TimeOffCalendar } from "@/components/time-off/time-off-calendar"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { toast } from "@/hooks/use-toast"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function TimeOffPage() {
  const [isTableSetupNeeded, setIsTableSetupNeeded] = useState(false)
  const [isSettingUp, setIsSettingUp] = useState(false)

  // Check if time_off_requests table exists
  useEffect(() => {
    const checkTable = async () => {
      try {
        const { error } = await supabase.from("time_off_requests").select("id").limit(1)

        // If we get a "relation does not exist" error, we need to set up the table
        if (error && error.message.includes('relation "public.time_off_requests" does not exist')) {
          setIsTableSetupNeeded(true)
        }
      } catch (err) {
        console.error("Error checking time_off_requests table:", err)
        setIsTableSetupNeeded(true)
      }
    }

    checkTable()
  }, [])

  // Set up time_off_requests table
  const setupTimeOffTable = async () => {
    try {
      setIsSettingUp(true)

      // Create time_off_requests table
      const { error: createError } = await supabase.rpc("create_time_off_requests_table")

      if (createError) {
        // If RPC doesn't exist, create the table directly
        await supabase.supabase.sql(`
          CREATE TABLE IF NOT EXISTS public.time_off_requests (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            employee_id UUID NOT NULL REFERENCES public.employees(id),
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            type TEXT NOT NULL,
            reason TEXT,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- Enable row level security
          ALTER TABLE public.time_off_requests ENABLE ROW LEVEL SECURITY;
          
          -- Create policies
          CREATE POLICY "Employees can view their own time off requests"
            ON public.time_off_requests
            FOR SELECT
            USING (
              employee_id IN (
                SELECT id FROM public.employees WHERE email = auth.jwt() -> 'email'
              )
            );
            
          CREATE POLICY "Employees can insert their own time off requests"
            ON public.time_off_requests
            FOR INSERT
            WITH CHECK (
              employee_id IN (
                SELECT id FROM public.employees WHERE email = auth.jwt() -> 'email'
              )
            );
            
          CREATE POLICY "Managers can view all time off requests"
            ON public.time_off_requests
            FOR SELECT
            USING (
              EXISTS (
                SELECT 1 FROM public.employees 
                WHERE email = auth.jwt() -> 'email' AND role = 'manager'
              )
            );
            
          CREATE POLICY "Managers can update time off request status"
            ON public.time_off_requests
            FOR UPDATE
            USING (
              EXISTS (
                SELECT 1 FROM public.employees 
                WHERE email = auth.jwt() -> 'email' AND role = 'manager'
              )
            );
        `)
      }

      toast({
        title: "Success!",
        description: "Time off management system is now set up",
      })

      setIsTableSetupNeeded(false)
    } catch (err) {
      console.error("Error setting up time_off_requests table:", err)
      toast({
        title: "Setup Failed",
        description: "Could not set up time off management system. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSettingUp(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Time Off Management</h1>
        <p className="text-muted-foreground">View and manage employee time off requests</p>
      </div>

      <TimeOffCalendar />
    </div>
  )
}

