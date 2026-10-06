# Airbnb Clone

A full-stack Airbnb clone built for a Full-Stack SDE assignment.

## Tech Stack
- **Frontend**: Next.js (App Router, TypeScript, Tailwind CSS)
- **Backend**: FastAPI, SQLAlchemy, SQLite

## Structure
- `/frontend`: Next.js frontend application
- `/backend`: FastAPI backend application

## Running Locally

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
