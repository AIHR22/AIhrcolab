"use client"

import { useState, useEffect } from "react"
import { getCompanySettings } from "@/lib/supabase/api"

export function CompanyBranding() {
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const data = await getCompanySettings()
        setSettings(data)

        // Apply branding colors to CSS variables
        if (data.primary_color) {
          document.documentElement.style.setProperty("--primary", data.primary_color)
        }
        if (data.secondary_color) {
          document.documentElement.style.setProperty("--secondary", data.secondary_color)
        }
      } catch (err) {
        console.error("Error fetching company settings:", err)
      }
    }

    fetchSettings()
  }, [])

  return null // This component just applies the branding, it doesn't render anything
}

