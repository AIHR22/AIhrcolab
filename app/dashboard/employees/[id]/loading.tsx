import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function EmployeeDetailLoading() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-8 w-[250px]" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="flex flex-col items-center text-center">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="mt-4 h-6 w-[180px]" />
            <Skeleton className="mt-2 h-4 w-[120px]" />
            <Skeleton className="mt-2 h-5 w-[80px]" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {Array(5)
                .fill(null)
                .map((_, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
            </div>
            <Skeleton className="h-px w-full" />
            <div className="space-y-2">
              {Array(2)
                .fill(null)
                .map((_, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
            </div>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Skeleton className="h-10 w-full" />
          <div className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-[100px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-3/4" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-[150px]" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array(3)
                    .fill(null)
                    .map((_, index) => (
                      <div key={index} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-5 w-[150px]" />
                          <Skeleton className="h-4 w-[80px]" />
                        </div>
                        <Skeleton className="mt-2 h-4 w-full" />
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

