import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function NewEmployeeLoading() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-8 w-[250px]" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[200px]" />
            <Skeleton className="mt-1 h-4 w-[300px]" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            {Array(5)
              .fill(null)
              .map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-[80px]" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-[200px]" />
              <Skeleton className="mt-1 h-4 w-[300px]" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array(6)
                .fill(null)
                .map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-4 w-[80px]" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-[150px]" />
              <Skeleton className="mt-1 h-4 w-[250px]" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array(2)
                .fill(null)
                .map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-4 w-[80px]" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
            </CardContent>
            <div className="flex justify-between p-6">
              <Skeleton className="h-10 w-[100px]" />
              <Skeleton className="h-10 w-[150px]" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

