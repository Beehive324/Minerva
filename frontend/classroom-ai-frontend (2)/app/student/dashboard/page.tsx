"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Plus } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getStudentClassrooms } from "@/lib/api"

export default function StudentDashboardPage() {
  const router = useRouter()
  const [classrooms, setClassrooms] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchClassrooms() {
      try {
        const { classrooms: data } = await getStudentClassrooms()
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
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Classrooms</h1>
            <p className="text-muted-foreground">Select a classroom to view assignments</p>
          </div>
          <Link href="/">
            <Button variant="outline">Exit</Button>
          </Link>
        </div>

        {/* Classroom List */}
        <div className="space-y-3">
          {isLoading ? (
            <p>Loading classrooms...</p>
          ) : (
            classrooms.map((classroom) => (
              <Card key={classroom.id} className="p-6 hover:border-primary transition-colors cursor-pointer">
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-chart-1/20 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-chart-1" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{classroom.name}</h3>
                        {classroom.todoCount > 0 && <Badge variant="destructive">{classroom.todoCount} To-Do</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {classroom.subject} • {classroom.teacherName}
                      </p>
                    </div>
                  </div>
                  <Link href={`/student/classroom/${classroom.id}`}>
                    <Button>View Classroom</Button>
                  </Link>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Join Another Classroom Button */}
        <Card className="p-6 border-dashed hover:border-primary transition-colors cursor-pointer">
          <Link href="/student/join">
            <div className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground">
              <Plus className="w-5 h-5" />
              <span className="font-medium">Join Another Classroom</span>
            </div>
          </Link>
        </Card>
      </div>
    </div>
  )
}
