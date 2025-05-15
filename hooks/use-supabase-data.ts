"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

const supabase = createClient()

export function useSupabaseData<T>(
  tableName: string,
  options?: {
    select?: string
    filter?: { column: string; value: any; operator?: "eq" | "neq" | "gt" | "lt" | "gte" | "lte" | "like" }[]
    orderBy?: { column: string; ascending?: boolean }
    limit?: number
    page?: number
    pageSize?: number
  },
) {
  const [data, setData] = useState<T[] | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    if (!supabase) {
      setError(new Error("Supabase client not available"))
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        // Start with a count query to get total records
        const countQuery = supabase.from(tableName).select("*", { count: "exact", head: true })

        // Apply filters to count query
        if (options?.filter) {
          options.filter.forEach(({ column, value, operator = "eq" }) => {
            switch (operator) {
              case "eq":
                countQuery.eq(column, value)
                break
              case "neq":
                countQuery.neq(column, value)
                break
              case "gt":
                countQuery.gt(column, value)
                break
              case "lt":
                countQuery.lt(column, value)
                break
              case "gte":
                countQuery.gte(column, value)
                break
              case "lte":
                countQuery.lte(column, value)
                break
              case "like":
                countQuery.like(column, value)
                break
            }
          })
        }

        const { count: totalCount, error: countError } = await countQuery

        if (countError) {
          console.error("Error fetching count:", countError.message)
          // Don't throw here, continue with data fetch
        } else {
          setCount(totalCount)
        }

        // Now fetch the actual data
        let query = supabase.from(tableName).select(options?.select || "*")

        // Apply filters
        if (options?.filter) {
          options.filter.forEach(({ column, value, operator = "eq" }) => {
            switch (operator) {
              case "eq":
                query = query.eq(column, value)
                break
              case "neq":
                query = query.neq(column, value)
                break
              case "gt":
                query = query.gt(column, value)
                break
              case "lt":
                query = query.lt(column, value)
                break
              case "gte":
                query = query.gte(column, value)
                break
              case "lte":
                query = query.lte(column, value)
                break
              case "like":
                query = query.like(column, value)
                break
            }
          })
        }

        // Apply ordering
        if (options?.orderBy) {
          const { column, ascending = true } = options.orderBy
          query = query.order(column, { ascending })
        }

        // Apply pagination
        if (options?.page !== undefined && options?.pageSize) {
          const from = options.page * options.pageSize
          const to = from + options.pageSize - 1
          query = query.range(from, to)
        }
        // Or just apply limit
        else if (options?.limit) {
          query = query.limit(options.limit)
        }

        const { data: result, error: dataError } = await query

        if (dataError) {
          console.error(`Error fetching data from ${tableName}:`, dataError.message)
          setError(new Error(dataError.message))
          // Show toast for user feedback
          toast({
            title: "Data fetch error",
            description: `Could not load data from ${tableName}. Please try again later.`,
            variant: "destructive",
          })
        } else {
          setData(result as T[])
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        console.error(`Error in useSupabaseData for ${tableName}:`, errorMessage)
        setError(err instanceof Error ? err : new Error(String(err)))

        // Show toast for user feedback
        toast({
          title: "Unexpected error",
          description: "An error occurred while fetching data. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [tableName, JSON.stringify(options)])

  return { data, error, loading, count }
}

