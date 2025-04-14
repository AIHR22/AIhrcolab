"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"
import { useAPI } from "@/lib/api/use-api"

interface IntegrationSystem {
  id: string
  name: string
  type: "erp" | "crm" | "external"
  status: "connected" | "disconnected" | "partial"
  lastSync: Date | null
  icon: React.ReactNode
}

export function IntegrationStatus() {
  const { integrations, refreshStatus } = useAPI()

  const [systems, setSystems] = useState<IntegrationSystem[]>([
    {
      id: "sap",
      name: "SAP",
      type: "erp",
      status: integrations.sap ? "connected" : "disconnected",
      lastSync: integrations.sap ? new Date(Date.now() - 1000 * 60 * 30) : null, // 30 minutes ago
      icon: (
        <div className="h-10 w-10 rounded-full bg-blue-100 p-2 dark:bg-blue-900">
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-blue-600 dark:text-blue-300">
            <path fill="currentColor" d="M9.5 3v18L5 17.2v-6.7L0.5 6.5v-3.5h9zm14 0v3.5L19 10.5v6.7L14.5 21V3h9z" />
          </svg>
        </div>
      ),
    },
    {
      id: "oracle",
      name: "Oracle",
      type: "erp",
      status: integrations.oracle ? "connected" : "disconnected",
      lastSync: integrations.oracle ? new Date(Date.now() - 1000 * 60 * 45) : null, // 45 minutes ago
      icon: (
        <div className="h-10 w-10 rounded-full bg-red-100 p-2 dark:bg-red-900">
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-red-600 dark:text-red-300">
            <path
              fill="currentColor"
              d="M16.5 3C19.5 3 22 5.5 22 8.5c0 1.8-0.9 3.4-2.2 4.5 1.3 1 2.2 2.7 2.2 4.5 0 3-2.5 5.5-5.5 5.5h-9C4.5 23 2 20.5 2 17.5c0-1.8 0.9-3.4 2.2-4.5C3 12 2 10.3 2 8.5 2 5.5 4.5 3 7.5 3h9z"
            />
          </svg>
        </div>
      ),
    },
    {
      id: "workday",
      name: "Workday",
      type: "erp",
      status: integrations.workday ? "connected" : "disconnected",
      lastSync: integrations.workday ? new Date(Date.now() - 1000 * 60 * 60) : null, // 1 hour ago
      icon: (
        <div className="h-10 w-10 rounded-full bg-purple-100 p-2 dark:bg-purple-900">
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-purple-600 dark:text-purple-300">
            <path
              fill="currentColor"
              d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"
            />
            <path
              fill="currentColor"
              d="M12 6c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm0 10c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z"
            />
            <circle fill="currentColor" cx="12" cy="12" r="2" />
          </svg>
        </div>
      ),
    },
    {
      id: "zoho",
      name: "Zoho CRM",
      type: "crm",
      status: integrations.zoho ? "connected" : "disconnected",
      lastSync: integrations.zoho ? new Date(Date.now() - 1000 * 60 * 90) : null, // 90 minutes ago
      icon: (
        <div className="h-10 w-10 rounded-full bg-green-100 p-2 dark:bg-green-900">
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-green-600 dark:text-green-300">
            <path
              fill="currentColor"
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
            />
            <path
              fill="currentColor"
              d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
            />
          </svg>
        </div>
      ),
    },
    {
      id: "highLevel",
      name: "HighLevel CRM",
      type: "crm",
      status: integrations.highLevel ? "connected" : "disconnected",
      lastSync: integrations.highLevel ? new Date(Date.now() - 1000 * 60 * 120) : null, // 2 hours ago
      icon: (
        <div className="h-10 w-10 rounded-full bg-amber-100 p-2 dark:bg-amber-900">
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-amber-600 dark:text-amber-300">
            <path fill="currentColor" d="M3 3h18v18H3V3zm16 16V5H5v14h14z" />
            <path fill="currentColor" d="M15 7H9v2h6V7zm0 4H9v2h6v-2zm0 4H9v2h6v-2z" />
          </svg>
        </div>
      ),
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      type: "external",
      status: integrations.linkedin ? "connected" : "disconnected",
      lastSync: integrations.linkedin ? new Date(Date.now() - 1000 * 60 * 180) : null, // 3 hours ago
      icon: (
        <div className="h-10 w-10 rounded-full bg-blue-100 p-2 dark:bg-blue-900">
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-blue-600 dark:text-blue-300">
            <path
              fill="currentColor"
              d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"
            />
          </svg>
        </div>
      ),
    },
  ])

  const handleRefresh = () => {
    refreshStatus()

    // Update the systems with the latest integration status
    setSystems((prev) =>
      prev.map((system) => ({
        ...system,
        status: integrations[system.id as keyof typeof integrations] ? "connected" : "disconnected",
        lastSync: integrations[system.id as keyof typeof integrations] ? new Date() : null,
      })),
    )
  }

  const getStatusBadge = (status: IntegrationSystem["status"]) => {
    switch (status) {
      case "connected":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
            <CheckCircle className="mr-1 h-3 w-3" />
            Connected
          </Badge>
        )
      case "disconnected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
            <XCircle className="mr-1 h-3 w-3" />
            Disconnected
          </Badge>
        )
      case "partial":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            <AlertCircle className="mr-1 h-3 w-3" />
            Partial
          </Badge>
        )
      default:
        return <Badge>Unknown</Badge>
    }
  }

  const erpSystems = systems.filter((system) => system.type === "erp")
  const crmSystems = systems.filter((system) => system.type === "crm")
  const externalSystems = systems.filter((system) => system.type === "external")

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Integration Status</h2>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Status
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-3">ERP Systems</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {erpSystems.map((system) => (
              <Card key={system.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {system.icon}
                      <div>
                        <h4 className="font-medium">{system.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {system.lastSync
                            ? `Last synced ${new Date(system.lastSync).toLocaleTimeString()}`
                            : "Not synced yet"}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(system.status)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">CRM Systems</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {crmSystems.map((system) => (
              <Card key={system.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {system.icon}
                      <div>
                        <h4 className="font-medium">{system.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {system.lastSync
                            ? `Last synced ${new Date(system.lastSync).toLocaleTimeString()}`
                            : "Not synced yet"}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(system.status)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">External Services</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {externalSystems.map((system) => (
              <Card key={system.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {system.icon}
                      <div>
                        <h4 className="font-medium">{system.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {system.lastSync
                            ? `Last synced ${new Date(system.lastSync).toLocaleTimeString()}`
                            : "Not synced yet"}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(system.status)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

