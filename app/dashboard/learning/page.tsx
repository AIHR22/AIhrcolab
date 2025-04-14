import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Courses } from "@/components/learning/courses"
import { LearningPaths } from "@/components/learning/learning-paths"
import { Certifications } from "@/components/learning/certifications"
import { SkillsGap } from "@/components/learning/skills-gap"

export default function LearningPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Learning & Development</h2>
          <p className="text-muted-foreground">Manage employee learning and development activities</p>
        </div>
      </div>
      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="learning-paths">Learning Paths</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="skills-gap">Skills Gap</TabsTrigger>
        </TabsList>
        <TabsContent value="courses" className="space-y-4">
          <Courses />
        </TabsContent>
        <TabsContent value="learning-paths" className="space-y-4">
          <LearningPaths />
        </TabsContent>
        <TabsContent value="certifications" className="space-y-4">
          <Certifications />
        </TabsContent>
        <TabsContent value="skills-gap" className="space-y-4">
          <SkillsGap />
        </TabsContent>
      </Tabs>
    </div>
  )
}

