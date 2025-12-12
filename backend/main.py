from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import sqlite3
from pathlib import Path

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize SQLite database and create 'classroom' table if it doesn't exist
DB_PATH = Path(__file__).parent / 'database.db'
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()
cursor.execute('''
    CREATE TABLE IF NOT EXISTS classroom (
        id INTEGER PRIMARY KEY,
        code TEXT,
        name TEXT,
        pdf_filename TEXT,
        teacher_id TEXT
    )
''')
conn.commit()
conn.close()

@app.post("/trigger")
def trigger():
    return JSONResponse(content={"message": "Backend function triggered!"})
