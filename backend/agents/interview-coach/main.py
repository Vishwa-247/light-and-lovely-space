from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from typing import Dict, Any
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Interview Coach Service - Supabase Edition")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/start")
async def start_interview(interview_data: Dict[str, Any]):
    """Start a mock interview (placeholder implementation)"""
    try:
        logger.info(f"🎯 Starting interview for role: {interview_data.get('job_role', 'Unknown')}")
        
        result = {
            "success": True,
            "interview_id": f"interview_{int(datetime.now().timestamp())}",
            "job_role": interview_data.get("job_role", "Software Engineer"),
            "questions": [
                {"id": "q1", "question": "Tell me about yourself", "type": "behavioral", "order": 1}
            ],
            "estimated_duration": 30,
            "status": "started",
            "created_at": datetime.now().isoformat()
        }
        
        return result
        
    except Exception as e:
        logger.error(f"💥 Error starting interview: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "interview-coach-supabase", "version": "2.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)