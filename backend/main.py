from fastapi import FastAPI, UploadFile, File, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import sqlite3
from pathlib import Path
import random
from fastapi import Query
from datetime import datetime

try:
    # When running as a package: `uvicorn Minerva.backend.main:app` or similar
    from .agents.quiz import QuizAgent  # type: ignore
    from .agents.curriculum import CurriculumAgent  # type: ignore
except ImportError:
    # When running from the backend directory: `uvicorn main:app`
    try:
        from agents.quiz import QuizAgent  # type: ignore
        from agents.curriculum import CurriculumAgent  # type: ignore
    except ImportError:
        QuizAgent = None  # type: ignore
        CurriculumAgent = None  # type: ignore

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# sInitialize SQLite database and create 'classroom' table if it doesn't exist
DB_PATH = Path(__file__).parent / 'database.db'
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()
cursor.execute('''
    CREATE TABLE IF NOT EXISTS classroom (
        id INTEGER PRIMARY KEY,
        code TEXT,
        name TEXT,
        subject TEXT,
        pdf_filename TEXT,
        teacher_id TEXT
    )
''')
cursor.execute('''
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY,
        name TEXT,
        classroom_id INTEGER,
        FOREIGN KEY(classroom_id) REFERENCES classroom(id)
    )
''')
cursor.execute('''
    CREATE TABLE IF NOT EXISTS assignments (
        id INTEGER PRIMARY KEY,
        classroom_id INTEGER,
        title TEXT,
        subject TEXT,
        difficulty TEXT,
        due_date TEXT,
        questions INTEGER,
        FOREIGN KEY(classroom_id) REFERENCES classroom(id)
    )
''')
cursor.execute('''
    CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY,
        assignment_id INTEGER,
        question TEXT,
        answer TEXT,
        options TEXT,
        FOREIGN KEY(assignment_id) REFERENCES assignments(id)
    )
''')
cursor.execute('''
    CREATE TABLE IF NOT EXISTS submissions (
        id INTEGER PRIMARY KEY,
        assignment_id INTEGER,
        student_id INTEGER,
        submitted_at TEXT,
        score INTEGER,
        total INTEGER,
        status TEXT DEFAULT 'pending',
        FOREIGN KEY(assignment_id) REFERENCES assignments(id),
        FOREIGN KEY(student_id) REFERENCES students(id)
    )
''')
# Add status column to existing table if not present
try:
    cursor.execute("ALTER TABLE submissions ADD COLUMN status TEXT DEFAULT 'pending'")
except Exception:
    pass  # Ignore if already exists
cursor.execute('''
    CREATE TABLE IF NOT EXISTS submission_answers (
        id INTEGER PRIMARY KEY,
        submission_id INTEGER,
        question_id INTEGER,
        student_answer TEXT,
        is_correct INTEGER,
        FOREIGN KEY(submission_id) REFERENCES submissions(id),
        FOREIGN KEY(question_id) REFERENCES questions(id)
    )
''')
conn.commit()
conn.close()

quiz_agent = QuizAgent() if QuizAgent is not None else None
curriculum_agent = CurriculumAgent() if "CurriculumAgent" in globals() and CurriculumAgent is not None else None

@app.post("/trigger")
def trigger():
    return JSONResponse(content={"message": "Backend function triggered!"})

@app.post("/api/upload/curriculum")
async def upload_curriculum(file: UploadFile = File(...)):
    print(f"Received file: {file.filename}")
    pdf_bytes = await file.read()

    if curriculum_agent is not None:
        result = curriculum_agent.extract_curriculum(pdf_bytes=pdf_bytes, filename=file.filename)
        return JSONResponse(content=result)

    # Fallback to previous mock behaviour if curriculum_agent isn't available
    return JSONResponse(
        content={
            "topics": ["Algebraaa", "Geometry", "Statistics", "Trigonometry", "Calculus Basics"],
            "learningObjectives": [
                "Understand basic algebraic expressions",
                "Learn geometric shapes and properties",
                "Analyze statistical data",
                "Master trigonometric functions",
                "Introduction to calculus",
            ],
        }
    )

def generate_class_code():
    return f"JOIN-{random.randint(10000, 99999)}"

@app.post("/api/classrooms")
async def create_classroom(request: Request):
    data = await request.json()
    name = data.get("name")
    code = data.get("code") or generate_class_code()
    subject = data.get("subject")
    pdf_filename = data.get("pdf_filename")
    teacher_id = data.get("teacherId")
    # Insert into database
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO classroom (code, name, subject, pdf_filename, teacher_id) VALUES (?, ?, ?, ?, ?)",
        (code, name, subject, pdf_filename, teacher_id)
    )
    classroom_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return {"success": True, "classroomId": classroom_id, "classCode": code}

@app.get("/api/classrooms/{classroom_id}")
def get_classroom(classroom_id: int):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT code, name, subject, pdf_filename, teacher_id FROM classroom WHERE id = ?",
        (classroom_id,)
    )
    row = cursor.fetchone()
    conn.close()
    if row:
        code, name, subject, pdf_filename, teacher_id = row
        # For now, mock studentCount and activeQuizCount
        return {
            "classCode": code,
            "className": name,
            "subject": subject,
            "pdf_filename": pdf_filename,
            "teacherId": teacher_id,
            "studentCount": 2,
            "activeQuizCount": 0
        }
    return {"error": "Classroom not found"}

@app.post("/api/classrooms/join")
async def join_classroom(data: dict = Body(...)):
    code = data.get("code")
    student_name = data.get("studentName")
    if not code or not student_name:
        return {"success": False, "error": "Missing code or student name"}
    # Find classroom by code
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM classroom WHERE code = ?", (code,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return {"success": False, "error": "Classroom not found"}
    classroom_id = row[0]
    # Add student
    cursor.execute(
        "INSERT INTO students (name, classroom_id) VALUES (?, ?)",
        (student_name, classroom_id)
    )
    conn.commit()
    conn.close()
    return {"success": True, "classroomId": classroom_id}

@app.get("/api/classrooms/{classroom_id}/assignments")
def get_assignments(classroom_id: int):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, title, subject, difficulty, due_date, questions FROM assignments WHERE classroom_id = ?",
        (classroom_id,)
    )
    assignments = [
        {
            "id": row[0],
            "title": row[1],
            "subject": row[2],
            "difficulty": row[3],
            "dueDate": row[4],
            "questions": row[5],
        }
        for row in cursor.fetchall()
    ]
    conn.close()
    return {"assignments": assignments}

@app.post("/api/classrooms/{classroom_id}/generate-quiz")
async def generate_ai_quiz(classroom_id: int, data: dict = Body(...)):
    title = data.get("title", "AI Generated Quiz")
    subject = data.get("subject", "Mathematics")
    difficulty = data.get("difficulty", "Medium")
    due_date = data.get("due_date", "Due Soon")
    preview_questions = data.get("previewQuestions")
    num_questions = len(preview_questions) if preview_questions else data.get("questions", 5)

    # Use QuizAgent to generate or normalize questions
    if quiz_agent is not None:
        questions = quiz_agent.generate_questions(
            title=title,
            subject=subject,
            difficulty=difficulty,
            num_questions=num_questions,
            preview_questions=preview_questions,
        )
    else:
        # Fallback to the previous mock behaviour
        if preview_questions:
            questions = preview_questions
        else:
            questions = [
                {
                    "question": f"Sample question {i+1} for {title}",
                    "answer": f"Sample answer {i+1}",
                    "options": [f"Option {chr(65+j)}" for j in range(4)],
                }
                for i in range(num_questions)
            ]

    # Insert assignment
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO assignments (classroom_id, title, subject, difficulty, due_date, questions) VALUES (?, ?, ?, ?, ?, ?)",
        (classroom_id, title, subject, difficulty, due_date, len(questions))
    )
    assignment_id = cursor.lastrowid
    # Store questions
    for q in questions:
        options = q.get("options") or []
        if isinstance(options, list):
            options_str = ",".join(options)
        else:
            options_str = str(options)
        cursor.execute(
            "INSERT INTO questions (assignment_id, question, answer, options) VALUES (?, ?, ?, ?)",
            (assignment_id, q.get("question", ""), q.get("answer", ""), options_str)
        )
    conn.commit()
    conn.close()
    return {"success": True}

@app.post("/api/generate-quiz-questions")
async def generate_quiz_questions(data: dict = Body(...)):
    pdf_filename = data.get("pdf_filename")
    title = data.get("title", "AI Generated Quiz")
    subject = data.get("subject", "Mathematics")
    difficulty = data.get("difficulty", "Medium")
    num_questions = data.get("questions", 3)

    # Currently pdf_filename is not used; it can be
    # wired into the QuizAgent once curriculum parsing is added.
    if quiz_agent is not None:
        questions = quiz_agent.generate_questions(
            title=title,
            subject=subject,
            difficulty=difficulty,
            num_questions=num_questions,
            preview_questions=None,
        )
    else:
        # Fallback to previous mock behaviour
        questions = [
            {
                "question": f"What is the main concept in {subject} covered in {title}?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "answer": "Option A"
            },
            {
                "question": "Solve for x: 2x + 3 = 7.",
                "options": ["x=1", "x=2", "x=3", "x=4"],
                "answer": "x=2"
            },
            {
                "question": f"Which of the following best describes {difficulty} level content?",
                "options": ["Easy", "Medium", "Hard", "Expert"],
                "answer": difficulty
            }
        ]
    return {"questions": questions}

@app.get("/api/assignments/{assignment_id}/questions")
def get_assignment_questions(assignment_id: int):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, question, answer, options FROM questions WHERE assignment_id = ?",
        (assignment_id,)
    )
    questions = []
    for row in cursor.fetchall():
        qid, question, answer, options = row
        options_list = options.split(",") if options else []
        print(options_list)
        questions.append({
            "id": qid,
            "question": question,
            "answer": answer,
            "options": options_list
        })
    conn.close()
    return {"questions": questions}

@app.post("/api/quiz-submissions")
async def submit_quiz(data: dict = Body(...)):
    assignment_id = data.get("assignmentId")
    student_id = data.get("studentId")
    answers = data.get("answers", {})  # {questionIdx: answer}
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Get questions for assignment
    cursor.execute("SELECT id, answer FROM questions WHERE assignment_id = ?", (assignment_id,))
    question_rows = cursor.fetchall()
    total = len(question_rows)
    score = 0
    # Insert submission with status 'completed' (instead of 'pending')
    submitted_at = datetime.utcnow().isoformat()
    cursor.execute(
        "INSERT INTO submissions (assignment_id, student_id, submitted_at, score, total, status) VALUES (?, ?, ?, ?, ?, ?)",
        (assignment_id, student_id, submitted_at, 0, total, 'completed')
    )
    submission_id = cursor.lastrowid
    # Grade and insert answers
    for idx, (question_id, correct_answer) in enumerate(question_rows):
        student_answer = answers.get(str(idx), "")
        is_correct = int(student_answer.strip().lower() == (correct_answer or "").strip().lower())
        if is_correct:
            score += 1
        cursor.execute(
            "INSERT INTO submission_answers (submission_id, question_id, student_answer, is_correct) VALUES (?, ?, ?, ?)",
            (submission_id, question_id, student_answer, is_correct)
        )
    # Update score
    cursor.execute("UPDATE submissions SET score = ? WHERE id = ?", (score, submission_id))
    conn.commit()
    conn.close()
    return {"submissionId": submission_id}

@app.get("/api/quiz-submissions/{submission_id}")
def get_quiz_submission(submission_id: int):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT assignment_id, student_id, score, total, status FROM submissions WHERE id = ?", (submission_id,))
    sub = cursor.fetchone()
    if not sub:
        conn.close()
        return {"error": "Submission not found"}
    assignment_id, student_id, score, total, status = sub
    cursor.execute("""
        SELECT q.id, q.question, sa.student_answer, q.answer, sa.is_correct
        FROM submission_answers sa
        JOIN questions q ON sa.question_id = q.id
        WHERE sa.submission_id = ?
        ORDER BY q.id
    """, (submission_id,))
    questions = [
        {
            "id": row[0],
            "question": row[1],
            "studentAnswer": row[2],
            "correctAnswer": row[3],
            "isCorrect": bool(row[4]),
            # Optionally add explanation if you want
        }
        for row in cursor.fetchall()
    ]
    conn.close()
    return {"score": score, "total": total, "status": status, "questions": questions}

@app.get("/api/students/{student_id}/submissions")
def get_student_submissions(student_id: int):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, assignment_id, score, total, submitted_at, status FROM submissions WHERE student_id = ?",
        (student_id,)
    )
    submissions = [
        {
            "submissionId": row[0],
            "assignmentId": row[1],
            "score": row[2],
            "total": row[3],
            "submittedAt": row[4],
            "status": row[5],
        }
        for row in cursor.fetchall()
    ]
    conn.close()
    return {"submissions": submissions}
