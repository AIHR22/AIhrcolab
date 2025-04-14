import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedLearningData() {
  try {
    // Sample courses
    const courses = [
      {
        id: "11111111-1111-1111-1111-111111111111",
        title: "Introduction to Project Management",
        description: "Learn the fundamentals of project management methodologies and best practices",
        level: "Beginner",
        duration_hours: 4,
        category: "Management",
        thumbnail_url: "/placeholder.svg?height=200&width=400",
        created_by: "22222222-2222-2222-2222-222222222222",
        status: "active",
      },
      {
        id: "22222222-2222-2222-2222-222222222222",
        title: "Advanced JavaScript Programming",
        description: "Master advanced JavaScript concepts including closures, promises, and async/await",
        level: "Advanced",
        duration_hours: 8,
        category: "Technology",
        thumbnail_url: "/placeholder.svg?height=200&width=400",
        created_by: "33333333-3333-3333-3333-333333333333",
        status: "active",
      },
      {
        id: "33333333-3333-3333-3333-333333333333",
        title: "Effective Communication Skills",
        description: "Develop essential communication skills for workplace success",
        level: "Intermediate",
        duration_hours: 3,
        category: "Soft Skills",
        thumbnail_url: "/placeholder.svg?height=200&width=400",
        created_by: "22222222-2222-2222-2222-222222222222",
        status: "active",
      },
    ]

    // Insert courses
    console.log("Inserting sample courses...")
    const { error: coursesError } = await supabase.from("courses").insert(courses)

    if (coursesError) throw coursesError

    // Sample course content
    const courseContent = [
      {
        course_id: "11111111-1111-1111-1111-111111111111",
        title: "Introduction to Project Management Concepts",
        content_type: "video",
        content: "https://example.com/videos/intro-pm.mp4",
        order_index: 1,
        duration_minutes: 30,
      },
      {
        course_id: "11111111-1111-1111-1111-111111111111",
        title: "Project Planning Fundamentals",
        content_type: "document",
        content: "Project planning involves several key steps...",
        order_index: 2,
        duration_minutes: 45,
      },
      {
        course_id: "22222222-2222-2222-2222-222222222222",
        title: "Understanding Closures",
        content_type: "video",
        content: "https://example.com/videos/js-closures.mp4",
        order_index: 1,
        duration_minutes: 60,
      },
      {
        course_id: "33333333-3333-3333-3333-333333333333",
        title: "Effective Presentation Skills",
        content_type: "interactive",
        content: "Practice presentation skills with interactive exercises",
        order_index: 1,
        duration_minutes: 45,
      },
    ]

    // Insert course content
    console.log("Inserting sample course content...")
    const { error: contentError } = await supabase.from("course_content").insert(courseContent)

    if (contentError) throw contentError

    // Sample enrollments
    const enrollments = [
      {
        course_id: "11111111-1111-1111-1111-111111111111",
        employee_id: "66666666-6666-6666-6666-666666666666",
        status: "in_progress",
        progress: 45,
      },
      {
        course_id: "11111111-1111-1111-1111-111111111111",
        employee_id: "77777777-7777-7777-7777-777777777777",
        status: "completed",
        progress: 100,
        completion_date: new Date().toISOString(),
      },
      {
        course_id: "22222222-2222-2222-2222-222222222222",
        employee_id: "88888888-8888-8888-8888-888888888888",
        status: "in_progress",
        progress: 65,
      },
    ]

    // Insert enrollments
    console.log("Inserting sample enrollments...")
    const { error: enrollmentsError } = await supabase.from("course_enrollments").insert(enrollments)

    if (enrollmentsError) throw enrollmentsError

    // Sample learning paths
    const learningPaths = [
      {
        id: "11111111-1111-1111-1111-111111111111",
        title: "Full Stack Development Path",
        description: "Complete path to become a full stack developer",
        created_by: "33333333-3333-3333-3333-333333333333",
        status: "active",
      },
      {
        id: "22222222-2222-2222-2222-222222222222",
        title: "Leadership Development Track",
        description: "Essential skills for emerging leaders",
        created_by: "22222222-2222-2222-2222-222222222222",
        status: "active",
      },
    ]

    // Insert learning paths
    console.log("Inserting sample learning paths...")
    const { error: pathsError } = await supabase.from("learning_paths").insert(learningPaths)

    if (pathsError) throw pathsError

    // Sample skills
    const skills = [
      {
        id: "11111111-1111-1111-1111-111111111111",
        name: "Project Management",
        category: "Management",
        description: "Ability to plan, execute, and close projects effectively",
      },
      {
        id: "22222222-2222-2222-2222-222222222222",
        name: "JavaScript",
        category: "Technology",
        description: "Advanced JavaScript programming skills",
      },
      {
        id: "33333333-3333-3333-3333-333333333333",
        name: "Public Speaking",
        category: "Communication",
        description: "Ability to present ideas clearly and effectively",
      },
    ]

    // Insert skills
    console.log("Inserting sample skills...")
    const { error: skillsError } = await supabase.from("skills").insert(skills)

    if (skillsError) throw skillsError

    // Sample course skills mapping
    const courseSkills = [
      {
        course_id: "11111111-1111-1111-1111-111111111111",
        skill_id: "11111111-1111-1111-1111-111111111111",
      },
      {
        course_id: "22222222-2222-2222-2222-222222222222",
        skill_id: "22222222-2222-2222-2222-222222222222",
      },
      {
        course_id: "33333333-3333-3333-3333-333333333333",
        skill_id: "33333333-3333-3333-3333-333333333333",
      },
    ]

    // Insert course skills mapping
    console.log("Inserting sample course skills mapping...")
    const { error: courseSkillsError } = await supabase.from("course_skills").insert(courseSkills)

    if (courseSkillsError) throw courseSkillsError

    console.log("✅ Learning module data seeded successfully")
    return { success: true }
  } catch (error) {
    console.error("Error seeding learning data:", error)
    return { success: false, error }
  }
}

// Run the seeding
seedLearningData().then((result) => {
  if (result.success) {
    console.log("✅ Learning module data seeding completed")
  } else {
    console.error("❌ Learning module data seeding failed:", result.error)
  }
})

