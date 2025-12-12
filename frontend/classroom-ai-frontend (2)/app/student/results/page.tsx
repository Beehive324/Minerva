"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { ArrowLeft, CheckCircle2, XCircle, Send, BookOpen, Sparkles } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { initTutorSession, sendTutorMessage, getSubmissionResults } from "@/lib/api"

interface Message {
  role: "ai" | "student"
  content: string
  source?: string
}

interface QuestionResult {
  id: number
  question: string
  studentAnswer: string
  correctAnswer: string | null
  isCorrect: boolean
  explanation: string
}

export default function ResultsPage() {
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [sessionId, setSessionId] = useState<string | null>(null)

  const [questions, setQuestions] = useState<QuestionResult[]>([])
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const [percentage, setPercentage] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await getSubmissionResults("submission-id")
        setQuestions(data.questions)
        setScore(data.score)
        setTotal(data.total)
        setPercentage(data.percentage)
      } catch (error) {
        console.error("Failed to fetch results:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [])

  const handleGetHelp = async (questionId: number) => {
    setSelectedQuestion(questionId)
    const question = questions.find((q) => q.id === questionId)
    if (question && messages.length === 0) {
      try {
        const {
          sessionId: newSessionId,
          initialMessage,
          source,
        } = await initTutorSession({
          questionId,
          studentAnswer: question.studentAnswer,
          quizId: "quiz-id",
        })
        setSessionId(newSessionId)
        setMessages([{ role: "ai", content: initialMessage, source }])
      } catch (error) {
        console.error("Failed to init tutor session:", error)
      }
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || !sessionId) return

    const studentMessage: Message = { role: "student", content: input }
    setMessages((prev) => [...prev, studentMessage])
    setInput("")

    try {
      const { response, source } = await sendTutorMessage({
        sessionId,
        message: input,
      })
      setMessages((prev) => [...prev, { role: "ai", content: response, source }])
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="grid lg:grid-cols-2 h-screen">
        {/* Left Side - Test Paper */}
        <div className="border-r border-border overflow-auto">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between sticky top-0 bg-background pb-4 border-b">
              <div className="flex items-center gap-4">
                <Link href="/student/dashboard">
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold">Quiz Results</h1>
                  <p className="text-sm text-muted-foreground">Maths Quiz: Algebra</p>
                </div>
              </div>
            </div>

            {/* Score Card */}
            <Card className="p-6 bg-gradient-to-br from-chart-1/10 to-chart-1/5 border-chart-1/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Your Score</p>
                  <p className="text-4xl font-bold">
                    {score}/{total}
                  </p>
                  <p className="text-lg text-muted-foreground mt-1">{percentage}%</p>
                </div>
                <div className="w-20 h-20 rounded-full border-4 border-chart-1 flex items-center justify-center">
                  <span className="text-2xl font-bold text-chart-1">{percentage}%</span>
                </div>
              </div>
            </Card>

            {/* Questions List */}
            <div className="space-y-4">
              {questions.map((q) => (
                <Card
                  key={q.id}
                  className={cn(
                    "p-5 transition-all",
                    !q.isCorrect && "border-red-500/30 bg-red-500/5",
                    q.isCorrect && "border-green-500/30 bg-green-500/5",
                    selectedQuestion === q.id && "ring-2 ring-primary",
                  )}
                >
                  <div className="space-y-4">
                    {/* Question Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Q{q.id}</Badge>
                          {q.isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                        <p className="text-sm font-medium leading-relaxed">{q.question}</p>
                      </div>
                    </div>

                    {/* Answers */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Your answer:</span>
                        <span className={cn("font-medium", !q.isCorrect && "text-red-500")}>{q.studentAnswer}</span>
                      </div>
                      {!q.isCorrect && q.correctAnswer && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Correct answer:</span>
                          <span className="font-medium text-green-500">{q.correctAnswer}</span>
                        </div>
                      )}
                    </div>

                    {/* Get Help Button */}
                    {!q.isCorrect && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-chart-1/10 border-chart-1/20 hover:bg-chart-1/20 text-chart-1"
                        onClick={() => handleGetHelp(q.id)}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Get AI Help
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - AI Tutor Panel */}
        <div className="flex flex-col bg-muted/30">
          <div className="p-6 border-b bg-background">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-chart-1/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-chart-1" />
              </div>
              <div>
                <h2 className="font-semibold">AI Tutor</h2>
                <p className="text-sm text-muted-foreground">Ask questions to understand your mistakes</p>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <ScrollArea className="flex-1 p-6">
            {!selectedQuestion ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground space-y-2">
                  <BookOpen className="w-12 h-12 mx-auto opacity-50" />
                  <p>Select a question to start learning</p>
                  <p className="text-sm">Click "Get AI Help" on any incorrect answer</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, idx) => (
                  <div key={idx} className={cn("flex", message.role === "student" ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg p-4 space-y-2",
                        message.role === "student" ? "bg-primary text-primary-foreground" : "bg-card border",
                      )}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      {message.source && (
                        <p className="text-xs opacity-70 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {message.source}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          {selectedQuestion && (
            <div className="p-4 border-t bg-background">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your response..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                />
                <Button size="icon" onClick={handleSendMessage} disabled={!input.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
