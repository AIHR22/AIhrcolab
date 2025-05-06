"use client"

import { useAPI } from "@/lib/api/api-provider"
import { Badge } from "@/components/ui/badge"
import { WifiIcon, WifiOffIcon } from "lucide-react"

export function APIStatusIndicatorClient() {
  const { isConnected } = useAPI()

  return (
    <Badge variant={isConnected ? "outline" : "destructive"} className="flex items-center gap-1 px-2 py-1">
      {isConnected ? (
        <>
          <WifiIcon className="h-3.5 w-3.5" />
          <span className="text-xs">Connected</span>
        </>
      ) : (
        <>
          <WifiOffIcon className="h-3.5 w-3.5" />
          <span className="text-xs">Disconnected</span>
        </>
      )}
    </Badge>
  )
}

