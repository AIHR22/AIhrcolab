"use client"

import { useState } from "react"
import { FileText, Download, Eye, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Document = {
  id: string
  name: string
  category: string
  lastUpdated: string
  status: "active" | "archived" | "draft"
}

const documents: Document[] = [
  {
    id: "1",
    name: "Employee Handbook 2023",
    category: "Policies",
    lastUpdated: "2023-06-15",
    status: "active",
  },
  {
    id: "2",
    name: "Data Protection Policy",
    category: "Compliance",
    lastUpdated: "2023-05-22",
    status: "active",
  },
  {
    id: "3",
    name: "Remote Work Guidelines",
    category: "Policies",
    lastUpdated: "2023-04-10",
    status: "active",
  },
  {
    id: "4",
    name: "Anti-Harassment Policy",
    category: "Compliance",
    lastUpdated: "2023-03-05",
    status: "active",
  },
  {
    id: "5",
    name: "Benefits Overview 2024",
    category: "Benefits",
    lastUpdated: "2023-07-01",
    status: "draft",
  },
  {
    id: "6",
    name: "Onboarding Checklist",
    category: "Procedures",
    lastUpdated: "2023-02-18",
    status: "active",
  },
  {
    id: "7",
    name: "Travel Expense Policy",
    category: "Policies",
    lastUpdated: "2022-11-30",
    status: "archived",
  },
]

export function ComplianceDocuments() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: Document["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "archived":
        return "bg-gray-500"
      case "draft":
        return "bg-yellow-500"
      default:
        return "bg-blue-500"
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search documents..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredDocuments.map((doc) => (
          <Card key={doc.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <FileText className="h-10 w-10 text-blue-500" />
                  <div>
                    <h3 className="font-medium">{doc.name}</h3>
                    <div className="mt-1 flex items-center space-x-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{doc.category}</Badge>
                      <span>Updated: {new Date(doc.lastUpdated).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <Badge className={getStatusColor(doc.status)}>
                  {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                </Badge>
              </div>
              <div className="mt-4 flex space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="mr-1 h-4 w-4" />
                  View
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-1 h-4 w-4" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
          <p className="text-muted-foreground">No documents found</p>
        </div>
      )}
    </div>
  )
}

