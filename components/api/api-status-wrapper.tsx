"use client"

import dynamic from "next/dynamic"

// Create a placeholder component that will be shown during loading
const APIStatusIndicatorFallback = () => <div className="w-24 h-6 bg-gray-200 animate-pulse rounded-md" />

// Dynamically import the actual component with no SSR
const DynamicAPIStatusIndicator = dynamic(
  () => import("./api-status-indicator-client").then((mod) => mod.APIStatusIndicatorClient),
  {
    ssr: false,
    loading: () => <APIStatusIndicatorFallback />,
  },
)

export function APIStatusWrapper() {
  return <DynamicAPIStatusIndicator />
}

