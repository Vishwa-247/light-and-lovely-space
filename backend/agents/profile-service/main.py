from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from typing import Optional, Dict, Any
import PyPDF2
import docx
import io
import json
from datetime import datetime
import logging
import sys
sys.path.append('/app/shared')
from database.supabase_connection import (
    init_database, close_database, get_user_profile, create_user_profile,
    update_user_profile, save_user_education, save_user_experience,
    save_user_projects, save_user_skills, save_user_certifications,
    get_user_education, get_user_experience, get_user_projects,
    get_user_skills, get_user_certifications, health_check as db_health_check
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Profile Service - Supabase Edition")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AI Configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

# Initialize Groq client
groq_client = None
if GROQ_API_KEY:
    try:
        from groq import Groq
        groq_client = Groq(api_key=GROQ_API_KEY)
        logger.info("✅ Groq client initialized successfully")
    except ImportError:
        logger.warning("⚠️ Groq library not installed")

@app.on_event("startup")
async def startup_event():
    """Initialize database connection on startup"""
    try:
        await init_database()
        logger.info("🚀 Profile Service started successfully")
    except Exception as e:
        logger.error(f"❌ Failed to initialize database: {e}")
        raise e

@app.on_event("shutdown")
async def shutdown_event():
    """Close database connection on shutdown"""
    await close_database()
    logger.info("🛑 Profile Service shutdown complete")

def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF file"""
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        logger.error(f"Error extracting PDF text: {e}")
        return ""

def extract_text_from_docx(file_content: bytes) -> str:
    """Extract text from DOCX file"""
    try:
        doc = docx.Document(io.BytesIO(file_content))
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text
    except Exception as e:
        logger.error(f"Error extracting DOCX text: {e}")
        return ""

async def extract_profile_with_groq(resume_text: str) -> dict:
    """Extract profile data using Groq AI"""
    if not groq_client:
        raise Exception("Groq client not available")
    
    try:
        prompt = f"""
        Extract structured profile information from this resume text. Be precise and only extract information that is clearly present.
        
        Resume Text:
        {resume_text}
        
        Please provide a JSON response with the following structure:
        {{
            "personal_info": {{
                "name": "Full name (only if clearly stated)",
                "email": "Email address (only if found)",
                "phone": "Phone number (only if found)",
                "location": "Location/Address (only if found)",
                "linkedin": "LinkedIn URL (only if found)",
                "github": "GitHub URL (only if found)",
                "portfolio": "Portfolio URL (only if found)"
            }},
            "professional_summary": "Professional summary or objective (only if present)",
            "skills": [
                {{
                    "name": "Skill name",
                    "level": "Beginner|Intermediate|Advanced|Expert",
                    "category": "Technical|Soft|Language|Framework|Tool"
                }}
            ],
            "experience": [
                {{
                    "company": "Company name",
                    "position": "Job title",
                    "location": "Work location",
                    "startDate": "Start date (YYYY-MM format if possible)",
                    "endDate": "End date (YYYY-MM format if possible)",
                    "current": false,
                    "description": "Job description and achievements",
                    "technologies": ["List of technologies used"]
                }}
            ],
            "education": [
                {{
                    "institution": "University/School name",
                    "degree": "Degree name",
                    "field": "Field of study",
                    "startYear": "Start year",
                    "endYear": "End year",
                    "grade": "GPA or grade if mentioned",
                    "description": "Additional details"
                }}
            ],
            "projects": [
                {{
                    "title": "Project name",
                    "description": "Project description",
                    "technologies": ["Technologies used"],
                    "startDate": "Start date if available",
                    "endDate": "End date if available",
                    "githubUrl": "GitHub URL if found",
                    "liveUrl": "Live demo URL if found",
                    "highlights": ["Key achievements or features"]
                }}
            ],
            "certifications": [
                {{
                    "name": "Certification name",
                    "issuer": "Issuing organization",
                    "issueDate": "Issue date",
                    "expiryDate": "Expiry date if applicable",
                    "credentialId": "Credential ID if available",
                    "credentialUrl": "Credential URL if available"
                }}
            ]
        }}
        
        Only return valid JSON, no additional text. If information is not found, use empty strings or empty arrays.
        """
        
        response = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are an expert at extracting structured data from resumes. Always return valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.1-70b-versatile",
            temperature=0.1,
            max_tokens=3000
        )
        
        extracted_data = json.loads(response.choices[0].message.content.strip())
        return extracted_data
        
    except Exception as e:
        logger.error(f"Groq extraction failed: {e}")
        raise e

@app.post("/extract-profile")
async def extract_profile_data(
    resume: UploadFile = File(...),
    user_id: str = Form(...)
):
    """Extract profile data from resume to populate profile builder"""
    try:
        logger.info(f"🔍 Starting profile extraction for user: {user_id}")
        
        # Read file content
        file_content = await resume.read()
        
        # Extract text based on file type
        if resume.content_type == "application/pdf":
            resume_text = extract_text_from_pdf(file_content)
        elif resume.content_type in ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"]:
            resume_text = extract_text_from_docx(file_content)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF or DOCX.")
        
        if not resume_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from resume. Please check file format.")
        
        logger.info(f"📄 Extracted {len(resume_text)} characters from resume")
        
        # Extract structured data using Groq
        if not groq_client:
            raise HTTPException(status_code=503, detail="AI extraction service not available")
        
        logger.info("🧠 Extracting profile data with Groq AI...")
        extracted_data = await extract_profile_with_groq(resume_text)
        
        # Calculate confidence score based on data completeness
        confidence_score = 0.0
        total_fields = 0
        filled_fields = 0
        
        # Check personal info completeness
        personal_info = extracted_data.get("personal_info", {})
        for field in ["name", "email", "phone", "location"]:
            total_fields += 1
            if personal_info.get(field) and personal_info.get(field).strip():
                filled_fields += 1
        
        # Check other sections
        sections = ["skills", "experience", "education", "projects", "certifications"]
        for section in sections:
            total_fields += 1
            if extracted_data.get(section) and len(extracted_data.get(section, [])) > 0:
                filled_fields += 1
        
        confidence_score = (filled_fields / total_fields) * 100 if total_fields > 0 else 0
        
        # Prepare response
        result = {
            "success": True,
            "extraction_id": f"extraction_{user_id}_{int(datetime.now().timestamp())}",
            "extracted_data": extracted_data,
            "confidence_score": round(confidence_score, 2),
            "message": f"Successfully extracted profile data with {confidence_score:.1f}% completeness",
            "metadata": {
                "filename": resume.filename,
                "file_size": len(file_content),
                "extraction_date": datetime.now().isoformat(),
                "ai_provider": "groq"
            }
        }
        
        logger.info(f"✅ Profile extraction completed successfully with {confidence_score:.1f}% confidence")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"💥 Critical error in extract_profile: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/profile/{user_id}")
async def get_profile(user_id: str):
    """Get complete user profile"""
    try:
        logger.info(f"📖 Fetching profile for user: {user_id}")
        
        # Get main profile
        profile = await get_user_profile(user_id)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        # Get related data
        education = await get_user_education(user_id)
        experience = await get_user_experience(user_id)
        projects = await get_user_projects(user_id)
        skills = await get_user_skills(user_id)
        certifications = await get_user_certifications(user_id)
        
        # Combine all data
        complete_profile = {
            **profile,
            "education": education,
            "experience": experience,
            "projects": projects,
            "skills": skills,
            "certifications": certifications
        }
        
        logger.info(f"✅ Profile fetched successfully for user: {user_id}")
        return {"profile": complete_profile}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"💥 Error fetching profile: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.put("/profile/{user_id}")
async def update_profile(user_id: str, profile_data: Dict[str, Any]):
    """Update user profile with all sections"""
    try:
        logger.info(f"💾 Updating profile for user: {user_id}")
        
        # Update main profile
        if "personalInfo" in profile_data:
            personal_info = profile_data["personalInfo"]
            main_profile_data = {
                "full_name": personal_info.get("fullName"),
                "email": personal_info.get("email"),
                "phone": personal_info.get("phone"),
                "location": personal_info.get("location"),
                "linkedin_url": personal_info.get("linkedin"),
                "github_url": personal_info.get("github"),
                "portfolio_url": personal_info.get("portfolio"),
                "professional_summary": profile_data.get("summary", "")
            }
            
            # Check if profile exists
            existing_profile = await get_user_profile(user_id)
            if existing_profile:
                await update_user_profile(user_id, main_profile_data)
            else:
                await create_user_profile(user_id, main_profile_data)
        
        # Update related sections
        if "education" in profile_data:
            await save_user_education(user_id, profile_data["education"])
        
        if "experience" in profile_data:
            await save_user_experience(user_id, profile_data["experience"])
        
        if "projects" in profile_data:
            await save_user_projects(user_id, profile_data["projects"])
        
        if "skills" in profile_data:
            await save_user_skills(user_id, profile_data["skills"])
        
        if "certifications" in profile_data:
            await save_user_certifications(user_id, profile_data["certifications"])
        
        # Return updated profile
        updated_profile = await get_profile(user_id)
        
        logger.info(f"✅ Profile updated successfully for user: {user_id}")
        return updated_profile
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"💥 Error updating profile: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint with database status"""
    try:
        db_status = await db_health_check()
        
        ai_status = {
            "groq_available": groq_client is not None
        }
        
        return {
            "status": "healthy",
            "service": "profile-service-supabase",
            "database": db_status,
            "ai_providers": ai_status,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "service": "profile-service-supabase",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "StudyMate Profile Service",
        "version": "2.0.0",
        "database": "supabase_postgresql",
        "ai_providers": ["groq"],
        "status": "running"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8006)