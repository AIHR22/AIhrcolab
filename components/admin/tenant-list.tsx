import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, Edit, LogIn, Power } from "lucide-react"
import Link from "next/link"

const tenants = [
  {
    id: "t-28c7ef",
    name: "Acme Corporation",
    adminEmail: "admin@acmecorp.com",
    plan: "Enterprise",
    status: "Active",
    userCount: 124,
    created: "2023-11-15T10:30:00Z",
    lastActive: "2025-04-17T08:22:00Z",
  },
  {
    id: "t-92a5d1",
    name: "TechSolutions Inc.",
    adminEmail: "admin@techsolutions.com",
    plan: "Professional",
    status: "Active",
    userCount: 47,
    created: "2024-01-22T14:15:00Z",
    lastActive: "2025-04-16T16:40:00Z",
  },
]

export function TenantList() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Users</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tenants.map((tenant) => (
            <TableRow key={tenant.id}>
              <TableCell className="font-medium">{tenant.name}</TableCell>
              <TableCell>{tenant.adminEmail}</TableCell>
              <TableCell>{tenant.plan}</TableCell>
              <TableCell>
                <Badge
                  variant={tenant.status === "Active" ? "default" : "secondary"}
                >
                  {tenant.status}
                </Badge>
              </TableCell>
              <TableCell>{tenant.userCount}</TableCell>
              <TableCell>{new Date(tenant.created).toLocaleDateString()}</TableCell>
              <TableCell>
                {new Date(tenant.lastActive).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/tenants/${tenant.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/tenants/${tenant.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <LogIn className="mr-2 h-4 w-4" />
                      Impersonate
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Power className="mr-2 h-4 w-4" />
                      {tenant.status === "Active" ? "Deactivate" : "Activate"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
