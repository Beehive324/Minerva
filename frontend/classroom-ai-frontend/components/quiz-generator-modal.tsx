"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { LoadingState } from "@/components/loading-state"
import { Sparkles, CheckCircle2, X } from "lucide-react"
import { useRouter } from "next/navigation"

interface QuizGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
}

export function QuizGeneratorModal({ isOpen, onClose }: QuizGeneratorModalProps) {
  const router = useRouter()
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [currentTopic, setCurrentTopic] = useState("")
  const [numQuestions, setNumQuestions] = useState([3])
  const [difficulty, setDifficulty] = useState("medium")
  const [strictAlign, setStrictAlign] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewQuestions, setPreviewQuestions] = useState<any[]>([])
  const [isPreviewing, setIsPreviewing] = useState(false)

  // MOCK DATA - Replace with API call: GET /api/classrooms/:id/topics
  const availableTopics = ["Algebra", "Geometry", "Statistics", "Trigonometry", "Calculus Basics"]

  const handleAddTopic = () => {
    if (currentTopic && !selectedTopics.includes(currentTopic)) {
      setSelectedTopics([...selectedTopics, currentTopic])
      setCurrentTopic("")
    }
  }

  const handleRemoveTopic = (topicToRemove: string) => {
    setSelectedTopics(selectedTopics.filter((t) => t !== topicToRemove))
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setPreviewQuestions([])
    setIsPreviewing(true)
    try {
      const res = await fetch("http://localhost:8000/api/generate-quiz-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdf_filename: "mock.pdf", // Replace with actual filename if available
          title: selectedTopics.join(", ") || "AI Generated Quiz",
          subject: selectedTopics[0] || "Mathematics",
          difficulty,
        }),
      })
      const data = await res.json()
      setPreviewQuestions(
        (data.questions || []).map((q: any, idx: number) => ({
          ...q,
          id: idx + 1,
          type: q.options ? "mcq" : "written",
        }))
      )
    } catch (err) {
      setPreviewQuestions([])
    }
    setIsGenerating(false)
  }

  const handlePublish = async () => {
    setIsGenerating(true)
    // Store the previewed questions in the backend as the assignment
    const classroomId = localStorage.getItem('classroomId')
    if (!classroomId) return
    await fetch(`http://localhost:8000/api/classrooms/${classroomId}/generate-quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: selectedTopics.join(", ") || "AI Generated Quiz",
        subject: selectedTopics[0] || "Mathematics",
        difficulty,
        due_date: 'Due Soon',
        questions: previewQuestions.length,
        previewQuestions // pass the previewed questions to backend
      })
    })
    setIsGenerating(false)
    setIsPreviewing(false)
    setPreviewQuestions([])
    onClose()
    router.push("/teacher/analytics")
  }

  const handleCancelPreview = () => {
    setPreviewQuestions([])
    setIsPreviewing(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-chart-1" />
            Generate AI Quiz
          </DialogTitle>
          <DialogDescription>
            Configure your quiz parameters and let AI generate questions aligned to your curriculum
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Configuration */}
          {!isGenerating && previewQuestions.length === 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Topics</Label>
                <div className="flex gap-2">
                  <Select value={currentTopic} onValueChange={setCurrentTopic}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Choose topics" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTopics.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddTopic} disabled={!currentTopic}>
                    Add
                  </Button>
                </div>

                {/* Selected Topics Display */}
                {selectedTopics.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-muted">
                    {selectedTopics.map((topic) => (
                      <Badge key={topic} variant="secondary" className="pl-3 pr-1 py-1">
                        {topic}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-2 hover:bg-transparent"
                          onClick={() => handleRemoveTopic(topic)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Number of Questions</Label>
                  <span className="text-sm text-muted-foreground">{numQuestions[0]}</span>
                </div>
                <Slider
                  value={numQuestions}
                  onValueChange={setNumQuestions}
                  min={1}
                  max={10}
                  step={1}
                  className="py-4"
                />
                <p className="text-xs text-muted-foreground">Demo locked to 3 questions for hackathon</p>
              </div>

              <div className="space-y-2">
                <Label>Difficulty</Label>
                <div className="flex gap-2">
                  {["easy", "medium", "hard"].map((level) => (
                    <Button
                      key={level}
                      variant={difficulty === level ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setDifficulty(level)}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="space-y-0.5">
                  <Label className="text-base">Strictly align to specification</Label>
                  <p className="text-sm text-muted-foreground">Questions will reference uploaded PDF curriculum</p>
                </div>
                <Switch checked={strictAlign} onCheckedChange={setStrictAlign} />
              </div>

              <Button className="w-full" size="lg" onClick={handleGenerate} disabled={selectedTopics.length === 0}>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate with AI
              </Button>
            </div>
          )}

          {/* Generating State */}
          {isGenerating && (
            <LoadingState
              message="Consulting Syllabus..."
              submessage="Crafting questions aligned to curriculum standards"
            />
          )}

          {/* Preview Questions */}
          {!isGenerating && previewQuestions.length > 0 && isPreviewing && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg">Generated Questions Preview</Label>
                <Badge variant="secondary">{previewQuestions.length} Questions</Badge>
              </div>
              <div className="space-y-3">
                {previewQuestions.map((q, idx) => (
                  <Card key={q.id} className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">Question {idx + 1}</Badge>
                            <Badge>{q.type.toUpperCase()}</Badge>
                          </div>
                          <p className="text-sm font-medium">{q.question}</p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      </div>
                      {q.options && (
                        <div className="pl-4 space-y-1">
                          {q.options.map((opt: string, i: number) => (
                            <p key={i} className="text-xs text-muted-foreground">
                              • {opt}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
              <div className="flex gap-2">
                <Button className="w-full" size="lg" onClick={handlePublish}>
                  Publish to Class
                </Button>
                <Button className="w-full mt-2" size="lg" variant="outline" onClick={handleCancelPreview}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
