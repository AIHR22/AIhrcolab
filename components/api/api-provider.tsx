"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

// Define the API context type
type APIContextType = {
  isConnected: boolean
  apiKey: string | null
  setApiKey: (key: string | null) => void
  baseUrl: string
  setBaseUrl: (url: string) => void
}

// Create the context with a default value
const APIContext = createContext<APIContextType | undefined>(undefined)

// Create a provider component
export function APIProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [baseUrl, setBaseUrl] = useState("https://api.example.com")

  // Simulate API connection check
  useEffect(() => {
    // This is just a simulation - in a real app, you'd check the actual API connection
    const checkConnection = async () => {
      try {
        // Simulate API check with a timeout
        await new Promise((resolve) => setTimeout(resolve, 500))
        setIsConnected(true)
      } catch (error) {
        setIsConnected(false)
      }
    }

    checkConnection()

    // Set up interval to periodically check connection
    const interval = setInterval(checkConnection, 30000)
    return () => clearInterval(interval)
  }, [apiKey, baseUrl])

  // Create the context value
  const contextValue: APIContextType = {
    isConnected,
    apiKey,
    setApiKey,
    baseUrl,
    setBaseUrl,
  }

  return <APIContext.Provider value={contextValue}>{children}</APIContext.Provider>
}

// Create a custom hook to use the API context
export function useAPI() {
  const context = useContext(APIContext)
  if (context === undefined) {
    throw new Error("useAPI must be used within an APIProvider")
  }
  return context
}

