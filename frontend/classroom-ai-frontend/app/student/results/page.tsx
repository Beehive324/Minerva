"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { ArrowLeft, CheckCircle2, XCircle, Send, BookOpen, Sparkles } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

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

  // MOCK DATA - Replace with API call: GET /api/quiz-submissions/:id
  // Response: { score: number, total: number, questions: Array<QuestionResult> }
  const questions: QuestionResult[] = [
    {
      id: 1,
      question: "What is the value of x in the equation 2x + 5 = 13?",
      studentAnswer: "x = 5",
      correctAnswer: "x = 4",
      isCorrect: false,
      explanation: "To solve 2x + 5 = 13, subtract 5 from both sides to get 2x = 8, then divide by 2 to get x = 4.",
    },
    {
      id: 2,
      question: "Calculate the area of a circle with radius 7cm (use π = 3.14)",
      studentAnswer: "153.86",
      correctAnswer: "153.86",
      isCorrect: true,
      explanation: "Using the formula A = πr², we get A = 3.14 × 7² = 3.14 × 49 = 153.86 cm².",
    },
    {
      id: 3,
      question: "Explain why the quadratic formula works for all quadratic equations",
      studentAnswer: "It works because it comes from completing the square.",
      correctAnswer: null,
      isCorrect: false,
      explanation:
        "While your answer touches on the origin, a complete explanation should include the derivation process and mention the discriminant.",
    },
  ]

  const score = questions.filter((q) => q.isCorrect).length
  const total = questions.length
  const percentage = Math.round((score / total) * 100)

  const handleGetHelp = (questionId: number) => {
    // TODO: API call - POST /api/tutor/init
    // Body: { questionId: number, studentAnswer: string }
    // Response: { initialMessage: string, context: string }
    setSelectedQuestion(questionId)
    const question = questions.find((q) => q.id === questionId)
    if (question && messages.length === 0) {
      // MOCK DATA - Initial AI tutor response
      setMessages([
        {
          role: "ai",
          content: `I see you answered '${question.studentAnswer}'. Let's look at the formula from the syllabus. What is the first step when solving for x?`,
          source: "Specification Page 14",
        },
      ])
    }
  }

  const handleSendMessage = () => {
    if (!input.trim()) return

    // TODO: API call - POST /api/tutor/chat
    // Body: { questionId: number, message: string, conversationHistory: Array<Message> }
    // Response: { response: string, source: string }

    // MOCK DATA - Simulated AI tutor conversation
    const newMessages: Message[] = [
      ...messages,
      { role: "student", content: input },
      {
        role: "ai",
        content:
          "Great question! When we have 2x + 5 = 13, we need to isolate x. First, we subtract 5 from both sides. Can you tell me what that gives us?",
        source: "Specification Page 14",
      },
    ]

    setMessages(newMessages)
    setInput("")
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
              {/* MOCK DATA - Student's quiz results */}
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
                {/* MOCK DATA - AI tutor conversation messages */}
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
