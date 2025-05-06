import { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { TenantDetails } from "@/components/admin/tenant-details"
import { Edit, LogIn } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Tenant Details - HR Suite",
  description: "View tenant details and configuration",
}

export default function TenantDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tenant Details</h2>
          <p className="text-muted-foreground">
            View and manage tenant configuration
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline">
            <LogIn className="mr-2 h-4 w-4" />
            Impersonate
          </Button>
          <Button asChild>
            <Link href={`/admin/tenants/${params.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Tenant
            </Link>
          </Button>
        </div>
      </div>
      <TenantDetails id={params.id} />
    </div>
  )
}
