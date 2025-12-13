from fastapi import FastAPI, UploadFile, File, Request, Body, Form
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

quiz_agent = QuizAgent() if QuizAgent is not None else None
curriculum_agent = CurriculumAgent() if "CurriculumAgent" in globals() and CurriculumAgent is not None else None
print(curriculum_agent)

# Ensure classroom table exists
def ensure_classroom_table():
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS classroom (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            subject TEXT NOT NULL,
            code TEXT NOT NULL UNIQUE,
            pdf_filename TEXT,
            teacher_id TEXT
        )
    ''')
    conn.commit()
    conn.close()

@app.post("/trigger")
def trigger():
    return JSONResponse(content={"message": "Backend function triggered!"})

@app.post("/api/upload/curriculum")
async def upload_curriculum(file: UploadFile = File(...)):
    pdf_bytes = await file.read()
    if curriculum_agent is not None:
        result = curriculum_agent.extract_curriculum(pdf_bytes=pdf_bytes, filename=file.filename)
        return JSONResponse(content=result)
    # Fallback to mock data
    return JSONResponse(content={
        "topics": ["Algebra123", "Geometry", "Statistics", "Trigonometry", "Calculus Basics"],
        "learningObjectives": [
            "Understand basic algebraic expressions",
            "Learn geometric shapes and properties",
            "Analyze statistical data",
            "Master trigonometric functions",
            "Introduction to calculus"
        ]
    })

# Endpoint to create a classroom
@app.post("/api/classrooms")
async def create_classroom(
    name: str = Form(...),
    subject: str = Form(...),
    code: str = Form(...),
    pdf_filename: str = Form(None),
    teacher_id: str = Form(None)
):
    ensure_classroom_table()
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO classroom (name, subject, code, pdf_filename, teacher_id) VALUES (?, ?, ?, ?, ?)",
        (name, subject, code, pdf_filename, teacher_id)
    )
    classroom_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return {"success": True, "classroomId": classroom_id, "classCode": code}

# Endpoint to get all classrooms for teacher_id=1
@app.get("/api/teacher/1/classrooms")
def get_teacher_classrooms():
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, subject, code, pdf_filename, teacher_id FROM classroom WHERE teacher_id = ?", ("1",))
    classrooms = [
        {
            "id": row[0],
            "name": row[1],
            "subject": row[2],
            "code": row[3],
            "pdf_filename": row[4],
            "teacher_id": row[5],
        }
        for row in cursor.fetchall()
    ]
    conn.close()
    return {"classrooms": classrooms}