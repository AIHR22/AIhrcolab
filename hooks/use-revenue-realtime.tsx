"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

export function useRevenueRealtime() {
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [modelParams, setModelParams] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const supabase = createClientComponentClient<Database>()

    // Initial fetch of data
    const fetchData = async () => {
      try {
        // Fetch revenue data
        const { data: revenue, error: revenueError } = await supabase
          .from('revenue_data')
          .select('*')
          .order('period_date', { ascending: true })

        if (revenueError) throw revenueError

        // Fetch latest model parameters
        const { data: params, error: paramsError } = await supabase
          .from('revenue_model_params')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (paramsError) throw paramsError

        setRevenueData(revenue)
        setModelParams(params)
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Subscribe to revenue_data changes
    const revenueChannel = supabase
      .channel('revenue_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'revenue_data',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setRevenueData((current) => [...current, payload.new])
          } else if (payload.eventType === 'UPDATE') {
            setRevenueData((current) =>
              current.map((item) =>
                item.id === payload.new.id ? payload.new : item
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setRevenueData((current) =>
              current.filter((item) => item.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    // Subscribe to model_params changes
    const paramsChannel = supabase
      .channel('params_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'revenue_model_params',
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setModelParams(payload.new)
          }
        }
      )
      .subscribe()

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(revenueChannel)
      supabase.removeChannel(paramsChannel)
    }
  }, [])

  return { revenueData, modelParams, loading, error }
} 