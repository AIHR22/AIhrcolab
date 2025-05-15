"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/lib/supabase/supabase-provider"

export function CompanyThemeProvider() {
  const { supabase } = useSupabase()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    async function loadCompanySettings() {
      try {
        const { data, error } = await supabase.from("company_settings").select("*").single()

        if (error) {
          console.error("Error loading company settings:", error)
          return
        }

        if (data) {
          // Apply company branding to CSS variables
          if (data.primary_color) {
            document.documentElement.style.setProperty("--primary", data.primary_color)
          }
          if (data.secondary_color) {
            document.documentElement.style.setProperty("--secondary", data.secondary_color)
          }
        }
      } catch (err) {
        console.error("Failed to load company settings:", err)
      } finally {
        setIsLoaded(true)
      }
    }

    loadCompanySettings()
  }, [supabase])

  return null // This component doesn't render anything
}

