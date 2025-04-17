import { Metadata } from "next"
import { BillingDashboard } from "@/components/admin/billing-dashboard"

export const metadata: Metadata = {
  title: "Billing & Subscriptions - HR Suite",
  description: "Manage subscription plans and billing",
}

export default function BillingPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Billing & Subscriptions
        </h2>
        <p className="text-muted-foreground">
          Manage subscription plans and monitor revenue
        </p>
      </div>
      <BillingDashboard />
    </div>
  )
}
