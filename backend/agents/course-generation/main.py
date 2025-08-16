from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Add parent directories to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from shared.database.connection import init_database, close_database, get_courses_collection, get_chapters_collection
from shared.models.schemas import Course, Chapter, CourseGenerationRequest, CourseGenerationResponse, APIResponse
import google.generativeai as genai
import json
import asyncio
from datetime import datetime
from bson import ObjectId
import uuid

app = FastAPI(title="Course Generation Agent", version="1.0.0")

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

async def generate_course_content_with_ai(topic: str, purpose: str, difficulty: str):
    """Generate course content using Gemini AI"""
    
    prompt = f"""
    You are an expert curriculum designer AI for StudyMate platform. Generate a comprehensive course on "{topic}" for {purpose} preparation at {difficulty} level.

    The output MUST be a single, valid JSON object. Do not include any text outside of the JSON.

    Generate content using this JSON structure:
    {{
        "topic": "{topic}",
        "summary": "A brief 2-3 sentence summary of what the course covers",
        "mainContent": {{
            "introduction": "An engaging introduction to the topic",
            "sections": [
                {{
                    "title": "Section title",
                    "content": "Detailed explanation with examples and practical applications",
                    "examples": ["Example 1", "Example 2"],
                    "keyPoints": ["Key point 1", "Key point 2"]
                }}
            ]
        }},
        "chapters": [
            {{
                "title": "Chapter 1 Title",
                "content": "Comprehensive chapter content with explanations and examples",
                "order_number": 1,
                "duration_minutes": 30,
                "learning_objectives": ["Objective 1", "Objective 2"]
            }}
        ],
        "flashcards": [
            {{
                "question": "What is...?",
                "answer": "Concise answer",
                "difficulty": "{difficulty}"
            }}
        ],
        "mcqs": [
            {{
                "question": "Multiple choice question?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correct_answer": "Option A",
                "explanation": "Why this answer is correct"
            }}
        ],
        "qnas": [
            {{
                "question": "Common question about the topic?",
                "answer": "Detailed answer with examples"
            }}
        ],
        "mindMap": {{
            "root": {{
                "name": "{topic}",
                "children": [
                    {{
                        "name": "Main concept 1",
                        "children": [
                            {{"name": "Sub-concept 1.1"}},
                            {{"name": "Sub-concept 1.2"}}
                        ]
                    }}
                ]
            }}
        }},
        "resources": [
            {{
                "title": "Resource title",
                "type": "video|article|book|website",
                "url": "https://example.com",
                "description": "Brief description"
            }}
        ]
    }}

    Ensure the content is:
    - Appropriate for {difficulty} level learners
    - Focused on {purpose} preparation
    - Practical and actionable
    - Well-structured and comprehensive
    - Include at least 3 chapters, 10 flashcards, 10 MCQs, and 5 Q&As
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
            
            parsed_content = json.loads(content_text)
            return parsed_content
        else:
            # Fallback content for development
            return generate_fallback_content(topic, purpose, difficulty)
    except Exception as e:
        print(f"Error generating content with AI: {e}")
        return generate_fallback_content(topic, purpose, difficulty)

def generate_fallback_content(topic: str, purpose: str, difficulty: str):
    """Generate fallback content when AI is not available"""
    return {
        "topic": topic,
        "summary": f"A comprehensive {difficulty} level course on {topic} designed for {purpose} preparation.",
        "mainContent": {
            "introduction": f"Welcome to this {difficulty} level course on {topic}. This course is specifically designed to help you excel in {purpose}.",
            "sections": [
                {
                    "title": f"Introduction to {topic}",
                    "content": f"This section provides a foundational understanding of {topic} concepts and principles.",
                    "examples": [f"Basic {topic} example", f"Real-world {topic} application"],
                    "keyPoints": [f"Key concept 1 of {topic}", f"Key concept 2 of {topic}"]
                },
                {
                    "title": f"Advanced {topic} Concepts",
                    "content": f"Dive deeper into advanced {topic} topics and practical applications.",
                    "examples": [f"Advanced {topic} example", f"Complex {topic} scenario"],
                    "keyPoints": [f"Advanced concept 1", f"Advanced concept 2"]
                }
            ]
        },
        "chapters": [
            {
                "title": f"Fundamentals of {topic}",
                "content": f"Learn the basic principles and concepts of {topic}. This chapter covers essential knowledge needed for {purpose}.",
                "order_number": 1,
                "duration_minutes": 45,
                "learning_objectives": [f"Understand basic {topic} concepts", f"Apply {topic} principles"]
            },
            {
                "title": f"Practical {topic} Applications",
                "content": f"Explore real-world applications of {topic} with hands-on examples and case studies.",
                "order_number": 2,
                "duration_minutes": 60,
                "learning_objectives": [f"Apply {topic} in practice", "Solve real-world problems"]
            },
            {
                "title": f"Advanced {topic} Techniques",
                "content": f"Master advanced {topic} techniques and best practices for {purpose} success.",
                "order_number": 3,
                "duration_minutes": 75,
                "learning_objectives": [f"Master advanced {topic}", "Optimize performance"]
            }
        ],
        "flashcards": [
            {"question": f"What is {topic}?", "answer": f"{topic} is a fundamental concept in the field.", "difficulty": difficulty},
            {"question": f"Why is {topic} important?", "answer": f"{topic} is important because it enables effective problem-solving.", "difficulty": difficulty},
            {"question": f"How do you implement {topic}?", "answer": f"{topic} can be implemented through systematic approaches.", "difficulty": difficulty}
        ],
        "mcqs": [
            {
                "question": f"What is the primary purpose of {topic}?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correct_answer": "Option A",
                "explanation": "This is the correct answer because..."
            }
        ],
        "qnas": [
            {
                "question": f"How can I get started with {topic}?",
                "answer": f"To get started with {topic}, begin by understanding the fundamentals and practicing with simple examples."
            }
        ],
        "mindMap": {
            "root": {
                "name": topic,
                "children": [
                    {
                        "name": "Fundamentals",
                        "children": [
                            {"name": "Basic Concepts"},
                            {"name": "Core Principles"}
                        ]
                    },
                    {
                        "name": "Applications",
                        "children": [
                            {"name": "Real-world Use Cases"},
                            {"name": "Best Practices"}
                        ]
                    }
                ]
            }
        },
        "resources": [
            {
                "title": f"Official {topic} Documentation",
                "type": "website",
                "url": "https://example.com",
                "description": f"Comprehensive guide to {topic}"
            }
        ]
    }

@app.post("/generate", response_model=CourseGenerationResponse)
async def generate_course(request: CourseGenerationRequest, background_tasks: BackgroundTasks):
    """Generate a new course"""
    try:
        course_id = str(uuid.uuid4())
        
        # Create initial course document
        course_data = {
            "_id": course_id,
            "user_id": request.dict().get("user_id", "demo_user"),
            "title": request.course_name,
            "purpose": request.purpose,
            "difficulty": request.difficulty,
            "summary": f"AI-generated course on {request.course_name}",
            "content": {
                "status": "generating",
                "message": "Course generation in progress...",
                "last_updated": datetime.utcnow()
            },
            "progress": {
                "current_chapter": 0,
                "completion_percentage": 0.0,
                "last_accessed": datetime.utcnow()
            },
            "adaptations": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        courses_collection = await get_courses_collection()
        await courses_collection.insert_one(course_data)
        
        # Generate content in background
        background_tasks.add_task(
            generate_course_content_background,
            course_id,
            request.course_name,
            request.purpose,
            request.difficulty
        )
        
        return CourseGenerationResponse(
            course_id=course_id,
            status="generating",
            message="Course generation started successfully",
            estimated_completion_time=5
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start course generation: {str(e)}")

async def generate_course_content_background(course_id: str, topic: str, purpose: str, difficulty: str):
    """Background task to generate course content"""
    try:
        # Simulate some processing time
        await asyncio.sleep(2)
        
        # Generate content using AI
        generated_content = await generate_course_content_with_ai(topic, purpose, difficulty)
        
        # Update course with generated content
        courses_collection = await get_courses_collection()
        chapters_collection = await get_chapters_collection()
        
        # Insert chapters
        for chapter_data in generated_content.get("chapters", []):
            chapter_doc = {
                "_id": str(uuid.uuid4()),
                "course_id": course_id,
                "title": chapter_data["title"],
                "content": chapter_data["content"],
                "order_number": chapter_data["order_number"],
                "json_content": {
                    "duration_minutes": chapter_data.get("duration_minutes", 30),
                    "learning_objectives": chapter_data.get("learning_objectives", []),
                    "examples": chapter_data.get("examples", []),
                    "key_points": chapter_data.get("key_points", [])
                },
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            await chapters_collection.insert_one(chapter_doc)
        
        # Update course status
        await courses_collection.update_one(
            {"_id": course_id},
            {
                "$set": {
                    "content": {
                        "status": "complete",
                        "message": "Course generated successfully",
                        "last_updated": datetime.utcnow(),
                        "parsed_content": generated_content
                    },
                    "summary": generated_content.get("summary", f"Course on {topic}"),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        print(f"Course {course_id} generated successfully")
        
    except Exception as e:
        # Update course with error status
        courses_collection = await get_courses_collection()
        await courses_collection.update_one(
            {"_id": course_id},
            {
                "$set": {
                    "content": {
                        "status": "error",
                        "message": f"Failed to generate course: {str(e)}",
                        "last_updated": datetime.utcnow()
                    },
                    "updated_at": datetime.utcnow()
                }
            }
        )
        print(f"Error generating course {course_id}: {e}")

@app.get("/courses")
async def get_user_courses(user_id: str):
    """Get all courses for a user"""
    try:
        courses_collection = await get_courses_collection()
        cursor = courses_collection.find({"user_id": user_id}).sort("created_at", -1)
        courses = await cursor.to_list(length=100)
        
        return APIResponse(
            success=True,
            data=serialize_doc(courses)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch courses: {str(e)}")

@app.get("/courses/{course_id}")
async def get_course(course_id: str):
    """Get a specific course"""
    try:
        courses_collection = await get_courses_collection()
        course = await courses_collection.find_one({"_id": course_id})
        
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        return APIResponse(
            success=True,
            data=serialize_doc(course)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch course: {str(e)}")

@app.get("/courses/{course_id}/content")
async def get_course_content(course_id: str):
    """Get course content including chapters"""
    try:
        courses_collection = await get_courses_collection()
        chapters_collection = await get_chapters_collection()
        
        course = await courses_collection.find_one({"_id": course_id})
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Get chapters
        cursor = chapters_collection.find({"course_id": course_id}).sort("order_number", 1)
        chapters = await cursor.to_list(length=100)
        
        response_data = serialize_doc(course)
        response_data["chapters"] = serialize_doc(chapters)
        
        return APIResponse(
            success=True,
            data=response_data
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch course content: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "agent": "course-generation"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)