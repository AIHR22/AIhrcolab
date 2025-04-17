import { Metadata } from "next"
import { AuditLogs } from "../../../components/admin/audit-logs"

export const metadata: Metadata = {
  title: "Audit & Logs - HR Suite",
  description: "View system audit logs and activity",
}

export default function AuditPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Audit & Logs</h2>
        <p className="text-muted-foreground">
          Monitor system activity and security events
        </p>
      </div>
      <AuditLogs />
    </div>
  )
}
