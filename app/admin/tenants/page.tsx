import { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { TenantList } from "@/components/admin/tenant-list"
import { SearchAndFilter } from "@/components/admin/search-filter"
import { Plus } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Tenant Management - HR Suite",
  description: "Manage tenant organizations",
}

export default function TenantsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tenant Management</h2>
          <p className="text-muted-foreground">
            Manage and monitor all tenant organizations
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/tenants/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Tenant
          </Link>
        </Button>
      </div>
      <SearchAndFilter />
      <TenantList />
    </div>
  )
}
