from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from typing import Dict, Any
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Course Generation Service - Supabase Edition")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/generate")
async def generate_course(course_data: Dict[str, Any]):
    """Generate a course (placeholder implementation)"""
    try:
        logger.info(f"📚 Generating course: {course_data.get('course_name', 'Unknown')}")
        
        result = {
            "success": True,
            "course_id": f"course_{int(datetime.now().timestamp())}",
            "course_name": course_data.get("course_name", "Generated Course"),
            "status": "generation_started",
            "message": "Course generation has been initiated",
            "estimated_completion_time": 15,
            "created_at": datetime.now().isoformat()
        }
        
        return result
        
    except Exception as e:
        logger.error(f"💥 Error generating course: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "course-generation-supabase", "version": "2.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)