"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Users, FileQuestion, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getTeacherClassrooms } from "@/lib/api"

export default function TeacherClassroomsPage() {
  const [classrooms, setClassrooms] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchClassrooms() {
      try {
        const { classrooms: data } = await getTeacherClassrooms()
        setClassrooms(data)
      } catch (error) {
        console.error("Failed to fetch classrooms:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchClassrooms()
  }, [])

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Classrooms</h1>
            <p className="text-muted-foreground">Manage your AI-powered classrooms</p>
          </div>
          <div className="flex gap-3">
            <Link href="/teacher/setup">
              <Button size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Create New Classroom
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="lg">
                Exit
              </Button>
            </Link>
          </div>
        </div>

        {/* Classrooms Grid */}
        {isLoading ? (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <Users className="w-10 h-10 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Loading...</h2>
                <p className="text-muted-foreground max-w-md">Please wait while we fetch your classrooms.</p>
              </div>
            </div>
          </Card>
        ) : classrooms.length === 0 ? (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <Users className="w-10 h-10 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">No classrooms yet</h2>
                <p className="text-muted-foreground max-w-md">
                  Create your first classroom to start generating AI-powered quizzes
                </p>
              </div>
              <Link href="/teacher/setup">
                <Button size="lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Classroom
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {classrooms.map((classroom) => (
              <Link key={classroom.id} href={`/teacher/dashboard?id=${classroom.id}`}>
                <Card className="p-6 hover:border-primary transition-colors cursor-pointer group">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                          {classroom.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{classroom.subject}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>

                    <div className="flex gap-4 pt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-chart-2/20 flex items-center justify-center">
                          <Users className="w-4 h-4 text-chart-2" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold">{classroom.studentCount}</p>
                          <p className="text-xs text-muted-foreground">Students</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-chart-1/20 flex items-center justify-center">
                          <FileQuestion className="w-4 h-4 text-chart-1" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold">{classroom.activeQuizCount}</p>
                          <p className="text-xs text-muted-foreground">Active Quizzes</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
