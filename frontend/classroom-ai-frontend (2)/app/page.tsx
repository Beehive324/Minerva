"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { GraduationCap, BookOpen } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-12">
        {/* Logo and Header */}
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold tracking-tight text-balance">ClassCursor</h1>
          <p className="text-xl text-muted-foreground">AI-Powered Education Platform</p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Teacher Card */}
          <Link href="/teacher/classrooms" className="block group">
            <Card className="p-8 hover:border-primary transition-colors cursor-pointer h-full">
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold">Enter as Teacher</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Create AI-powered quizzes, analyze student performance, and provide personalized feedback
                  </p>
                </div>
                <div className="pt-4">
                  <Button className="w-full" size="lg">
                    Continue as Teacher
                  </Button>
                </div>
              </div>
            </Card>
          </Link>

          {/* Student Card */}
          <Link href="/student/join" className="block group">
            <Card className="p-8 hover:border-primary transition-colors cursor-pointer h-full">
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-xl bg-chart-2/20 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-chart-2" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold">Enter as Student</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Take quizzes, get instant AI feedback, and learn through interactive Socratic dialogue
                  </p>
                </div>
                <div className="pt-4">
                  <Button className="w-full" size="lg" variant="secondary">
                    Continue as Student
                  </Button>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Demo Mode Notice */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm">
            <span className="w-2 h-2 rounded-full bg-chart-1 animate-pulse" />
            <span className="text-muted-foreground">Hackathon Demo Mode - No Authentication Required</span>
          </div>
        </div>
      </div>
    </div>
  )
}
