"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { LoadingState } from "@/components/loading-state"
import { Sparkles, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { generateQuiz, publishQuiz } from "@/lib/api"

interface QuizGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
  classroomId: string
}

export function QuizGeneratorModal({ isOpen, onClose, classroomId }: QuizGeneratorModalProps) {
  const router = useRouter()
  const [customPrompt, setCustomPrompt] = useState("")
  const [numQuestions, setNumQuestions] = useState([3])
  const [difficulty, setDifficulty] = useState("medium")
  const [timeLimit, setTimeLimit] = useState<number | undefined>(undefined)
  const [enableTimeLimit, setEnableTimeLimit] = useState(false)
  const [strictAlign, setStrictAlign] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([])

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const { questions } = await generateQuiz({
        classroomId,
        customPrompt,
        numQuestions: numQuestions[0],
        difficulty,
        timeLimit: enableTimeLimit ? timeLimit : undefined,
        strictAlign,
      })
      setGeneratedQuestions(questions)
    } catch (error) {
      console.error("Failed to generate quiz:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePublish = async () => {
    try {
      await publishQuiz({
        classroomId,
        questions: generatedQuestions,
        difficulty,
        timeLimit: enableTimeLimit ? timeLimit : undefined,
      })
      router.push("/teacher/analytics")
      onClose()
    } catch (error) {
      console.error("Failed to publish quiz:", error)
    }
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
          {!isGenerating && generatedQuestions.length === 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-prompt">Customization Prompt</Label>
                <Textarea
                  id="custom-prompt"
                  placeholder="e.g., Create questions on quadratic equations and trigonometry focusing on exam-style questions..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Describe the topics, difficulty level, or specific requirements for your quiz
                </p>
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

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Time Limit</Label>
                    <p className="text-sm text-muted-foreground">Set a time limit for completing the quiz</p>
                  </div>
                  <Switch checked={enableTimeLimit} onCheckedChange={setEnableTimeLimit} />
                </div>

                {enableTimeLimit && (
                  <div className="space-y-2 pl-4">
                    <Label htmlFor="time-limit">Time Limit (minutes)</Label>
                    <Input
                      id="time-limit"
                      type="number"
                      min={5}
                      max={180}
                      value={timeLimit || 30}
                      onChange={(e) => setTimeLimit(Number.parseInt(e.target.value))}
                      placeholder="30"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="space-y-0.5">
                  <Label className="text-base">Strictly align to specification</Label>
                  <p className="text-sm text-muted-foreground">Questions will reference uploaded PDF curriculum</p>
                </div>
                <Switch checked={strictAlign} onCheckedChange={setStrictAlign} />
              </div>

              <Button className="w-full" size="lg" onClick={handleGenerate} disabled={!customPrompt.trim()}>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate with AI
              </Button>
            </div>
          )}

          {isGenerating && (
            <LoadingState
              message="Consulting Syllabus..."
              submessage="Crafting questions aligned to curriculum standards"
            />
          )}

          {!isGenerating && generatedQuestions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg">Generated Questions Preview</Label>
                <Badge variant="secondary">{generatedQuestions.length} Questions</Badge>
              </div>

              <div className="space-y-3">
                {generatedQuestions.map((q, idx) => (
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

              <Button className="w-full" size="lg" onClick={handlePublish}>
                Publish to Class
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
