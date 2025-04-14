"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface AIContextType {
  isEnabled: boolean
  setIsEnabled: (enabled: boolean) => void
}

const AIContext = createContext<AIContextType | null>(null)

export function AIProvider({ children }: { children: React.ReactNode }) {
  const [isEnabled, setIsEnabled] = useState(true)

  return <AIContext.Provider value={{ isEnabled, setIsEnabled }}>{children}</AIContext.Provider>
}

export function useAI() {
  const context = useContext(AIContext)
  if (!context) {
    throw new Error("useAI must be used within an AIProvider")
  }
  return context
}

