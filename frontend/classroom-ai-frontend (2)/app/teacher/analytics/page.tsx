"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getQuizAnalytics } from "@/lib/api"

interface StudentResult {
  id: number
  name: string
  status: string
  score: string
  percentage: number
  insight: string
}

export default function AnalyticsPage() {
  const [students, setStudents] = useState<StudentResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await getQuizAnalytics("quiz-id")
        setStudents(data.students)
      } catch (error) {
        console.error("Failed to fetch analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/teacher/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Quiz Analytics</h1>
              <p className="text-muted-foreground">Maths Quiz: Algebra (Hard)</p>
            </div>
          </div>
        </div>

        {/* Student Results Table */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Student Performance</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>AI Insight</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{student.status}</Badge>
                    </TableCell>
                    <TableCell className="font-mono">{student.score}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-chart-2" style={{ width: `${student.percentage}%` }} />
                        </div>
                        <span className="text-sm text-muted-foreground">{student.percentage}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs">{student.insight}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  )
}
