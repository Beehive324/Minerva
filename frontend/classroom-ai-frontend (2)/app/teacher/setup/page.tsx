"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingState } from "@/components/loading-state"
import { Upload, CheckCircle2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClassroom } from "@/lib/api"

export default function TeacherSetupPage() {
  const router = useRouter()
  const [classroomName, setClassroomName] = useState("")
  const [subject, setSubject] = useState("")
  const [classCode, setClassCode] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  }

  const handleCreateClassroom = async () => {
    if (!file) return;
    try {
      await createClassroom({
        name: classroomName,
        subject,
        classCode,
        curriculum: file,
        topics: [],
      });
      router.push("/teacher/classrooms");
    } catch (error) {
      console.error("Failed to create classroom:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/teacher/classrooms">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Classroom Setup</h1>
            <p className="text-muted-foreground">Configure your AI-powered classroom</p>
          </div>
        </div>

        {/* Setup Form */}
        <Card className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="classroom-name">Classroom Name</Label>
              <Input
                id="classroom-name"
                placeholder="e.g., Year 11 Maths"
                value={classroomName}
                onChange={(e) => setClassroomName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g., Mathematics"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="class-code">Class Code</Label>
              <Input
                id="class-code"
                placeholder="e.g., MATH2025"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">Students will use this code to join your classroom</p>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Upload Specification PDF</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <input type="file" id="file-upload" className="hidden" accept=".pdf" onChange={handleFileChange} />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{file ? file.name : "Click to upload or drag and drop"}</p>
                    <p className="text-xs text-muted-foreground">PDF curriculum specification (e.g., Edexcel 2025)</p>
                  </div>
                </div>
              </label>
            </div>
          </div>


          {/* Action Button */}
          <Button
            className="w-full"
            size="lg"
            disabled={!classroomName || !subject || !classCode}
            onClick={handleCreateClassroom}
          >
            Approve & Create Classroom
          </Button>
        </Card>
      </div>
    </div>
  )
}
