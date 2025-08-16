from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx
import os
from typing import Optional
import jwt
from datetime import datetime, timedelta

app = FastAPI(title="StudyMate API Gateway", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Agent service URLs
AGENT_SERVICES = {
    "course-generation": os.getenv("COURSE_GENERATION_URL", "http://course-generation:8001"),
    "interview-coach": os.getenv("INTERVIEW_COACH_URL", "http://interview-coach:8002"),
    "chat-mentor": os.getenv("CHAT_MENTOR_URL", "http://chat-mentor:8003"),
    "progress-analyst": os.getenv("PROGRESS_ANALYST_URL", "http://progress-analyst:8004"),
    "resume-analyzer": os.getenv("RESUME_ANALYZER_URL", "http://resume-analyzer:8005"),
    "exam-prep": os.getenv("EXAM_PREP_URL", "http://exam-prep:8006"),
}

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def forward_to_agent(agent_name: str, path: str, method: str = "GET", data: dict = None, headers: dict = None):
    """Forward request to specific agent service"""
    if agent_name not in AGENT_SERVICES:
        raise HTTPException(status_code=404, detail=f"Agent {agent_name} not found")
    
    agent_url = AGENT_SERVICES[agent_name]
    url = f"{agent_url}{path}"
    
    async with httpx.AsyncClient() as client:
        if method == "GET":
            response = await client.get(url, headers=headers)
        elif method == "POST":
            response = await client.post(url, json=data, headers=headers)
        elif method == "PUT":
            response = await client.put(url, json=data, headers=headers)
        elif method == "DELETE":
            response = await client.delete(url, headers=headers)
        else:
            raise HTTPException(status_code=405, detail="Method not allowed")
    
    return response.json()

@app.get("/")
async def root():
    return {"message": "StudyMate API Gateway", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Authentication endpoints
@app.post("/auth/signin")
async def sign_in(credentials: dict):
    # For demo purposes, accept any email/password
    email = credentials.get("email")
    password = credentials.get("password")
    
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")
    
    # Create access token
    access_token = create_access_token(data={"sub": email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": email,
            "email": email,
            "name": email.split("@")[0].title()
        }
    }

@app.post("/auth/signup")
async def sign_up(user_data: dict):
    # For demo purposes, accept any registration
    email = user_data.get("email")
    password = user_data.get("password")
    name = user_data.get("name", email.split("@")[0].title() if email else "User")
    
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")
    
    # Create access token
    access_token = create_access_token(data={"sub": email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": email,
            "email": email,
            "name": name
        }
    }

@app.post("/auth/signout")
async def sign_out(user_id: str = Depends(verify_token)):
    return {"message": "Signed out successfully"}

# Course Generation Routes
@app.post("/courses/generate")
async def generate_course(course_data: dict, user_id: str = Depends(verify_token)):
    course_data["user_id"] = user_id
    return await forward_to_agent("course-generation", "/generate", "POST", course_data)

@app.get("/courses")
async def get_courses(user_id: str = Depends(verify_token)):
    return await forward_to_agent("course-generation", f"/courses?user_id={user_id}", "GET")

@app.get("/courses/{course_id}")
async def get_course(course_id: str, user_id: str = Depends(verify_token)):
    return await forward_to_agent("course-generation", f"/courses/{course_id}", "GET")

@app.get("/courses/{course_id}/content")
async def get_course_content(course_id: str, user_id: str = Depends(verify_token)):
    return await forward_to_agent("course-generation", f"/courses/{course_id}/content", "GET")

# Interview Routes
@app.post("/interviews/start")
async def start_interview(interview_data: dict, user_id: str = Depends(verify_token)):
    interview_data["user_id"] = user_id
    return await forward_to_agent("interview-coach", "/start", "POST", interview_data)

@app.get("/interviews")
async def get_interviews(user_id: str = Depends(verify_token)):
    return await forward_to_agent("interview-coach", f"/interviews?user_id={user_id}", "GET")

@app.get("/interviews/{interview_id}")
async def get_interview(interview_id: str, user_id: str = Depends(verify_token)):
    return await forward_to_agent("interview-coach", f"/interviews/{interview_id}", "GET")

@app.post("/interviews/{interview_id}/analyze")
async def analyze_interview(interview_id: str, analysis_data: dict, user_id: str = Depends(verify_token)):
    return await forward_to_agent("interview-coach", f"/interviews/{interview_id}/analyze", "POST", analysis_data)

# Chat Routes
@app.post("/chat/message")
async def send_message(message_data: dict, user_id: str = Depends(verify_token)):
    message_data["user_id"] = user_id
    return await forward_to_agent("chat-mentor", "/message", "POST", message_data)

# Progress Routes
@app.get("/progress")
async def get_progress(user_id: str = Depends(verify_token)):
    return await forward_to_agent("progress-analyst", f"/progress?user_id={user_id}", "GET")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)