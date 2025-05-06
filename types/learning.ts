export type CourseLevel = "Beginner" | "Intermediate" | "Advanced"

export type CourseStatus = "active" | "draft" | "archived"

export type ContentType = "video" | "document" | "quiz" | "interactive"

export type EnrollmentStatus = "enrolled" | "in_progress" | "completed" | "dropped"

export interface Course {
  id: string
  title: string
  description: string
  level: CourseLevel
  duration_hours: number
  category: string
  thumbnail_url: string
  created_at: string
  updated_at: string
  created_by: string
  status: CourseStatus
}

export interface CourseContent {
  id: string
  course_id: string
  title: string
  content_type: ContentType
  content: string
  order_index: number
  duration_minutes: number
  created_at: string
}

export interface CourseEnrollment {
  id: string
  course_id: string
  employee_id: string
  enrollment_date: string
  completion_date?: string
  status: EnrollmentStatus
  progress: number
}

export interface CourseProgress {
  id: string
  enrollment_id: string
  content_id: string
  completed_at: string
}

export interface LearningPath {
  id: string
  title: string
  description: string
  created_at: string
  created_by: string
  status: CourseStatus
}

export interface LearningPathCourse {
  id: string
  path_id: string
  course_id: string
  order_index: number
}

export interface Certification {
  id: string
  employee_id: string
  course_id: string
  certification_date: string
  expiry_date?: string
  certificate_url: string
  status: CourseStatus
}

export interface Skill {
  id: string
  name: string
  category: string
  description: string
}

export interface CourseSkill {
  id: string
  course_id: string
  skill_id: string
}

export interface EmployeeSkill {
  id: string
  employee_id: string
  skill_id: string
  proficiency_level: number
  acquired_date: string
}

