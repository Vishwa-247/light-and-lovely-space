from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Add parent directories to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from shared.database.connection import init_database, close_database, get_mock_interviews_collection, get_interview_questions_collection, get_interview_analysis_collection
from shared.models.schemas import MockInterview, InterviewQuestion, InterviewAnalysis, InterviewStartRequest, InterviewStartResponse, APIResponse, FacialData, Recommendation
import google.generativeai as genai
import json
from datetime import datetime
from bson import ObjectId
import uuid
import random

app = FastAPI(title="Interview Coach Agent", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')

@app.on_event("startup")
async def startup_event():
    await init_database()

@app.on_event("shutdown")
async def shutdown_event():
    await close_database()

def serialize_doc(doc):
    """Convert MongoDB document to JSON serializable format"""
    if doc is None:
        return None
    if isinstance(doc, list):
        return [serialize_doc(d) for d in doc]
    if isinstance(doc, dict):
        result = {}
        for key, value in doc.items():
            if key == "_id":
                result["id"] = str(value)
            elif isinstance(value, ObjectId):
                result[key] = str(value)
            elif isinstance(value, datetime):
                result[key] = value.isoformat()
            elif isinstance(value, dict):
                result[key] = serialize_doc(value)
            elif isinstance(value, list):
                result[key] = serialize_doc(value)
            else:
                result[key] = value
        return result
    return doc

async def generate_interview_questions(job_role: str, tech_stack: str, experience: str, question_count: int = 5):
    """Generate interview questions using AI"""
    
    prompt = f"""
    Generate {question_count} interview questions for a {job_role} position with {experience} experience in {tech_stack}.
    
    Mix of question types:
    - Technical questions (40%)
    - Behavioral questions (30%)
    - Problem-solving questions (30%)
    
    Return a JSON array of questions with this structure:
    [
        {{
            "question": "Your question here",
            "type": "technical|behavioral|problem_solving",
            "difficulty": "easy|medium|hard",
            "expected_answer": "Brief outline of what a good answer should include",
            "evaluation_criteria": ["criteria1", "criteria2", "criteria3"]
        }}
    ]
    
    Make questions relevant to {job_role} and {tech_stack}. Consider {experience} level for difficulty.
    """
    
    try:
        if GEMINI_API_KEY and model:
            response = model.generate_content(prompt)
            content_text = response.text.strip()
            
            # Clean up the response to extract JSON
            if content_text.startswith("```json"):
                content_text = content_text[7:]
            if content_text.endswith("```"):
                content_text = content_text[:-3]
            
            questions = json.loads(content_text)
            return questions
        else:
            return generate_fallback_questions(job_role, tech_stack, experience, question_count)
    except Exception as e:
        print(f"Error generating questions with AI: {e}")
        return generate_fallback_questions(job_role, tech_stack, experience, question_count)

def generate_fallback_questions(job_role: str, tech_stack: str, experience: str, question_count: int):
    """Generate fallback questions when AI is not available"""
    
    technical_questions = [
        f"Explain the key concepts of {tech_stack} that are essential for a {job_role}.",
        f"How would you optimize performance in a {tech_stack} application?",
        f"What are the best practices for {tech_stack} development?",
        f"Describe a challenging technical problem you solved using {tech_stack}.",
        f"How do you handle error handling and debugging in {tech_stack}?"
    ]
    
    behavioral_questions = [
        f"Tell me about a time when you had to learn a new technology quickly as a {job_role}.",
        "Describe a situation where you had to work with a difficult team member.",
        "How do you prioritize tasks when working on multiple projects?",
        "Tell me about a time when you made a mistake. How did you handle it?",
        "Describe your approach to staying updated with new technologies."
    ]
    
    problem_solving_questions = [
        f"How would you design a scalable system for a {job_role} position?",
        "Walk me through your problem-solving process when facing a complex technical challenge.",
        f"How would you approach debugging a performance issue in {tech_stack}?",
        "Describe how you would implement a feature with tight deadlines.",
        "How do you ensure code quality in your projects?"
    ]
    
    all_questions = technical_questions + behavioral_questions + problem_solving_questions
    selected_questions = random.sample(all_questions, min(question_count, len(all_questions)))
    
    questions = []
    for i, q in enumerate(selected_questions):
        question_type = "technical" if i < len(technical_questions) and q in technical_questions else \
                       "behavioral" if q in behavioral_questions else "problem_solving"
        
        questions.append({
            "question": q,
            "type": question_type,
            "difficulty": "medium",
            "expected_answer": f"A good answer should demonstrate understanding of {tech_stack} and {job_role} responsibilities.",
            "evaluation_criteria": ["Technical accuracy", "Communication clarity", "Problem-solving approach"]
        })
    
    return questions

@app.post("/start", response_model=InterviewStartResponse)
async def start_interview(request: InterviewStartRequest):
    """Start a new mock interview"""
    try:
        interview_id = str(uuid.uuid4())
        user_id = request.dict().get("user_id", "demo_user")
        
        # Generate questions
        questions_data = await generate_interview_questions(
            request.job_role,
            request.tech_stack,
            request.experience,
            request.question_count
        )
        
        # Create interview document
        interview_doc = {
            "_id": interview_id,
            "user_id": user_id,
            "job_role": request.job_role,
            "tech_stack": request.tech_stack,
            "experience": request.experience,
            "interview_type": request.interview_type,
            "questions": [],
            "completed": False,
            "analysis_id": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Insert interview
        interviews_collection = await get_mock_interviews_collection()
        await interviews_collection.insert_one(interview_doc)
        
        # Insert questions
        questions_collection = await get_interview_questions_collection()
        interview_questions = []
        question_ids = []
        
        for i, q_data in enumerate(questions_data):
            question_id = str(uuid.uuid4())
            question_doc = {
                "_id": question_id,
                "interview_id": interview_id,
                "question": q_data["question"],
                "user_answer": None,
                "expected_answer": q_data.get("expected_answer"),
                "order_number": i + 1,
                "question_type": q_data.get("type", "technical"),
                "difficulty": q_data.get("difficulty", "medium"),
                "evaluation_criteria": q_data.get("evaluation_criteria", []),
                "created_at": datetime.utcnow()
            }
            
            await questions_collection.insert_one(question_doc)
            question_ids.append(question_id)
            interview_questions.append(InterviewQuestion(**serialize_doc(question_doc)))
        
        # Update interview with question IDs
        await interviews_collection.update_one(
            {"_id": interview_id},
            {"$set": {"questions": question_ids}}
        )
        
        return InterviewStartResponse(
            interview_id=interview_id,
            questions=interview_questions,
            estimated_duration=request.question_count * 3  # 3 minutes per question
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start interview: {str(e)}")

@app.get("/interviews")
async def get_user_interviews(user_id: str):
    """Get all interviews for a user"""
    try:
        interviews_collection = await get_mock_interviews_collection()
        cursor = interviews_collection.find({"user_id": user_id}).sort("created_at", -1)
        interviews = await cursor.to_list(length=100)
        
        return APIResponse(
            success=True,
            data=serialize_doc(interviews)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch interviews: {str(e)}")

@app.get("/interviews/{interview_id}")
async def get_interview(interview_id: str):
    """Get a specific interview with questions"""
    try:
        interviews_collection = await get_mock_interviews_collection()
        questions_collection = await get_interview_questions_collection()
        
        interview = await interviews_collection.find_one({"_id": interview_id})
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        # Get questions
        cursor = questions_collection.find({"interview_id": interview_id}).sort("order_number", 1)
        questions = await cursor.to_list(length=100)
        
        response_data = serialize_doc(interview)
        response_data["questions"] = serialize_doc(questions)
        
        return APIResponse(
            success=True,
            data=response_data
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch interview: {str(e)}")

@app.post("/interviews/{interview_id}/analyze")
async def analyze_interview(interview_id: str, analysis_data: dict):
    """Analyze completed interview"""
    try:
        # Generate mock analysis data for now
        # In production, this would use ML models for facial analysis, speech analysis, etc.
        
        analysis_id = str(uuid.uuid4())
        
        # Simulate facial data analysis
        facial_data = FacialData(
            confident=random.uniform(0.6, 0.9),
            stressed=random.uniform(0.1, 0.3),
            hesitant=random.uniform(0.1, 0.3),
            nervous=random.uniform(0.1, 0.4),
            excited=random.uniform(0.2, 0.6)
        )
        
        # Generate recommendations
        recommendations = [
            Recommendation(
                title="Improve Technical Communication",
                description="Practice explaining complex technical concepts in simpler terms.",
                link="https://example.com/technical-communication"
            ),
            Recommendation(
                title="Confidence Building",
                description="Work on maintaining confident body language and clear speech.",
                link="https://example.com/confidence-building"
            )
        ]
        
        # Calculate scores
        technical_score = random.uniform(70, 90)
        communication_score = random.uniform(65, 85)
        confidence_score = facial_data.confident * 100
        overall_score = (technical_score + communication_score + confidence_score) / 3
        
        analysis_doc = {
            "_id": analysis_id,
            "interview_id": interview_id,
            "facial_data": facial_data.dict(),
            "pronunciation_feedback": "Generally clear pronunciation with good pace. Consider slowing down when explaining complex topics.",
            "technical_feedback": "Strong technical knowledge demonstrated. Could improve on providing more concrete examples.",
            "language_feedback": "Good use of technical vocabulary. Consider using simpler language when explaining concepts.",
            "recommendations": [r.dict() for r in recommendations],
            "overall_score": overall_score,
            "technical_score": technical_score,
            "communication_score": communication_score,
            "confidence_score": confidence_score,
            "created_at": datetime.utcnow()
        }
        
        # Insert analysis
        analysis_collection = await get_interview_analysis_collection()
        await analysis_collection.insert_one(analysis_doc)
        
        # Update interview as completed
        interviews_collection = await get_mock_interviews_collection()
        await interviews_collection.update_one(
            {"_id": interview_id},
            {
                "$set": {
                    "completed": True,
                    "analysis_id": analysis_id,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return APIResponse(
            success=True,
            data=serialize_doc(analysis_doc)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze interview: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "agent": "interview-coach"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)