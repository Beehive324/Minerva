"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Users, FileQuestion, Plus, Copy } from "lucide-react"
import Link from "next/link"
import { QuizGeneratorModal } from "@/components/quiz-generator-modal"

export default function TeacherDashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [classroomId, setClassroomId] = useState<number | null>(null)
  const [classroom, setClassroom] = useState<any>(null)
  const [quizzes, setQuizzes] = useState<any[]>([])

  useEffect(() => {
    // Try to get classroomId from localStorage or URL (for demo, use localStorage)
    const storedId = localStorage.getItem('classroomId')
    if (storedId) {
      setClassroomId(Number(storedId))
    }
  }, [])

  useEffect(() => {
    if (classroomId) {
      fetch(`http://localhost:8000/api/classrooms/${classroomId}`)
        .then((res) => res.json())
        .then((data) => setClassroom(data))
    }
  }, [classroomId])

  useEffect(() => {
    if (classroomId) {
      fetch(`http://localhost:8000/api/classrooms/${classroomId}/assignments`)
        .then((res) => res.json())
        .then((data) => setQuizzes(data.assignments || []))
    }
  }, [classroomId])

  // Response: { classCode: string, studentCount: number, activeQuizCount: number, className: string }
  const classCode = classroom?.classCode || "-"
  const studentCount = classroom?.studentCount || 0
  const activeQuizCount = classroom?.activeQuizCount || 0
  const className = classroom?.className || "-"

  const copyClassCode = () => {
    navigator.clipboard.writeText(classCode)
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
            <p className="text-muted-foreground">{className}</p>
          </div>
          <Link href="/">
            <Button variant="outline">Exit</Button>
          </Link>
        </div>

        {/* Stats Bar */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-chart-2/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold">{studentCount}</p>
                <p className="text-sm text-muted-foreground">Students</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-chart-1/20 flex items-center justify-center">
                <FileQuestion className="w-5 h-5 text-chart-1" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeQuizCount}</p>
                <p className="text-sm text-muted-foreground">Active Quizzes</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Class Code</p>
                <p className="text-xl font-bold font-mono">{classCode}</p>
              </div>
              <Button size="icon" variant="ghost" onClick={copyClassCode}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="p-12">
          {quizzes.length > 0 ? (
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Quizzes for this Classroom</h2>
                <Button size="lg" onClick={() => setIsModalOpen(true)}>
                  <Plus className="w-5 h-5 mr-2" />
                  Generate New Quiz
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {quizzes.map((quiz) => (
                  <Card key={quiz.id} className="p-6 flex flex-col gap-2">
                    <div className="flex items-center gap-2 mb-2">
                      <FileQuestion className="w-5 h-5 text-chart-1" />
                      <span className="font-bold text-lg">{quiz.title}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mb-1">Subject: {quiz.subject}</div>
                    <div className="text-sm text-muted-foreground mb-1">Due: {quiz.dueDate}</div>
                    <div className="text-sm text-muted-foreground mb-1">Difficulty: {quiz.difficulty}</div>
                    <div className="text-sm text-muted-foreground mb-1">Questions: {quiz.questions}</div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <FileQuestion className="w-10 h-10 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">No quizzes active</h2>
                <p className="text-muted-foreground max-w-md">
                  Generate your first AI-powered quiz to get started with personalized learning
                </p>
              </div>
              <Button size="lg" onClick={() => setIsModalOpen(true)}>
                <Plus className="w-5 h-5 mr-2" />
                Generate New Quiz
              </Button>
            </div>
          )}
        </Card>
      </div>

      <QuizGeneratorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
