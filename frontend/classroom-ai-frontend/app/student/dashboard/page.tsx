"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileQuestion, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function StudentDashboardPage() {
  const [assignments, setAssignments] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  const [studentId, setStudentId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const classroomId = localStorage.getItem("studentClassroomId")
    const sid = localStorage.getItem("studentId")
    setStudentId(sid)
    if (classroomId) {
      fetch(`http://localhost:8000/api/classrooms/${classroomId}/assignments`)
        .then((res) => res.json())
        .then((data) => setAssignments(data.assignments || []))
    }
    if (sid) {
      fetch(`http://localhost:8000/api/students/${sid}/submissions`)
        .then((res) => res.json())
        .then((data) => setSubmissions(data.submissions || []));
    }
  }, [])

  // Map assignmentId to completed status (just check for any submission, regardless of status)
  const completedAssignmentIds = new Set(
    submissions.map((s) => String(s.assignmentId))
  )

  const activeAssignments = assignments.filter((a) => !completedAssignmentIds.has(String(a.id)))
  const completedAssignments = assignments.filter((a) => completedAssignmentIds.has(String(a.id)))

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Dashboard</h1>
            <p className="text-muted-foreground">Student A</p>
          </div>
          <div className="flex gap-2">
            <Link href="/student/join">
              <Button variant="primary">Join Classroom</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Exit</Button>
            </Link>
          </div>
        </div>

        {/* Quizzes Section (Active Assignments) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold">Quizzes</h2>
            <Badge variant="destructive">{activeAssignments.length}</Badge>
          </div>
          <div className="space-y-3">
            {activeAssignments.length === 0 && (
              <Card className="p-12">
                <div className="text-center text-muted-foreground">
                  <p>No quizzes yet</p>
                </div>
              </Card>
            )}
            {activeAssignments.map((assignment) => {
              // Find submission for this assignment (if any)
              const submission = submissions.find((s) => String(s.assignmentId) === String(assignment.id))
              return (
                <Card key={assignment.id} className="p-6 hover:border-primary transition-colors">
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-chart-1/20 flex items-center justify-center flex-shrink-0">
                        <FileQuestion className="w-6 h-6 text-chart-1" />
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-semibold">{assignment.title}</h3>
                          <Badge variant="outline">{assignment.difficulty}</Badge>
                          <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-red-500/20">
                            <Clock className="w-3 h-3 mr-1" />
                            {assignment.dueDate}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {assignment.subject} • {assignment.questions} Questions
                        </p>
                      </div>
                    </div>
                    {submission ? (
                      <Button variant="outline" onClick={() => router.push(`/student/results?submissionId=${submission.submissionId}`)}>
                        View Results
                      </Button>
                    ) : (
                      <Button onClick={() => router.push(`/student/quiz?assignmentId=${assignment.id}`)}>
                        Start Quiz
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Completed Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Completed</h2>
          <div className="space-y-3">
            {completedAssignments.map((assignment) => (
              <Card key={assignment.id} className="p-6 hover:border-primary transition-colors">
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-chart-2/20 flex items-center justify-center flex-shrink-0">
                      <FileQuestion className="w-6 h-6 text-chart-2" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold">{assignment.title}</h3>
                        <Badge variant="outline">{assignment.difficulty}</Badge>
                        <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                          <Clock className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {assignment.subject} • {assignment.questions} Questions
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => router.push(`/student/results?assignmentId=${assignment.id}`)}>
                    View Results
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          {completedAssignments.length === 0 && (
            <Card className="p-12">
              <div className="text-center text-muted-foreground">
                <p>No completed assignments yet</p>
              </div>
            </Card>
          )}
        </div>

        {/* To-Do Section (removed) */}
      </div>
    </div>
  )
}
