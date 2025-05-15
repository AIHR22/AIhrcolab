"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function ManageSkills() {
  const [loading, setLoading] = useState<boolean>(false)
  const [skills, setSkills] = useState<any[]>([])
  const [name, setName] = useState<string>("")
  const [category, setCategory] = useState<string>("General")
  const [description, setDescription] = useState<string>("")

  // Fetch skills when the component mounts
  useEffect(() => {
    fetchSkills()
  }, [])

  const fetchSkills = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/skills')
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          setSkills(data)
        } else if (data.skills && Array.isArray(data.skills)) {
          setSkills(data.skills)
        } else {
          console.error("Unexpected skills data format:", data)
          setSkills([])
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch skills",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error fetching skills:", error)
      toast({
        title: "Error",
        description: "An error occurred while fetching skills",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Skill name is required",
        variant: "destructive"
      })
      return
    }
    
    try {
      setLoading(true)
      const response = await fetch('/api/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          category,
          description
        }),
      })
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Skill added successfully",
        })
        
        // Reset form
        setName("")
        setCategory("General")
        setDescription("")
        
        // Refresh skills list
        fetchSkills()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to add skill",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error adding skill:", error)
      toast({
        title: "Error",
        description: "An error occurred while adding the skill",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    "General",
    "Frontend",
    "Backend",
    "Design",
    "DevOps",
    "Management",
    "Data Science",
    "Mobile",
    "QA"
  ]

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Manage Skills</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add New Skill</CardTitle>
            <CardDescription>
              Add a new skill that employees can have or projects can require
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddSkill} className="space-y-4">
              <div>
                <Label htmlFor="name">Skill Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. React, JavaScript, UI Design"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={category}
                  onValueChange={setCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description of the skill"
                  rows={3}
                />
              </div>
              
              <Button type="submit" disabled={loading || !name.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Skill"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Skills List</CardTitle>
            <CardDescription>
              Current skills available in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : skills.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No skills found. Add some skills to get started.
              </div>
            ) : (
              <div className="overflow-auto max-h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {skills.map((skill) => (
                      <TableRow key={skill.id}>
                        <TableCell className="font-medium">{skill.name}</TableCell>
                        <TableCell>{skill.category || "General"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            
            <div className="mt-4">
              <Button variant="outline" onClick={fetchSkills} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  "Refresh List"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 