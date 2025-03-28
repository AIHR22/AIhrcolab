import useSWR from "swr"
import type { Course } from "@/types/learning"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useCourses() {
  const { data, error, isLoading, mutate } = useSWR<Course[]>("/api/courses", fetcher)

  return {
    courses: data,
    isLoading,
    error,
    mutate,
  }
}

