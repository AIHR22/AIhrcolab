"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { isValidUUID } from "@/lib/utils"

export function useRealtime<T>(table: string, id?: string, column = "id", initialData: T[] = []) {
  const [data, setData] = useState<T[]>(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      setError(new Error("Supabase credentials are not configured"))
      setLoading(false)
      return
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const fetchData = async () => {
      try {
        let query = supabase.from(table).select("*")

        if (id) {
          // Only filter by ID if it's a valid UUID
          if (isValidUUID(id)) {
            query = query.eq(column, id)
          } else {
            console.warn(`Invalid UUID format: ${id}. Fetching all records instead.`)
          }
        }

        const { data: fetchedData, error: fetchError } = await query

        if (fetchError) {
          throw new Error(`Error fetching data from ${table}: ${fetchError.message}`)
        }

        setData(fetchedData as T[])
        setLoading(false)
      } catch (err) {
        console.error("Error in useRealtime hook:", err)
        setError(err instanceof Error ? err : new Error(String(err)))
        setLoading(false)
      }
    }

    fetchData()

    // Set up realtime subscription
    const channel = supabase
      .channel(`${table}_changes`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: table,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setData((currentData) => [...currentData, payload.new as T])
          } else if (payload.eventType === "UPDATE") {
            setData((currentData) => currentData.map((item: any) => (item.id === payload.new.id ? payload.new : item)))
          } else if (payload.eventType === "DELETE") {
            setData((currentData) => currentData.filter((item: any) => item.id !== payload.old.id))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, id, column])

  return { data, loading, error }
}

