import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const vacancies = [
  {
    id: 1,
    title: "Senior Software Engineer",
    department: "Engineering",
    location: "Remote",
    applicants: 24,
  },
  {
    id: 2,
    title: "Product Manager",
    department: "Product",
    location: "New York, NY",
    applicants: 18,
  },
  {
    id: 3,
    title: "UX Designer",
    department: "Design",
    location: "San Francisco, CA",
    applicants: 15,
  },
  {
    id: 4,
    title: "Marketing Specialist",
    department: "Marketing",
    location: "Remote",
    applicants: 12,
  },
  {
    id: 5,
    title: "HR Coordinator",
    department: "Human Resources",
    location: "Chicago, IL",
    applicants: 8,
  },
]

export function VacancyList() {
  return (
    <div className="space-y-4">
      {vacancies.map((vacancy) => (
        <div key={vacancy.id} className="flex flex-col gap-2 rounded-md border p-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{vacancy.title}</h3>
            <Badge>{vacancy.applicants} applicants</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{vacancy.department}</span>
            <span>•</span>
            <span>{vacancy.location}</span>
          </div>
          <Button variant="outline" size="sm" className="mt-1">
            View Details
          </Button>
        </div>
      ))}
    </div>
  )
}

