"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function TimeOffCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  // This is a placeholder. In a real implementation, you would fetch this data from your API
  const mockTimeOffData = {
    "2023-03-15": [{ id: "1", employeeName: "John Doe", type: "vacation" }],
    "2023-03-16": [{ id: "2", employeeName: "Jane Smith", type: "sick" }],
    "2023-03-17": [
      { id: "3", employeeName: "Alice Johnson", type: "personal" },
      { id: "4", employeeName: "Bob Brown", type: "vacation" },
    ],
  }

  // Function to get requests for the selected date
  const getSelectedDateRequests = () => {
    if (!selectedDate) return []

    const dateStr = selectedDate.toISOString().split("T")[0]
    return mockTimeOffData[dateStr as keyof typeof mockTimeOffData] || []
  }

  // Function to determine if a date has time off requests
  const dateHasTimeOff = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return !!mockTimeOffData[dateStr as keyof typeof mockTimeOffData]?.length
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Time Off Calendar</CardTitle>
          <CardDescription>View employee time off</CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            modifiers={{
              hasTimeOff: (date) => dateHasTimeOff(date),
            }}
            modifiersClassNames={{
              hasTimeOff: "bg-primary/10 font-medium",
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDate ? <>Time Off: {selectedDate.toLocaleDateString()}</> : <>Select a Date</>}
          </CardTitle>
          <CardDescription>
            {selectedDate ? <>Employees with time off on this date</> : <>Click on a date to see details</>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {getSelectedDateRequests().length > 0 ? (
              getSelectedDateRequests().map((request) => (
                <div key={request.id} className="p-3 border rounded-md">
                  <div className="font-medium">{request.employeeName}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {request.type.charAt(0).toUpperCase() + request.type.slice(1)} leave
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">No time off requests for this date</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

