"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileQuestion, Clock, ArrowRight, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getClassroomQuizzes } from "@/lib/api"

export default function ClassroomDetailPage() {
  const params = useParams()
  const router = useRouter()
  const classroomId = params.id as string

  const [classroom, setClassroom] = useState<any>(null)
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // MOCK DATA - Replace with API call to get classroom details
        setClassroom({
          id: classroomId,
          name: "Mathematics",
          subject: "Algebra & Calculus",
          teacherName: "Mr. Smith",
        })

        const { quizzes: data } = await getClassroomQuizzes(classroomId)
        setQuizzes(data.map((quiz) => ({ ...quiz, status: "pending" })))
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [classroomId])

  const pendingQuizzes = quizzes.filter((quiz) => quiz.status === "pending")
  const completedQuizzes = quizzes.filter((quiz) => quiz.status === "completed")

  if (isLoading) {
    return <div className="min-h-screen bg-background p-6 flex items-center justify-center">Loading...</div>
  }

  if (!classroom) {
    return <div className="min-h-screen bg-background p-6 flex items-center justify-center">Classroom not found</div>
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => router.push("/student/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Classrooms
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{classroom.name}</h1>
              <p className="text-muted-foreground">
                {classroom.subject} • {classroom.teacherName}
              </p>
            </div>
          </div>
        </div>

        {/* To-Do Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold">To-Do</h2>
            <Badge variant="destructive">{pendingQuizzes.length}</Badge>
          </div>

          <div className="space-y-3">
            {pendingQuizzes.length === 0 ? (
              <Card className="p-12">
                <div className="text-center text-muted-foreground">
                  <p>No pending assignments</p>
                </div>
              </Card>
            ) : (
              pendingQuizzes.map((quiz) => (
                <Card key={quiz.id} className="p-6 hover:border-primary transition-colors">
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-chart-1/20 flex items-center justify-center flex-shrink-0">
                        <FileQuestion className="w-6 h-6 text-chart-1" />
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-semibold">{quiz.title}</h3>
                          <Badge variant="outline">{quiz.difficulty}</Badge>
                          {quiz.dueDate && (
                            <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-red-500/20">
                              <Clock className="w-3 h-3 mr-1" />
                              {quiz.dueDate}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{quiz.questionCount} Questions</p>
                      </div>
                    </div>
                    <Link href="/student/quiz">
                      <Button>
                        Start Quiz
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Completed Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Completed</h2>
          <div className="space-y-3">
            {completedQuizzes.length === 0 && (
              <Card className="p-12">
                <div className="text-center text-muted-foreground">
                  <p>No completed assignments yet</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
