import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/admin/user-nav"

export function TopNav() {
  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 gap-6">
        <Link href="/admin" className="font-semibold text-lg">
          HR Suite Admin
        </Link>
        <div className="ml-auto flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            className="text-muted-foreground"
            asChild
          >
            <Link href="/">Exit Admin Mode</Link>
          </Button>
          <UserNav />
        </div>
      </div>
    </header>
  )
}
