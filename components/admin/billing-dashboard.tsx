import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Plus } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { RevenueChart } from "../admin/revenue-chart"

const mockBillingData = {
  plans: [
    {
      id: "basic",
      name: "Basic",
      price: 99,
      billingCycles: ["monthly", "annual"],
      annualDiscount: 10,
      features: {
        users: 25,
        storage: "10 GB",
        modules: ["Dashboard", "Employees", "Organization"],
        support: "Email",
      },
    },
    {
      id: "professional",
      name: "Professional",
      price: 299,
      billingCycles: ["monthly", "annual"],
      annualDiscount: 15,
      features: {
        users: 100,
        storage: "50 GB",
        modules: [
          "Dashboard",
          "Employees",
          "Organization",
          "Payroll",
          "Workforce Planning",
        ],
        support: "Priority",
      },
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: 999,
      billingCycles: ["monthly", "annual"],
      annualDiscount: 20,
      features: {
        users: "Unlimited",
        storage: "100 GB",
        modules: "All",
        support: "Dedicated",
      },
    },
  ],
  subscriptions: [
    {
      tenant: "Acme Corporation",
      plan: "Enterprise",
      status: "Active",
      mrr: 999,
      nextBilling: "2025-05-17",
      paymentStatus: "Paid",
    },
    {
      tenant: "TechSolutions Inc.",
      plan: "Professional",
      status: "Active",
      mrr: 299,
      nextBilling: "2025-05-01",
      paymentStatus: "Paid",
    },
    {
      tenant: "StartupCo",
      plan: "Basic",
      status: "Trial",
      mrr: 0,
      nextBilling: "2025-05-10",
      paymentStatus: "Trial",
    },
  ],
  revenue: {
    mrr: 12475,
    arr: 149700,
    growth: "+15%",
  },
}

export function BillingDashboard() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <Badge variant="secondary">
              {mockBillingData.revenue.growth}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${mockBillingData.revenue.mrr.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Monthly Recurring Revenue
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${mockBillingData.revenue.arr.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Annual Recurring Revenue
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockBillingData.subscriptions.filter(s => s.status === "Active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Paid subscriptions
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <RevenueChart />
        </CardContent>
      </Card>

      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList>
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="subscriptions">Active Subscriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="plans">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Plans</CardTitle>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Plan
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {mockBillingData.plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="flex items-start justify-between space-x-4 rounded-lg border p-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{plan.name}</h3>
                        <Badge variant="secondary">
                          ${plan.price}/month
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Users: {plan.features.users}</p>
                        <p>Storage: {plan.features.storage}</p>
                        <p>
                          Modules:{" "}
                          {Array.isArray(plan.features.modules)
                            ? plan.features.modules.join(", ")
                            : plan.features.modules}
                        </p>
                        <p>Support: {plan.features.support}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions">
          <Card>
            <CardHeader>
              <CardTitle>Active Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>MRR</TableHead>
                    <TableHead>Next Billing</TableHead>
                    <TableHead>Payment Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockBillingData.subscriptions.map((sub) => (
                    <TableRow key={sub.tenant}>
                      <TableCell className="font-medium">{sub.tenant}</TableCell>
                      <TableCell>{sub.plan}</TableCell>
                      <TableCell>
                        <Badge
                          variant={sub.status === "Active" ? "default" : "secondary"}
                        >
                          {sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell>${sub.mrr}</TableCell>
                      <TableCell>{sub.nextBilling}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            sub.paymentStatus === "Paid"
                              ? "default"
                              : sub.paymentStatus === "Trial"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {sub.paymentStatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
