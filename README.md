# Next.js + FastAPI Monorepo

This project contains a Next.js frontend and a FastAPI backend.

## Getting Started

### Frontend (Next.js)

1. Open a terminal in the `frontend` directory.
2. Run `npm install` to install dependencies.
3. Run `npm run dev` to start the development server.

### Backend (FastAPI)

1. Open a terminal in the `backend` directory.
2. (Optional) Create a virtual environment: `python -m venv venv && venv\Scripts\activate`
3. Install dependencies: `pip install -r requirements.txt`
4. Run the server: `uvicorn main:app --reload`

## How it works
- The Next.js app has a button that calls the FastAPI backend.
- The FastAPI backend exposes an endpoint that the frontend calls.