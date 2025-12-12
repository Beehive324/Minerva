"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LoadingState } from "@/components/loading-state"

export default function QuizPage() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [questions, setQuestions] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<any[]>([])

  useEffect(() => {
    // Get assignmentId from query params
    const params = new URLSearchParams(window.location.search)
    const assignmentId = params.get("assignmentId")
    if (assignmentId) {
      fetch(`http://localhost:8000/api/assignments/${assignmentId}/questions`)
        .then((res) => res.json())
        .then((data) => {
          if (data.questions) {
            // Log and patch questions for debugging
            const patched = data.questions.map((q: any) => {
              console.log("Fetched question:", q)
              // Patch: if options is a string, split it; if type missing but options exist, set type to mcq
              if (q.options && typeof q.options === "string") {
                q.options = q.options.split(",").map((opt: string) => opt.trim())
              }
              if (!q.type && Array.isArray(q.options) && q.options.length > 0) {
                q.type = "mcq"
              }
              return q
            })
            setQuestions(patched)
          }
        })
    }
  }, [])

  // MOCK DATA - Replace with API call: GET /api/quizzes/:id
  // Response: { quizId: string, title: string, questions: Array<Question> }
  const defaultQuestions = [
    {
      id: 1,
      type: "mcq",
      question: "What is the value of x in the equation 2x + 5 = 13?",
      options: ["x = 3", "x = 4", "x = 5", "x = 6"],
    },
    {
      id: 2,
      type: "numerical",
      question: "Calculate the area of a circle with radius 7cm (use π = 3.14)",
      unit: "cm²",
    },
    {
      id: 3,
      type: "written",
      question: "Explain why the quadratic formula works for all quadratic equations",
    },
  ]

  const handleAnswerChange = (value: string) => {
    setAnswers({ ...answers, [currentQuestion]: value })
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Get assignmentId from query params
    const params = new URLSearchParams(window.location.search)
    const assignmentId = params.get("assignmentId")
    // Get studentId (assume from localStorage for now)
    const studentId = localStorage.getItem("studentId") || "1"
    try {
      const response = await fetch("http://localhost:8000/api/quiz-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId,
          studentId,
          answers
        })
      })
      const data = await response.json()
      if (data.submissionId) {
        router.push(`/student/results?submissionId=${data.submissionId}`)
      } else {
        setIsSubmitting(false)
        alert("Failed to submit quiz. Please try again.")
      }
    } catch (err) {
      setIsSubmitting(false)
      alert("Error submitting quiz.")
    }
  }

  // Use questions from backend if available
  const currentQ = questions[currentQuestion] || {}
  const progress = ((currentQuestion + 1) / questions.length) * 100

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="p-12 max-w-lg w-full">
          <LoadingState message="Marking against Rubric..." submessage="AI analyzing your responses" />
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/student/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Maths Quiz: Algebra</h1>
              <p className="text-sm text-muted-foreground">
                {showResults
                  ? `Quiz Complete`
                  : `Question ${currentQuestion + 1} of ${questions.length}`}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {!showResults && <Progress value={progress} className="h-2" />}

        {/* Question Card or Results */}
        <Card className="p-8">
          <div className="space-y-6">
            {showResults ? (
              <div>
                <h2 className="text-2xl font-bold mb-6">Quiz Results</h2>
                <div className="space-y-6">
                  {results.map((res, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="font-semibold mb-2">Q{idx + 1}: {res.question}</div>
                      <div className="mb-1">
                        <span className="font-medium">Your answer:</span> {res.userAnswer || <span className="italic text-muted-foreground">No answer</span>}
                      </div>
                      <div className="mb-1">
                        <span className="font-medium">Correct answer:</span> {res.correctAnswer}
                      </div>
                      <div className={res.isCorrect ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                        {res.isCorrect ? "Correct" : "Incorrect"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      Q{currentQuestion + 1}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">
                      {currentQ.type ? currentQ.type.toUpperCase() : ""}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold leading-relaxed">{currentQ.question}</h2>
                </div>

                <div className="pt-4">
                  {currentQ.type === "mcq" && Array.isArray(currentQ.options) && currentQ.options.length > 0 && (
                    <RadioGroup value={answers[currentQuestion] || ""} onValueChange={handleAnswerChange}>
                      <div className="space-y-3">
                        {(currentQ.options as string[]).map((option: string, idx: number) => (
                          <Label
                            key={idx}
                            htmlFor={`option-${idx}`}
                            className="flex items-center gap-3 p-4 rounded-lg border cursor-pointer hover:bg-muted transition-colors"
                          >
                            <RadioGroupItem value={option} id={`option-${idx}`} />
                            <span>{option}</span>
                          </Label>
                        ))}
                      </div>
                    </RadioGroup>
                  )}
                  {currentQ.type === "mcq" && (!Array.isArray(currentQ.options) || currentQ.options.length === 0) && (
                    <div className="text-muted-foreground">No options available for this question.</div>
                  )}

                  {currentQ.type === "numerical" && (
                    <div className="space-y-2">
                      <Label htmlFor="numerical-answer">Your Answer</Label>
                      <div className="flex gap-2">
                        <Input
                          id="numerical-answer"
                          type="number"
                          placeholder="Enter your answer"
                          value={answers[currentQuestion] || ""}
                          onChange={(e) => handleAnswerChange(e.target.value)}
                          className="flex-1"
                        />
                        {currentQ.unit && (
                          <div className="px-4 py-2 bg-muted rounded-md flex items-center">{currentQ.unit}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {currentQ.type === "written" && (
                    <div className="space-y-2">
                      <Label htmlFor="written-answer">Your Answer</Label>
                      <Textarea
                        id="written-answer"
                        placeholder="Type your explanation here..."
                        rows={8}
                        value={answers[currentQuestion] || ""}
                        onChange={(e) => handleAnswerChange(e.target.value)}
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground">Write a clear and detailed explanation</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          {showResults ? (
            <div className="flex justify-end w-full">
              <Link href="/student/dashboard">
                <Button>Back to Dashboard</Button>
              </Link>
            </div>
          ) : (
            <>
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentQuestion === questions.length - 1 ? (
                <Button onClick={handleSubmit} disabled={Object.keys(answers).length !== questions.length}>
                  Submit Quiz
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
