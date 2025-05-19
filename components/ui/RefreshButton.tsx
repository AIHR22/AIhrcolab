"use client"

import { Button, type ButtonProps } from "@/components/ui/button"
import { RefreshCw, Loader2 }        from "lucide-react"

interface Props extends Omit<ButtonProps, "children"> {
  loading?: boolean
}

export function RefreshButton({
  loading = false,
  onClick,
  ...props
}: Props) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      disabled={loading}
      {...props}
    >
      {loading
        ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        : <RefreshCw className="mr-2 h-4 w-4" />
      }
      {loading ? "Refreshing…" : "Refresh"}
    </Button>
  )
}

