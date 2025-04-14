"use client"

import { AlertCircle, CheckCircle, Clock, DollarSign, FileText, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface HiringRecommendationsProps {
  data: any
}

export function HiringRecommendations({ data }: HiringRecommendationsProps) {
  const hiringData = data?.hiringRecommendations

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Hiring Recommendations</h3>
        <p className="text-sm text-muted-foreground">
          AI-generated hiring plan based on skill gaps and capacity analysis
        </p>
      </div>

      <div className="rounded-lg border p-4">
        <h4 className="font-medium">Recommended Hires</h4>
        <div className="mt-4 space-y-4">
          {hiringData?.recommendedHires.map((hire: any, index: number) => (
            <div
              key={index}
              className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <h5 className="font-medium">
                    {hire.count}x {hire.role}
                  </h5>
                </div>
                <div className="flex flex-wrap gap-1">
                  {hire.skills.map((skill: string) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Employment Type: {hire.employmentType}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(hire.annualCost)}</p>
                  <p className="text-xs text-muted-foreground">
                    {hire.employmentType === "Full-time" ? "Annual Cost" : "Project Cost"}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Find Candidates
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <h4 className="font-medium">Total Hiring Cost</h4>
          </div>
          <p className="mt-2 text-2xl font-bold">{formatCurrency(hiringData?.totalCost || 0)}</p>
          <p className="text-sm text-muted-foreground">Estimated annual cost</p>
        </div>

        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <h4 className="font-medium">Time to Hire</h4>
          </div>
          <p className="mt-2 text-2xl font-bold">{hiringData?.timeToHire || 0} days</p>
          <p className="text-sm text-muted-foreground">Average time to fill positions</p>
        </div>

        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            <h4 className="font-medium">Timeline Impact</h4>
          </div>
          <p className="mt-2 text-2xl font-bold">{hiringData?.impactOnTimeline || "Medium"}</p>
          <p className="text-sm text-muted-foreground">Effect on project timeline</p>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <h4 className="font-medium">Alternative Solutions</h4>
        <div className="mt-4 space-y-4">
          {hiringData?.alternativeSolutions.map((solution: any, index: number) => (
            <div key={index} className="space-y-2">
              <h5 className="font-medium">{solution.description}</h5>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-md bg-green-50 p-3 dark:bg-green-950">
                  <h6 className="flex items-center gap-2 font-medium text-green-700 dark:text-green-300">
                    <CheckCircle className="h-4 w-4" />
                    Pros
                  </h6>
                  <ul className="mt-2 space-y-1 pl-6 text-sm text-green-700 dark:text-green-300">
                    {solution.pros.map((pro: string, i: number) => (
                      <li key={i} className="list-disc">
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-md bg-red-50 p-3 dark:bg-red-950">
                  <h6 className="flex items-center gap-2 font-medium text-red-700 dark:text-red-300">
                    <AlertCircle className="h-4 w-4" />
                    Cons
                  </h6>
                  <ul className="mt-2 space-y-1 pl-6 text-sm text-red-700 dark:text-red-300">
                    {solution.cons.map((con: string, i: number) => (
                      <li key={i} className="list-disc">
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <h4 className="font-medium">Next Steps</h4>
        <div className="mt-4 space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              1
            </div>
            <div>
              <p className="font-medium">Review Hiring Recommendations</p>
              <p className="text-sm text-muted-foreground">
                Review the AI-generated hiring plan and make any necessary adjustments.
              </p>
            </div>
          </div>
          <Separator />
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              2
            </div>
            <div>
              <p className="font-medium">Approve Budget</p>
              <p className="text-sm text-muted-foreground">
                Secure approval for the hiring budget from finance and leadership.
              </p>
            </div>
          </div>
          <Separator />
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              3
            </div>
            <div>
              <p className="font-medium">Initiate Hiring Process</p>
              <p className="text-sm text-muted-foreground">
                Create job postings and begin the recruitment process for the recommended roles.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Generate Hiring Plan
        </Button>
      </div>
    </div>
  )
}

