"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface APIContextType {
  isConnected: boolean
  setIsConnected: (connected: boolean) => void
}

const APIContext = createContext<APIContextType | null>(null)

export function APIProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(true)

  return <APIContext.Provider value={{ isConnected, setIsConnected }}>{children}</APIContext.Provider>
}

export function useAPI() {
  const context = useContext(APIContext)
  if (!context) {
    throw new Error("useAPI must be used within an APIProvider")
  }
  return context
}

