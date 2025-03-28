import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Database } from "lucide-react"
import Link from "next/link"

interface DatabaseErrorFallbackProps {
  error: string
}

export function DatabaseErrorFallback({ error }: DatabaseErrorFallbackProps) {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Error
        </CardTitle>
        <CardDescription>There was a problem connecting to the database</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <div className="space-y-4">
          <p className="text-sm">
            This error typically occurs when the required database tables don't exist or there's a connection issue with
            Supabase.
          </p>

          <h3 className="font-medium">Possible solutions:</h3>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Run the database setup to create the required tables</li>
            <li>Check your Supabase connection settings</li>
            <li>Verify that your Supabase service is running</li>
            <li>Check for any network issues that might prevent connecting to Supabase</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href="/setup">Go to Setup Page</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

