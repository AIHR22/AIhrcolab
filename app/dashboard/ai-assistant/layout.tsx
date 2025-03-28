import type React from "react"
import { APIProvider } from "@/components/api/api-provider"

export default function AIAssistantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <APIProvider>{children}</APIProvider>
}

