import { NextRequest, NextResponse } from 'next/server'

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Employees", path: "/dashboard/employees" },
  { label: "Organization", path: "/dashboard/organization" },
  { label: "Workforce Planning", path: "/dashboard/workforce-planning" },
  { label: "Revenue Forecasting", path: "/dashboard/revenue" },
  { label: "HR Assistant", path: "/dashboard/hr-assistant" },
  { label: "Settings", path: "/dashboard/settings" },
  // Add more global navigation items here
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")?.toLowerCase()

  if (!query) {
    return NextResponse.json(navItems, { status: 200 })
  }

  const filteredItems = navItems.filter((item) =>
    item.label.toLowerCase().includes(query)
  )

  return NextResponse.json(filteredItems, { status: 200 })
} 