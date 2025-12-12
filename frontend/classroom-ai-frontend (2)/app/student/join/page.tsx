"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Users, ArrowRight, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { joinClassroom } from "@/lib/api"

export default function JoinClassroomPage() {
  const router = useRouter()
  const [classCode, setClassCode] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState("")

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!classCode.trim()) {
      setError("Please enter a classroom code")
      return
    }

    setIsJoining(true)

    try {
      const { classroom } = await joinClassroom(classCode)
      localStorage.setItem("classroomId", classroom.id)
      router.push("/student/dashboard")
    } catch (error) {
      setError("Invalid classroom code. Please check and try again.")
      setIsJoining(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-xl bg-chart-2/20 flex items-center justify-center mx-auto">
              <Users className="w-8 h-8 text-chart-2" />
            </div>
            <h1 className="text-2xl font-bold">Join Classroom</h1>
            <p className="text-muted-foreground">Enter the classroom code provided by your teacher</p>
          </div>

          {/* Join Form */}
          <form onSubmit={handleJoinClass} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="classCode">Classroom Code</Label>
              <Input
                id="classCode"
                placeholder="Enter 6-digit code"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                maxLength={6}
                disabled={isJoining}
                className="font-mono text-lg tracking-wider"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={isJoining || !classCode.trim()}>
              {isJoining ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Joining Classroom...
                </>
              ) : (
                <>
                  Join Classroom
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Back Link */}
          <div className="text-center">
            <Button variant="ghost" onClick={() => router.push("/")} disabled={isJoining}>
              Back to Home
            </Button>
          </div>

          {/* Demo Hint */}
          <div className="p-3 rounded-lg bg-muted text-center">
            <p className="text-xs text-muted-foreground">Demo Mode: Any code with 4+ characters will work</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
