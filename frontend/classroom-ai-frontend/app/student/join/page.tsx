"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function StudentJoinPage() {
  const [classCode, setClassCode] = useState("")
  const [studentName, setStudentName] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleJoin = async () => {
    setError("")
    const res = await fetch("http://localhost:8000/api/classrooms/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: classCode, studentName }),
    })
    const data = await res.json()
    if (data.success && data.classroomId) {
      localStorage.setItem("studentClassroomId", data.classroomId)
      router.push("/student/dashboard")
    } else {
      setError(data.error || "Failed to join classroom")
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="max-w-md w-full space-y-6 p-8 bg-black rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Join a Classroom</h1>
        <Input
          placeholder="Class Code (e.g., JOIN-12345)"
          value={classCode}
          onChange={e => setClassCode(e.target.value)}
        />
        <Input
          placeholder="Your Name"
          value={studentName}
          onChange={e => setStudentName(e.target.value)}
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <Button className="w-full" onClick={handleJoin} disabled={!classCode || !studentName}>
          Join Classroom
        </Button>
      </div>
    </div>
  )
}
