"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Users, FileQuestion, Plus, Copy } from "lucide-react"
import Link from "next/link"
import { QuizGeneratorModal } from "@/components/quiz-generator-modal"

export default function TeacherDashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // MOCK DATA - Replace with API call: GET /api/classrooms/:id
  // Response: { classCode: string, studentCount: number, activeQuizCount: number, className: string }
  const classCode = "JOIN-1234"
  const studentCount = 2
  const activeQuizCount = 0
  const className = "Year 11 Maths"

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
        </Card>
      </div>

      <QuizGeneratorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
