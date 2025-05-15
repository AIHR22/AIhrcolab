"use client"

import { useState, useEffect } from "react"
import { getCompanySettings } from "@/lib/supabase/api"

// Generate lighter and darker variants of a color
export function generateColorVariants(color: string) {
  // Convert hex to RGB
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)
  
  // Generate lighter shade (70% more white)
  const lighter = `#${Math.min(255, Math.floor(r + (255 - r) * 0.7)).toString(16).padStart(2, '0')}${
    Math.min(255, Math.floor(g + (255 - g) * 0.7)).toString(16).padStart(2, '0')}${
    Math.min(255, Math.floor(b + (255 - b) * 0.7)).toString(16).padStart(2, '0')}`
  
  // Generate darker shade (40% darker)
  const darker = `#${Math.floor(r * 0.6).toString(16).padStart(2, '0')}${
    Math.floor(g * 0.6).toString(16).padStart(2, '0')}${
    Math.floor(b * 0.6).toString(16).padStart(2, '0')}`
  
  return { base: color, lighter, darker }
}

// Apply theme by setting CSS variables
export function applyTheme(primaryColor: string, secondaryColor: string) {
  const primary = generateColorVariants(primaryColor)
  const secondary = generateColorVariants(secondaryColor)
  
  // Set CSS variables for light mode
  document.documentElement.style.setProperty("--primary", primary.base)
  document.documentElement.style.setProperty("--primary-light", primary.lighter)
  document.documentElement.style.setProperty("--primary-dark", primary.darker)
  
  document.documentElement.style.setProperty("--secondary", secondary.base)
  document.documentElement.style.setProperty("--secondary-light", secondary.lighter)
  document.documentElement.style.setProperty("--secondary-dark", secondary.darker)
  
  // Also set variables specific to dark mode
  document.documentElement.style.setProperty("--dark-primary", primary.lighter)
  document.documentElement.style.setProperty("--dark-primary-light", primary.base)
  document.documentElement.style.setProperty("--dark-primary-dark", primary.base)
  
  document.documentElement.style.setProperty("--dark-secondary", secondary.lighter)
  document.documentElement.style.setProperty("--dark-secondary-light", secondary.base)
  document.documentElement.style.setProperty("--dark-secondary-dark", secondary.base)
}

// Validate a color is a proper hex code
export function isValidHexColor(color: string | undefined): boolean {
  if (!color) return false
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)
}

// Check if a color has sufficient contrast against white/black backgrounds
export function hasGoodContrast(color: string | undefined): boolean {
  if (!color || !isValidHexColor(color)) return false
  
  // Convert hex to RGB
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)
  
  // Calculate relative luminance (simplified version)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  // Should have sufficient contrast with both white and black
  return luminance > 0.2 && luminance < 0.8
}

export function CompanyBranding() {
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const data = await getCompanySettings()
        setSettings(data)

        // Apply theme using the new comprehensive function
        if (data.primary_color && data.secondary_color) {
          applyTheme(data.primary_color, data.secondary_color)
        }
      } catch (err) {
        console.error("Error fetching company settings:", err)
      }
    }

    fetchSettings()
  }, [])

  return null // This component just applies the branding, it doesn't render anything
}
