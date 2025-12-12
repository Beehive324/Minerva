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

export default function TeacherSetupPage() {
  const router = useRouter()
  const [classroomName, setClassroomName] = useState("")
  const [subject, setSubject] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [topics, setTopics] = useState<string[]>([])
  const [learningObjectives, setLearningObjectives] = useState<string[]>([])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setIsProcessing(true)

      // Send PDF to backend
      const formData = new FormData()
      formData.append('file', selectedFile)
      try {
        const res = await fetch('http://localhost:8000/api/upload/curriculum', {
          method: 'POST',
          body: formData,
        })
        if (!res.ok) throw new Error('Upload failed')
        const data = await res.json()
        setTopics(data.topics || [])
        setLearningObjectives(data.learningObjectives || [])
      } catch (err) {
        // Handle error (show message, etc.)
        setTopics([])
        setLearningObjectives([])
      }
      setIsProcessing(false)
    }
  }

  const handleCreateClassroom = async () => {
    // API call - POST /api/classrooms
    // Body: { name: classroomName, code: '', pdf_filename: file?.name, teacherId: '1' }
    // Response: { classroomId: string, classCode: string, success: boolean }
    try {
      const res = await fetch('http://localhost:8000/api/classrooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: classroomName,
          code: '', // You can generate or leave blank for backend to generate
          pdf_filename: file ? file.name : '',
          teacherId: '1', // Replace with actual teacher ID if available
        }),
      })
      if (!res.ok) throw new Error('Failed to create classroom')
      const data = await res.json()
      if (data.classroomId) {
        localStorage.setItem('classroomId', data.classroomId)
      }
      router.push('/teacher/dashboard')
    } catch (err) {
      // Handle error (show message, etc.)
      alert('Failed to create classroom')
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/">
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

          {/* Processing State */}
          {isProcessing && (
            <LoadingState
              message="AI Agent analyzing curriculum structure..."
              submessage="Extracting topics and learning objectives"
            />
          )}

          {/* Topic Preview */}
          {topics.length > 0 && !isProcessing && (
            <div className="space-y-3">
              <Label>Detected Topics</Label>
              {/* MOCK DATA - AI extracted topics from curriculum PDF */}
              <div className="grid gap-2">
                {topics.map((topic, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium">{topic}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Learning Objectives Preview */}
          {learningObjectives.length > 0 && !isProcessing && (
            <div className="space-y-3">
              <Label>Learning Objectives</Label>
              {/* MOCK DATA - AI extracted learning objectives from curriculum PDF */}
              <div className="grid gap-2">
                {learningObjectives.map((objective, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium">{objective}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <Button
            className="w-full"
            size="lg"
            disabled={!classroomName || !subject || topics.length === 0}
            onClick={handleCreateClassroom}
          >
            Approve & Create Classroom
          </Button>
        </Card>
      </div>
    </div>
  )
}
