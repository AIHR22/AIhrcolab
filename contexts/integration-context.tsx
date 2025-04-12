"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Integration = {
  id: string
  name: string
  system_type: string
  auth_type: string
  is_active: boolean
  sync_frequency: string
  last_sync_at?: string
  next_sync_at?: string
  created_at: string
  updated_at: string
}

type IntegrationContextType = {
  integrations: Integration[]
  isLoading: boolean
  error: string | null
  refreshIntegrations: () => Promise<void>
  triggerSync: (id: string) => Promise<void>
  toggleIntegrationStatus: (id: string, isActive: boolean) => Promise<void>
}

const IntegrationContext = createContext<IntegrationContextType | undefined>(undefined)

export function IntegrationProvider({ children }: { children: ReactNode }) {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchIntegrations = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('/api/integrations/simplified')
      
      if (!response.ok) {
        throw new Error('Failed to fetch integrations')
      }

      const data = await response.json()
      setIntegrations(data)
    } catch (error: any) {
      console.error('Error fetching integrations:', error)
      setError(error.message || 'Failed to load integrations')
    } finally {
      setIsLoading(false)
    }
  }

  const triggerSync = async (id: string) => {
    try {
      const response = await fetch(`/api/integrations/simplified?action=sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          integration_id: id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to start synchronization')
      }

      // Refresh integrations list after sync
      await fetchIntegrations()
    } catch (error: any) {
      console.error('Error triggering sync:', error)
      throw error
    }
  }

  const toggleIntegrationStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/integrations/simplified/${id}?action=activate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: isActive,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || 'Failed to update integration status')
      }

      // Refresh integrations list after status change
      await fetchIntegrations()
    } catch (error: any) {
      console.error('Error updating integration status:', error)
      setError(error.message || 'Failed to update integration status')
      // Re-fetch to ensure UI is in sync with server state
      await fetchIntegrations()
    }
  }

  useEffect(() => {
    fetchIntegrations()
  }, [])

  return (
    <IntegrationContext.Provider
      value={{
        integrations,
        isLoading,
        error,
        refreshIntegrations: fetchIntegrations,
        triggerSync,
        toggleIntegrationStatus,
      }}
    >
      {children}
    </IntegrationContext.Provider>
  )
}

export function useIntegration() {
  const context = useContext(IntegrationContext)
  if (context === undefined) {
    throw new Error('useIntegration must be used within an IntegrationProvider')
  }
  return context
}