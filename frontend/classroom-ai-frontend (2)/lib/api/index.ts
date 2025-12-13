// API Service Layer - Replace mock implementations with real backend calls

// ============= MOCK DATA =============
// This section contains all mock data used throughout the app
// Remove this section when connecting to real backend

const MOCK_CLASSROOMS = [
  {
    id: "1",
    name: "Year 11 Maths",
    subject: "Mathematics",
    classCode: "MATH11",
    studentCount: 2,
    activeQuizCount: 1,
    teacherName: "Mr. Smith",
  },
]

const MOCK_QUIZZES = [
  {
    id: "1",
    title: "Maths Quiz: Algebra",
    difficulty: "hard",
    dueDate: new Date().toISOString(),
    questionCount: 3,
    classroomId: "1",
    questions: [
      {
        id: 1,
        type: "mcq",
        question: "What is the value of x in the equation 2x + 5 = 13?",
        options: ["x = 3", "x = 4", "x = 5", "x = 6"],
        correctAnswer: "x = 4",
      },
      {
        id: 2,
        type: "numerical",
        question: "Calculate the area of a circle with radius 7cm (use π = 3.14)",
        unit: "cm²",
        answer: "153.86",
      },
      {
        id: 3,
        type: "written",
        question: "Explain why the quadratic formula works for all quadratic equations",
        rubric: "Should mention completing the square, discriminant, and derivation",
      },
    ],
  },
]

// ============= AUTH API =============

export async function createUser(data: { type: "student" | "teacher"; email?: string }) {
  // TODO: POST /api/auth/register
  // Request: { type: 'student' | 'teacher', email?: string }
  // Response: { userId: string }

  await new Promise((resolve) => setTimeout(resolve, 1000))
  return { userId: `${data.type}-${Date.now()}`, token: "mock-token" }
}

// ============= CLASSROOM API =============

export async function getTeacherClassrooms() {
  // GET /api/teacher/1/classrooms (hardcoded teacher_id=1)
  const res = await fetch("http://localhost:8000/api/teacher/1/classrooms");
  if (!res.ok) throw new Error("Failed to fetch classrooms");
  return await res.json();
}

export async function createClassroom(data: {
  name: string
  subject: string
  classCode: string
  curriculum: File
  topics: string[]
}) {
  // POST /api/classrooms
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("subject", data.subject);
  formData.append("code", data.classCode);
  formData.append("pdf_filename", data.curriculum?.name || "");
  // Optionally, you could send topics as JSON string if backend expects it
  // formData.append("topics", JSON.stringify(data.topics));
  // Add teacher_id if available (hardcoded or from auth)
  formData.append("teacher_id", "1");

  const res = await fetch("http://localhost:8000/api/classrooms", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to create classroom");
  return await res.json();
}

export async function joinClassroom(classCode: string) {
  // POST /api/classrooms/join
  const res = await fetch("http://localhost:8000/api/classrooms/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ classCode }),
  });
  if (!res.ok) throw new Error("Failed to join classroom");
  return await res.json();
}

export async function getStudentClassrooms() {
  // TODO: GET /api/student/classrooms
  // Response: { classrooms: Array<Classroom & { todoCount: number }> }

  await new Promise((resolve) => setTimeout(resolve, 500))
  return {
    classrooms: [
      {
        ...MOCK_CLASSROOMS[0],
        todoCount: 1,
      },
    ],
  }
}

export async function analyzeCurriculum(file: File) {
  // POST /api/upload/curriculum
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("http://localhost:8000/api/upload/curriculum", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to analyze curriculum");
  const data = await res.json();
  return {
    topics: data.topics || [],
    learningObjectives: data.learningObjectives || [],
  };
}

// ============= QUIZ API =============

export async function generateQuiz(data: {
  classroomId: string
  customPrompt: string
  numQuestions: number
  difficulty: string
  timeLimit?: number
  strictAlign: boolean
}) {
  // TODO: POST /api/quizzes/generate
  // Request: { classroomId, customPrompt, numQuestions, difficulty, timeLimit, strictAlign }
  // Response: { questions: Array<Question> }

  await new Promise((resolve) => setTimeout(resolve, 3000))
  return { questions: MOCK_QUIZZES[0].questions }
}

export async function publishQuiz(data: {
  classroomId: string
  questions: any[]
  difficulty: string
  timeLimit?: number
}) {
  // TODO: POST /api/quizzes
  // Request: { classroomId, questions, difficulty, timeLimit }
  // Response: { quizId: string }

  await new Promise((resolve) => setTimeout(resolve, 1000))
  return { quizId: `quiz-${Date.now()}` }
}

export async function getClassroomQuizzes(classroomId: string) {
  // TODO: GET /api/classrooms/:classroomId/quizzes
  // Response: { quizzes: Array<Quiz> }

  await new Promise((resolve) => setTimeout(resolve, 500))
  return { quizzes: MOCK_QUIZZES }
}

export async function getQuiz(quizId: string) {
  // TODO: GET /api/quizzes/:quizId
  // Response: { quiz: Quiz }

  await new Promise((resolve) => setTimeout(resolve, 500))
  return { quiz: MOCK_QUIZZES[0] }
}

// ============= SUBMISSION API =============

export async function submitQuiz(data: { quizId: string; answers: Record<number, string> }) {
  // TODO: POST /api/quiz-submissions
  // Request: { quizId, answers }
  // Response: { submissionId: string, results: QuizResults }

  await new Promise((resolve) => setTimeout(resolve, 2500))
  return {
    submissionId: `sub-${Date.now()}`,
    results: {
      score: 2,
      total: 3,
      percentage: 67,
      questions: [
        {
          id: 1,
          question: "What is the value of x in the equation 2x + 5 = 13?",
          studentAnswer: data.answers[0] || "x = 5",
          correctAnswer: "x = 4",
          isCorrect: false,
          explanation: "To solve 2x + 5 = 13, subtract 5 from both sides to get 2x = 8, then divide by 2.",
        },
        {
          id: 2,
          question: "Calculate the area of a circle with radius 7cm",
          studentAnswer: data.answers[1] || "153.86",
          correctAnswer: "153.86",
          isCorrect: true,
          explanation: "Using A = πr², we get A = 3.14 × 49 = 153.86 cm².",
        },
        {
          id: 3,
          question: "Explain why the quadratic formula works",
          studentAnswer: data.answers[2] || "It comes from completing the square",
          correctAnswer: null,
          isCorrect: false,
          explanation: "A complete explanation should include the derivation and mention the discriminant.",
        },
      ],
    },
  }
}

export async function getQuizResults(submissionId: string) {
  // TODO: GET /api/quiz-submissions/:submissionId
  // Response: { results: QuizResults }

  await new Promise((resolve) => setTimeout(resolve, 500))
  return {
    results: {
      score: 2,
      total: 3,
      percentage: 67,
      questions: [],
    },
  }
}

export async function getQuizAnalytics(quizId: string) {
  // TODO: GET /api/quizzes/:quizId/analytics
  // Response: { students: Array<StudentResult> }

  await new Promise((resolve) => setTimeout(resolve, 500))
  return {
    students: [
      {
        id: 1,
        name: "Student A",
        status: "Submitted",
        score: "1/3",
        percentage: 33,
        insight: "Struggled with Quadratics",
      },
      {
        id: 2,
        name: "Student B",
        status: "Submitted",
        score: "2/3",
        percentage: 67,
        insight: "Strong on basics, needs advanced practice",
      },
    ],
  }
}

export async function getSubmissionResults(submissionId: string) {
  // TODO: GET /api/submissions/:submissionId/results
  // Response: { score: number, total: number, percentage: number, questions: Array<QuestionResult> }

  await new Promise((resolve) => setTimeout(resolve, 500))
  return {
    score: 2,
    total: 3,
    percentage: 67,
    questions: [
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
    ],
  }
}

// ============= AI TUTOR API =============

export async function initTutorSession(data: { questionId: number; studentAnswer: string; quizId: string }) {
  // TODO: POST /api/tutor/init
  // Request: { questionId, studentAnswer, quizId }
  // Response: { sessionId: string, initialMessage: string, source: string }

  await new Promise((resolve) => setTimeout(resolve, 1000))
  return {
    sessionId: `session-${Date.now()}`,
    initialMessage: `I see you answered '${data.studentAnswer}'. Let's work through this step by step. What is the first step when solving for x?`,
    source: "Specification Page 14",
  }
}

export async function sendTutorMessage(data: { sessionId: string; message: string }) {
  // TODO: POST /api/tutor/chat
  // Request: { sessionId, message }
  // Response: { response: string, source: string }

  await new Promise((resolve) => setTimeout(resolve, 800))
  return {
    response:
      "Great question! When we have 2x + 5 = 13, we need to isolate x. First, subtract 5 from both sides. What does that give us?",
    source: "Specification Page 14",
  }
}
