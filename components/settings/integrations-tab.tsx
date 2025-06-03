"use client"

import { ERPIntegration } from "@/components/integrations/erp-integration"
import CsvUploadEmployees from "../../app/integrations/CsvUploadEmployees"

export function IntegrationsTab() {
  return (
    <div className="space-y-6">
      <ERPIntegration />
      <CsvUploadEmployees />
    </div>
  )
}
