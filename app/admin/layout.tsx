import { Metadata } from "next"
import { SideNav } from "@/components/admin/side-nav"
import { TopNav } from "@/components/admin/top-nav"

export const metadata: Metadata = {
  title: "Admin Portal - HR Suite",
  description: "System administration portal for HR Suite",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="flex">
        <SideNav />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
