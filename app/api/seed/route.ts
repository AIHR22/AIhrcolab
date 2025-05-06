import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { seedData } from "@/lib/seed-data"

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Supabase credentials are not configured" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Seed employees
    const { error: employeesError } = await supabase.from("employees").upsert(seedData.employees)

    if (employeesError) {
      console.error("Error seeding employees:", employeesError)
      return NextResponse.json({ error: `Error seeding employees: ${employeesError.message}` }, { status: 500 })
    }

    // Seed job postings
    const { error: jobPostingsError } = await supabase.from("job_postings").upsert(seedData.job_postings)

    if (jobPostingsError) {
      console.error("Error seeding job postings:", jobPostingsError)
      return NextResponse.json({ error: `Error seeding job postings: ${jobPostingsError.message}` }, { status: 500 })
    }

    // Get job posting IDs for candidates
    const { data: jobPostings } = await supabase.from("job_postings").select("id, title")

    // Assign job posting IDs to candidates
    const candidatesWithJobPostings = seedData.candidates.map((candidate, index) => ({
      ...candidate,
      job_posting_id: jobPostings[index % jobPostings.length].id,
    }))

    // Seed candidates
    const { error: candidatesError } = await supabase.from("candidates").upsert(candidatesWithJobPostings)

    if (candidatesError) {
      console.error("Error seeding candidates:", candidatesError)
      return NextResponse.json({ error: `Error seeding candidates: ${candidatesError.message}` }, { status: 500 })
    }

    // Seed onboarding tasks
    const { error: onboardingTasksError } = await supabase.from("onboarding_tasks").upsert(seedData.onboarding_tasks)

    if (onboardingTasksError) {
      console.error("Error seeding onboarding tasks:", onboardingTasksError)
      return NextResponse.json(
        { error: `Error seeding onboarding tasks: ${onboardingTasksError.message}` },
        { status: 500 },
      )
    }

    // Seed benefits
    const { error: benefitsError } = await supabase.from("benefits").upsert(seedData.benefits)

    if (benefitsError) {
      console.error("Error seeding benefits:", benefitsError)
      return NextResponse.json({ error: `Error seeding benefits: ${benefitsError.message}` }, { status: 500 })
    }

    // Seed compliance policies
    const { error: compliancePoliciesError } = await supabase
      .from("compliance_policies")
      .upsert(seedData.compliance_policies)

    if (compliancePoliciesError) {
      console.error("Error seeding compliance policies:", compliancePoliciesError)
      return NextResponse.json(
        { error: `Error seeding compliance policies: ${compliancePoliciesError.message}` },
        { status: 500 },
      )
    }

    // Seed integrations
    const { error: integrationsError } = await supabase.from("integrations").upsert(seedData.integrations)

    if (integrationsError) {
      console.error("Error seeding integrations:", integrationsError)
      return NextResponse.json({ error: `Error seeding integrations: ${integrationsError.message}` }, { status: 500 })
    }

    // Seed chatbot FAQs
    const { error: chatbotFaqsError } = await supabase.from("chatbot_faqs").upsert(seedData.chatbot_faqs)

    if (chatbotFaqsError) {
      console.error("Error seeding chatbot FAQs:", chatbotFaqsError)
      return NextResponse.json({ error: `Error seeding chatbot FAQs: ${chatbotFaqsError.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Database seeded successfully" })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json(
      { error: `Error seeding database: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 },
    )
  }
}

