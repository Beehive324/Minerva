# Backend Integration Guide

This frontend is designed to be easily connected to a backend API. Below is a comprehensive guide on how to integrate each feature.

## Architecture Overview

The frontend is structured with clear separation between UI and data:

- **UI Components**: All in `/components` directory
- **Pages**: Route handlers in `/app` directory
- **API Types**: Defined in `/lib/api-types.ts`
- **Mock Data**: Currently hardcoded in components (marked with comments)

## API Endpoints Required

### 1. Authentication (Demo Mode)

**Current Implementation**: Hardcoded user IDs (`teacher_id_1`, `student_id_1`)

**Production Integration**:

\`\`\`typescript
// POST /api/auth/login
{
  email: string
  password: string
}
// Response: { userId, role, token }
\`\`\`

### 2. Classroom Setup

**Location**: `app/teacher/setup/page.tsx`

**Integration Points**:

\`\`\`typescript
// Replace handleCreateClassroom() function
const handleCreateClassroom = async () => {
  const formData = new FormData()
  formData.append("name", classroomName)
  formData.append("subject", subject)
  formData.append("specification", file!)
  formData.append("teacherId", currentUserId)

  const response = await fetch("/api/classrooms", {
    method: "POST",
    body: formData,
  })

  const data = await response.json()
  // data will contain: classroomId, topics[], classCode
}

// Replace PDF processing simulation (line 24-29)
const processSpecification = async (file: File) => {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch("/api/ai/analyze-specification", {
    method: "POST",
    body: formData,
  })

  const { topics } = await response.json()
  setTopics(topics)
}
\`\`\`

### 3. Quiz Generation

**Location**: `components/quiz-generator-modal.tsx`

**Integration Points**:

\`\`\`typescript
// Replace handleGenerate() function (line 27)
const handleGenerate = async () => {
  setIsGenerating(true)

  const response = await fetch("/api/quizzes/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      classroomId: currentClassroomId,
      topic,
      numQuestions: numQuestions[0],
      difficulty,
      strictAlign,
    }),
  })

  const { questions } = await response.json()
  setGeneratedQuestions(questions)
  setIsGenerating(false)
}

// Replace handlePublish() function (line 45)
const handlePublish = async () => {
  await fetch("/api/quizzes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      classroomId: currentClassroomId,
      questions: generatedQuestions,
      topic,
      difficulty,
    }),
  })

  router.push("/teacher/analytics")
}
\`\`\`

### 4. Student Quiz Taking

**Location**: `app/student/quiz/page.tsx`

**Integration Points**:

\`\`\`typescript
// Load quiz data on component mount
useEffect(() => {
  const loadQuiz = async () => {
    const response = await fetch(`/api/quizzes/${quizId}`)
    const data = await response.json()
    setQuestions(data.questions)
  }
  loadQuiz()
}, [])

// Replace handleSubmit() function (line 57)
const handleSubmit = async () => {
  setIsSubmitting(true)

  const response = await fetch("/api/quiz-submissions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      quizId: currentQuizId,
      studentId: currentUserId,
      answers,
    }),
  })

  const { submissionId } = await response.json()
  router.push(`/student/results?submissionId=${submissionId}`)
}
\`\`\`

### 5. AI Tutor Chat

**Location**: `app/student/results/page.tsx`

**Integration Points**:

\`\`\`typescript
// Replace handleSendMessage() function (line 64)
const handleSendMessage = async () => {
  if (!input.trim()) return

  const newMessages = [...messages, { role: "student", content: input }]
  setMessages(newMessages)
  setInput("")

  const response = await fetch("/api/tutor/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      submissionId: currentSubmissionId,
      questionId: selectedQuestion,
      conversationHistory: messages,
      studentMessage: input,
    }),
  })

  const { message, source } = await response.json()
  setMessages([...newMessages, { role: "ai", content: message, source }])
}
\`\`\`

### 6. Teacher Analytics

**Location**: `app/teacher/analytics/page.tsx`

**Integration Points**:

\`\`\`typescript
// Load analytics on component mount
useEffect(() => {
  const loadAnalytics = async () => {
    const response = await fetch(`/api/analytics/${quizId}`)
    const data = await response.json()

    setStudents(data.students)
    setClassSummary(data.classSummary)
  }
  loadAnalytics()
}, [])
\`\`\`

## Environment Variables

Add these to your `.env.local`:

\`\`\`
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
\`\`\`

## State Management

Currently using React useState. For production, consider:

- **SWR** for data fetching and caching
- **Zustand** for global state management
- **React Query** for server state

## WebSocket Integration (Optional)

For real-time features:

- Live quiz submissions
- Real-time AI tutor responses
- Student progress tracking

\`\`\`typescript
// Example WebSocket setup
const ws = new WebSocket("ws://localhost:8000/ws")

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  // Handle real-time updates
}
\`\`\`

## Error Handling

Add error boundaries and toast notifications:

\`\`\`typescript
try {
  const response = await fetch("/api/...")
  if (!response.ok) throw new Error("Request failed")
  // Process response
} catch (error) {
  showError("Something went wrong. Please try again.")
}
\`\`\`

## Testing Backend Integration

1. Replace mock data with API calls
2. Test each flow end-to-end
3. Verify error handling
4. Check loading states
5. Validate data formatting

## Next Steps

1. Set up backend API with endpoints listed above
2. Replace hardcoded data with API calls
3. Add authentication flow
4. Implement WebSocket for real-time features
5. Add error handling and loading states
6. Test thoroughly with real data
