"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, TrendingDown, Lightbulb } from "lucide-react"
import Link from "next/link"

export default function AnalyticsPage() {
  // MOCK DATA - Replace with API call: GET /api/quizzes/:id/analytics
  // Response: { summary: string, insights: Array<Insight>, students: Array<StudentResult> }
  const students = [
    {
      id: 1,
      name: "Student A",
      status: "Submitted",
      score: "1/3",
      percentage: 33,
      insight: "Struggled with Quadratics",
    },
    {
      id: 2,
      name: "Student B",
      status: "Submitted",
      score: "2/3",
      percentage: 67,
      insight: "Strong on basics, needs advanced practice",
    },
  ]

  const aiSummary =
    "Class average is low on Algebra. Suggested remediation: Review Section 2.1 - Quadratic Equations and provide additional practice on factorization methods. Consider one-on-one support for Student A."

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

        {/* AI Summary Card */}
        <Card className="p-6 bg-gradient-to-br from-chart-1/10 to-chart-1/5 border-chart-1/20">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-chart-1/20 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-5 h-5 text-chart-1" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">AI Class Summary</h3>
              {/* MOCK DATA - AI generated class insights */}
              <p className="text-foreground/90 leading-relaxed">{aiSummary}</p>
              <div className="flex items-center gap-2 pt-2">
                <Badge variant="secondary" className="bg-background/50">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  Below Target: 50%
                </Badge>
                <Badge variant="secondary" className="bg-background/50">
                  Focus Area: Quadratics
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Student Results Table */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Student Performance</h2>
            {/* MOCK DATA - Student performance data */}
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
