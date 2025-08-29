import json
import logging
import os
import tempfile
from datetime import datetime
from typing import Any, Dict, Optional

import httpx
import PyPDF2
from bson import ObjectId
from docx import Document
from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from groq import Groq
from motor.motor_asyncio import AsyncIOMotorClient

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Profile Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Environment variables
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://root:password@mongodb:27017/studymate?authSource=admin")

# Initialize Groq client
groq_client = Groq(api_key=GROQ_API_KEY)

# MongoDB connection
client = None
db = None

@app.on_event("startup")
async def startup_db_client():
    global client, db
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client.studymate
    logger.info("Connected to MongoDB")

@app.on_event("shutdown")
async def shutdown_db_client():
    if client:
        client.close()
        logger.info("Disconnected from MongoDB")

def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF file"""
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        return text
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to extract text from PDF")

def extract_text_from_docx(file_path: str) -> str:
    """Extract text from DOCX file"""
    try:
        doc = Document(file_path)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text
    except Exception as e:
        logger.error(f"Error extracting text from DOCX: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to extract text from DOCX")

def extract_text_from_doc(file_path: str) -> str:
    """Extract text from DOC file (simplified approach)"""
    try:
        # For .doc files, we'll use a simple text extraction
        # In production, consider using python-docx2txt or other libraries
        with open(file_path, 'rb') as file:
            content = file.read()
            # Basic text extraction (this is simplified)
            text = content.decode('utf-8', errors='ignore')
        return text
    except Exception as e:
        logger.error(f"Error extracting text from DOC: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to extract text from DOC")

async def parse_resume_with_groq(resume_text: str) -> Dict[str, Any]:
    """Parse resume using Groq AI"""
    try:
        prompt = f"""
        Extract the following information from this resume and return it as a valid JSON object:

        {{
            "personalInfo": {{
                "fullName": "Full name",
                "email": "Email address",
                "phone": "Phone number",
                "location": "Location/Address",
                "linkedin": "LinkedIn profile URL",
                "github": "GitHub profile URL",
                "portfolio": "Portfolio/Website URL"
            }},
            "education": [
                {{
                    "institution": "University/School name",
                    "degree": "Degree type",
                    "field": "Field of study",
                    "startYear": "Start year",
                    "endYear": "End year",
                    "grade": "GPA/Grade"
                }}
            ],
            "experience": [
                {{
                    "company": "Company name",
                    "position": "Job title",
                    "startDate": "Start date",
                    "endDate": "End date",
                    "current": false,
                    "description": "Job description",
                    "technologies": ["tech1", "tech2"],
                    "location": "Job location"
                }}
            ],
            "projects": [
                {{
                    "title": "Project name",
                    "description": "Project description",
                    "technologies": ["tech1", "tech2"],
                    "startDate": "Start date",
                    "endDate": "End date",
                    "githubUrl": "GitHub URL",
                    "liveUrl": "Live demo URL",
                    "highlights": ["achievement1", "achievement2"]
                }}
            ],
            "skills": [
                {{
                    "name": "Skill name",
                    "level": "Beginner|Intermediate|Advanced|Expert",
                    "category": "Technical|Soft|Language|Framework|Tool"
                }}
            ],
            "certifications": [
                {{
                    "name": "Certification name",
                    "issuer": "Issuing organization",
                    "issueDate": "Issue date",
                    "expiryDate": "Expiry date",
                    "credentialId": "Credential ID",
                    "credentialUrl": "Credential URL"
                }}
            ],
            "achievements": [
                "Achievement 1",
                "Achievement 2"
            ],
            "languages": [
                "Language 1",
                "Language 2"
            ],
            "interests": [
                "Interest 1",
                "Interest 2"
            ],
            "summary": "Professional summary or objective"
        }}

        Resume text:
        {resume_text}

        Return only valid JSON. If any field is not found, use null or empty array as appropriate.
        """

        response = groq_client.chat.completions.create(
            model="meta-llama/llama-3.1-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that extracts structured data from resumes. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=2000
        )

        parsed_data = json.loads(response.choices[0].message.content)
        return parsed_data

    except Exception as e:
        logger.error(f"Error parsing resume with Groq: {str(e)}")
        # Return empty structure on error
        return {
            "personalInfo": {},
            "education": [],
            "experience": [],
            "projects": [],
            "skills": [],
            "certifications": [],
            "achievements": [],
            "languages": [],
            "interests": [],
            "summary": ""
        }

@app.post("/extract-profile")
async def extract_profile(
    resume: UploadFile = File(...),
    user_id: str = Form(...)
):
    """Extract profile data from uploaded resume"""
    try:
        # Validate file type
        allowed_types = ["application/pdf", "application/msword", 
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
        
        if resume.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Invalid file type. Only PDF, DOC, and DOCX are supported.")

        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{resume.filename.split('.')[-1]}") as temp_file:
            content = await resume.read()
            temp_file.write(content)
            temp_file_path = temp_file.name

        try:
            # Extract text based on file type
            if resume.content_type == "application/pdf":
                extracted_text = extract_text_from_pdf(temp_file_path)
            elif resume.content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                extracted_text = extract_text_from_docx(temp_file_path)
            else:  # DOC file
                extracted_text = extract_text_from_doc(temp_file_path)

            # Parse with Groq AI
            parsed_data = await parse_resume_with_groq(extracted_text)

            # Add metadata
            resume_data = {
                "filename": resume.filename,
                "uploadDate": datetime.utcnow().isoformat(),
                "extractedText": extracted_text,
                "aiAnalysis": "Resume successfully processed and data extracted",
                "skillGaps": [],  # Can be enhanced with job role comparison
                "recommendations": ["Complete missing profile sections", "Add more project details"]
            }

            # Store in MongoDB
            profile_data = {
                "userId": user_id,
                "personalInfo": parsed_data.get("personalInfo", {}),
                "education": parsed_data.get("education", []),
                "experience": parsed_data.get("experience", []),
                "projects": parsed_data.get("projects", []),
                "skills": parsed_data.get("skills", []),
                "certifications": parsed_data.get("certifications", []),
                "resumeData": resume_data,
                "achievements": parsed_data.get("achievements", []),
                "languages": parsed_data.get("languages", []),
                "interests": parsed_data.get("interests", []),
                "summary": parsed_data.get("summary", ""),
                "completionPercentage": 85,  # Calculate based on filled fields
                "createdAt": datetime.utcnow().isoformat(),
                "updatedAt": datetime.utcnow().isoformat()
            }

            # Upsert profile in MongoDB
            await db.profiles.update_one(
                {"userId": user_id},
                {"$set": profile_data},
                upsert=True
            )

            return {
                "success": True,
                "message": "Profile extracted successfully",
                "data": profile_data
            }

        finally:
            # Clean up temporary file
            os.unlink(temp_file_path)

    except Exception as e:
        logger.error(f"Error extracting profile: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to extract profile: {str(e)}")

@app.get("/profile/{user_id}")
async def get_profile(user_id: str):
    """Get user profile by ID"""
    try:
        profile = await db.profiles.find_one({"userId": user_id})
        if not profile:
            # Return empty profile structure
            return {
                "userId": user_id,
                "personalInfo": {},
                "education": [],
                "experience": [],
                "projects": [],
                "skills": [],
                "certifications": [],
                "resumeData": None,
                "completionPercentage": 0,
                "createdAt": datetime.utcnow().isoformat(),
                "updatedAt": datetime.utcnow().isoformat()
            }
        
        # Convert ObjectId to string
        profile["_id"] = str(profile["_id"])
        return profile

    except Exception as e:
        logger.error(f"Error getting profile: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get profile: {str(e)}")

@app.put("/profile/{user_id}")
async def update_profile(user_id: str, profile_data: dict):
    """Update user profile"""
    try:
        profile_data["updatedAt"] = datetime.utcnow().isoformat()
        
        result = await db.profiles.update_one(
            {"userId": user_id},
            {"$set": profile_data},
            upsert=True
        )

        return {"success": True, "message": "Profile updated successfully"}

    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "profile-service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8006)
