"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export function useSupabaseQuery<T>(
  tableName: string,
  options?: {
    select?: string
    filter?: { column: string; value: any }[]
    orderBy?: { column: string; ascending?: boolean }
    limit?: number
  },
) {
  const [data, setData] = useState<T[] | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setError(new Error("Supabase client not available"))
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        let query = supabase.from(tableName).select(options?.select || "*")

        // Apply filters
        if (options?.filter) {
          options.filter.forEach(({ column, value }) => {
            query = query.eq(column, value)
          })
        }

        // Apply ordering
        if (options?.orderBy) {
          const { column, ascending = true } = options.orderBy
          query = query.order(column, { ascending })
        }

        // Apply limit
        if (options?.limit) {
          query = query.limit(options.limit)
        }

        const { data, error } = await query

        if (error) throw error
        setData(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [tableName, JSON.stringify(options)])

  return { data, error, loading }
}

