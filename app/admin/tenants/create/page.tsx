import { Metadata } from "next"
import { CreateTenantForm } from "@/components/admin/create-tenant-form"

export const metadata: Metadata = {
  title: "Create Tenant - HR Suite",
  description: "Create a new tenant organization",
}

export default function CreateTenantPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Create New Tenant</h2>
        <p className="text-muted-foreground">
          Set up a new tenant organization in the system
        </p>
      </div>
      <CreateTenantForm />
    </div>
  )
}
