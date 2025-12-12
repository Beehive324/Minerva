// API Type Definitions for Backend Integration
// These types define the expected structure for API calls

// ============================================
// AUTHENTICATION (Mock for Hackathon)
// ============================================
export type UserRole = "teacher" | "student"

export interface User {
  id: string
  role: UserRole
  name: string
}

// ============================================
// CLASSROOM MANAGEMENT
// ============================================

// POST /api/classrooms
export interface CreateClassroomRequest {
  name: string // e.g., "Year 11 Maths"
  subject: string // e.g., "Mathematics"
  specification: File // PDF file
  teacherId: string
}

export interface CreateClassroomResponse {
  classroomId: string
  name: string
  subject: string
  topics: string[] // AI-extracted from PDF
  classCode: string // e.g., "JOIN-1234"
}

// GET /api/classrooms/:id
export interface GetClassroomResponse {
  id: string
  name: string
  subject: string
  topics: string[]
  classCode: string
  studentCount: number
  activeQuizCount: number
}

// ============================================
// QUIZ GENERATION
// ============================================

// POST /api/quizzes/generate
export interface GenerateQuizRequest {
  classroomId: string
  topic: string // Selected from detected topics
  numQuestions: number
  difficulty: "easy" | "medium" | "hard"
  strictAlign: boolean // Whether to strictly follow specification
}

export interface QuizQuestion {
  id: string
  type: "mcq" | "numerical" | "written"
  question: string
  options?: string[] // For MCQ
  correctAnswer?: string
  rubric?: string // For written questions
  specificationReference?: string // Page/section in PDF
}

export interface GenerateQuizResponse {
  questions: QuizQuestion[]
}

// POST /api/quizzes
export interface CreateQuizRequest {
  classroomId: string
  topic: string
  difficulty: string
  questions: QuizQuestion[]
}

export interface CreateQuizResponse {
  quizId: string
  publishedAt: string
}

// ============================================
// STUDENT QUIZ TAKING
// ============================================

// GET /api/quizzes/student/:studentId
export interface StudentQuizzesResponse {
  quizzes: Array<{
    id: string
    title: string
    subject: string
    difficulty: string
    dueDate: string
    questions: number
    status: "pending" | "submitted"
  }>
}

// GET /api/quizzes/:quizId
export interface GetQuizResponse {
  id: string
  title: string
  questions: QuizQuestion[]
}

// POST /api/quiz-submissions
export interface SubmitQuizRequest {
  quizId: string
  studentId: string
  answers: Record<number, string> // question index -> answer
}

export interface SubmitQuizResponse {
  submissionId: string
  score: number
  totalQuestions: number
  results: Array<{
    questionId: string
    isCorrect: boolean
    studentAnswer: string
    correctAnswer?: string
    feedback: string
  }>
}

// ============================================
// AI TUTOR CHAT
// ============================================

// POST /api/tutor/chat
export interface TutorChatRequest {
  submissionId: string
  questionId: string
  conversationHistory: Array<{
    role: "ai" | "student"
    content: string
  }>
  studentMessage: string
}

export interface TutorChatResponse {
  message: string
  source?: string // Reference to specification
  suggestions?: string[] // Possible follow-up questions
}

// ============================================
// TEACHER ANALYTICS
// ============================================

// GET /api/analytics/:quizId
export interface QuizAnalyticsResponse {
  quizId: string
  quizTitle: string
  classAverage: number
  students: Array<{
    id: string
    name: string
    status: "submitted" | "pending"
    score: string // e.g., "2/3"
    percentage: number
    aiInsight: string // Generated insight about student performance
  }>
  classSummary: {
    message: string // AI-generated summary
    focusAreas: string[] // Topics that need attention
    belowTarget: number // Percentage of students below target
  }
}
