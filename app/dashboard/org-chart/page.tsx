"use client"

import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Dynamic import with ssr: false to prevent server-side rendering
import dynamic from "next/dynamic"

// Dynamically import the OrgChart component with SSR disabled
const OrgChart = dynamic(() => import("@/components/organization/org-chart").then((mod) => mod.OrgChart), {
  ssr: false,
  loading: () => <OrgChartSkeleton />,
})

function OrgChartSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-64" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-16" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-[800px] w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

export default function OrgChartPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Organization Chart</h1>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle>Organization Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<OrgChartSkeleton />}>
            <OrgChart />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

