import type React from "react"
import { APIProvider } from "@/components/api/api-provider"

export default function ComplianceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <APIProvider>{children}</APIProvider>
}

