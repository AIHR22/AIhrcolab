"use client"

import { useState, useEffect, useRef } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface SearchResult {
  title: string
  path: string
  type: "page" | "section"
}

const searchableItems: SearchResult[] = [
  { title: "Dashboard", path: "/dashboard", type: "page" },
  { title: "Employees", path: "/employees", type: "page" },
  { title: "Organization", path: "/organization", type: "page" },
  { title: "Payroll", path: "/payroll", type: "page" },
  { title: "Workforce Planning", path: "/workforce-planning", type: "page" },
  { title: "Strategic Growth", path: "/strategic-growth", type: "page" },
  { title: "Revenue Forecasting", path: "/revenue", type: "page" },
  { title: "Reports", path: "/reports", type: "page" },
  { title: "Settings", path: "/settings", type: "page" },
  { title: "Workforce Growth Trends", path: "workforce-growth", type: "section" },
  { title: "Workforce Allocation", path: "workforce-allocation", type: "section" },
]

export function SearchBar() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (!query) {
      setResults([])
      setShowDropdown(false)
      return
    }

    setIsLoading(true)
    const timer = setTimeout(() => {
      const matchedResults = searchableItems.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 1) // Limit to 1 result

      setResults(matchedResults)
      setShowDropdown(true)
      setIsLoading(false)
    }, 300) // 300ms delay

    return () => clearTimeout(timer)
  }, [query])

  const handleResultClick = (result: SearchResult) => {
    if (result.type === "section") {
      const element = document.getElementById(result.path)
      element?.scrollIntoView({ behavior: "smooth" })
    } else {
      window.location.href = result.path
    }
    setShowDropdown(false)
    setQuery("")
  }

  return (
    <div ref={searchRef} className="relative w-full">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search..."
        className="pl-8 w-full"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {showDropdown && (
        <div className="absolute w-full mt-1 bg-background border rounded-md shadow-lg z-50">
          {isLoading ? (
            <div className="p-2 text-sm text-muted-foreground">Searching...</div>
          ) : results.length > 0 ? (
            <div className="py-1">
              {results.map((result) => (
                <button
                  key={result.path}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm hover:bg-accent",
                    "flex items-center justify-between"
                  )}
                  onClick={() => handleResultClick(result)}
                >
                  <span>{result.title}</span>
                  {result.type === "page" && (
                    <span className="text-muted-foreground">→</span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-2 text-sm text-muted-foreground">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  )
}
