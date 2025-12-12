"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileQuestion, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function StudentDashboardPage() {
  // MOCK DATA - Replace with API call: GET /api/students/:id/quizzes
  // Response: { pending: Quiz[], completed: Quiz[] }
  const quizzes = [
    {
      id: 1,
      title: "Maths Quiz: Algebra",
      subject: "Mathematics",
      difficulty: "Hard",
      dueDate: "Due Today",
      questions: 3,
      status: "pending",
    },
  ]

  const pendingQuizzes = quizzes.filter((quiz) => quiz.status === "pending")
  const completedQuizzes = quizzes.filter((quiz) => quiz.status === "completed")

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Dashboard</h1>
            <p className="text-muted-foreground">Student A</p>
          </div>
          <Link href="/">
            <Button variant="outline">Exit</Button>
          </Link>
        </div>

        {/* To-Do Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold">To-Do</h2>
            <Badge variant="destructive">{pendingQuizzes.length}</Badge>
          </div>

          {/* MOCK DATA - List of pending quizzes */}
          <div className="space-y-3">
            {pendingQuizzes.map((quiz) => (
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
                        <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-red-500/20">
                          <Clock className="w-3 h-3 mr-1" />
                          {quiz.dueDate}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {quiz.subject} • {quiz.questions} Questions
                      </p>
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
            ))}
          </div>
        </div>

        {/* Completed Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Completed</h2>
          <div className="space-y-3">
            {completedQuizzes.map((quiz) => (
              <Card key={quiz.id} className="p-6 hover:border-primary transition-colors">
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-chart-2/20 flex items-center justify-center flex-shrink-0">
                      <FileQuestion className="w-6 h-6 text-chart-2" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold">{quiz.title}</h3>
                        <Badge variant="outline">{quiz.difficulty}</Badge>
                        <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                          <Clock className="w-3 h-3 mr-1" />
                          {quiz.dueDate}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {quiz.subject} • {quiz.questions} Questions
                      </p>
                    </div>
                  </div>
                  <Button variant="outline">View Results</Button>
                </div>
              </Card>
            ))}
          </div>
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
  )
}
