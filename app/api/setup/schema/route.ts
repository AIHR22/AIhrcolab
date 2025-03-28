import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Create tables using the Supabase REST API
    const response = await fetch("/api/setup/create-tables", {
      method: "POST",
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json({ success: false, error: error.message }, { status: response.status })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in schema setup:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

