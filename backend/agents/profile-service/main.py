import json
import logging
import os
import tempfile
from datetime import datetime
from typing import Any, Dict, Optional

import httpx
import PyPDF2
from docx import Document
from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from groq import Groq
from supabase import create_client, Client

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
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://jwmsgrodliegekbrhvgt.supabase.co")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# Initialize clients
groq_client = Groq(api_key=GROQ_API_KEY)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

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
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that extracts structured data from resumes. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=2000
        )

        try:
            content = response.choices[0].message.content.strip()
            logger.error(f"Raw response content: {content}")
            
            if not content:
                raise ValueError("Empty response from Groq")
            
            # Handle markdown-wrapped JSON responses
            if content.startswith("```json") and content.endswith("```"):
                # Extract JSON content between markdown code blocks
                json_start = content.find("```json") + 7
                json_end = content.rfind("```")
                content = content[json_start:json_end].strip()
            elif content.startswith("```") and content.endswith("```"):
                # Handle generic code blocks
                json_start = content.find("```") + 3
                json_end = content.rfind("```")
                content = content[json_start:json_end].strip()
            
            parsed_data = json.loads(content)
            return parsed_data
        except (json.JSONDecodeError, ValueError) as e:
            logger.error(f"Failed to parse Groq response: {str(e)}")
            logger.error(f"Raw response content: {response.choices[0].message.content}")
            # Return fallback data structure
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

            # Upload file to Supabase Storage (handle duplicates)
            file_path = f"{user_id}/{resume.filename}"
            try:
                # Try to upload, if file exists, overwrite it
                try:
                    storage_response = supabase.storage.from_("resume-files").upload(file_path, content)
                    logger.info(f"File uploaded successfully: {file_path}")
                except Exception as upload_error:
                    # If file exists, update it instead
                    if "already exists" in str(upload_error).lower():
                        logger.info(f"File exists, updating: {file_path}")
                        storage_response = supabase.storage.from_("resume-files").update(file_path, content)
                        logger.info(f"File updated successfully: {file_path}")
                    else:
                        raise upload_error
            except Exception as e:
                logger.error(f"Storage upload error: {str(e)}")
                raise HTTPException(status_code=500, detail="Failed to upload file")

            # Store resume metadata in Supabase
            resume_data = {
                "user_id": user_id,
                "filename": resume.filename,
                "file_path": file_path,
                "file_size": len(content),
                "extracted_text": extracted_text,
                "ai_analysis": parsed_data,
                "skill_gaps": [],
                "recommendations": ["Complete missing profile sections", "Add more project details"],
                "processing_status": "completed"
            }

            # Insert resume record
            try:
                resume_result = supabase.table("user_resumes").insert(resume_data).execute()
                logger.info("Resume data inserted successfully")
            except Exception as e:
                logger.error(f"Resume insert error: {str(e)}")

            # Upsert user profile
            profile_data = {
                "user_id": user_id,
                "full_name": parsed_data.get("personalInfo", {}).get("fullName"),
                "email": parsed_data.get("personalInfo", {}).get("email"),
                "phone": parsed_data.get("personalInfo", {}).get("phone"),
                "location": parsed_data.get("personalInfo", {}).get("location"),
                "linkedin_url": parsed_data.get("personalInfo", {}).get("linkedin"),
                "github_url": parsed_data.get("personalInfo", {}).get("github"),
                "portfolio_url": parsed_data.get("personalInfo", {}).get("portfolio"),
                "professional_summary": parsed_data.get("summary", ""),
                "completion_percentage": 85
            }

            # Upsert profile
            try:
                profile_result = supabase.table("user_profiles").upsert(profile_data).execute()
                logger.info("Profile data upserted successfully")
            except Exception as e:
                logger.error(f"Profile upsert error: {str(e)}")

            # Insert education records
            for edu in parsed_data.get("education", []):
                edu_data = {
                    "user_id": user_id,
                    "institution": edu.get("institution", ""),
                    "degree": edu.get("degree", ""),
                    "field_of_study": edu.get("field", ""),
                    "start_year": edu.get("startYear", ""),
                    "end_year": edu.get("endYear", ""),
                    "grade": edu.get("grade", "")
                }
                try:
                    supabase.table("user_education").insert(edu_data).execute()
                except Exception as e:
                    logger.error(f"Education insert error: {str(e)}")

            # Insert experience records
            for exp in parsed_data.get("experience", []):
                exp_data = {
                    "user_id": user_id,
                    "company": exp.get("company", ""),
                    "position": exp.get("position", ""),
                    "start_date": exp.get("startDate", ""),
                    "end_date": exp.get("endDate", ""),
                    "is_current": exp.get("current", False),
                    "description": exp.get("description", ""),
                    "technologies": exp.get("technologies", []),
                    "location": exp.get("location", "")
                }
                try:
                    supabase.table("user_experience").insert(exp_data).execute()
                except Exception as e:
                    logger.error(f"Experience insert error: {str(e)}")

            # Insert project records
            for proj in parsed_data.get("projects", []):
                proj_data = {
                    "user_id": user_id,
                    "title": proj.get("title", ""),
                    "description": proj.get("description", ""),
                    "technologies": proj.get("technologies", []),
                    "start_date": proj.get("startDate", ""),
                    "end_date": proj.get("endDate", ""),
                    "github_url": proj.get("githubUrl", ""),
                    "live_url": proj.get("liveUrl", ""),
                    "highlights": proj.get("highlights", [])
                }
                try:
                    supabase.table("user_projects").insert(proj_data).execute()
                except Exception as e:
                    logger.error(f"Project insert error: {str(e)}")

            # Insert skill records
            for skill in parsed_data.get("skills", []):
                skill_data = {
                    "user_id": user_id,
                    "name": skill.get("name", ""),
                    "level": skill.get("level", "Intermediate"),
                    "category": skill.get("category", "Technical")
                }
                try:
                    supabase.table("user_skills").upsert(skill_data).execute()
                except Exception as e:
                    logger.error(f"Skill upsert error: {str(e)}")

            # Insert certification records
            for cert in parsed_data.get("certifications", []):
                cert_data = {
                    "user_id": user_id,
                    "name": cert.get("name", ""),
                    "issuer": cert.get("issuer", ""),
                    "issue_date": cert.get("issueDate", ""),
                    "expiry_date": cert.get("expiryDate", ""),
                    "credential_id": cert.get("credentialId", ""),
                    "credential_url": cert.get("credentialUrl", "")
                }
                try:
                    supabase.table("user_certifications").insert(cert_data).execute()
                except Exception as e:
                    logger.error(f"Certification insert error: {str(e)}")

            return {
                "success": True,
                "message": "Profile extracted successfully",
                "data": {
                    "personalInfo": parsed_data.get("personalInfo", {}),
                    "education": parsed_data.get("education", []),
                    "experience": parsed_data.get("experience", []),
                    "projects": parsed_data.get("projects", []),
                    "skills": parsed_data.get("skills", []),
                    "certifications": parsed_data.get("certifications", []),
                    "resumeData": resume_data
                }
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
        # Get profile data
        profile_result = supabase.table("user_profiles").select("*").eq("user_id", user_id).execute()
        education_result = supabase.table("user_education").select("*").eq("user_id", user_id).execute()
        experience_result = supabase.table("user_experience").select("*").eq("user_id", user_id).execute()
        projects_result = supabase.table("user_projects").select("*").eq("user_id", user_id).execute()
        skills_result = supabase.table("user_skills").select("*").eq("user_id", user_id).execute()
        certifications_result = supabase.table("user_certifications").select("*").eq("user_id", user_id).execute()
        resumes_result = supabase.table("user_resumes").select("*").eq("user_id", user_id).execute()

        profile_data = profile_result.data[0] if profile_result.data else {}
        
        return {
            "userId": user_id,
            "personalInfo": {
                "fullName": profile_data.get("full_name", ""),
                "email": profile_data.get("email", ""),
                "phone": profile_data.get("phone", ""),
                "location": profile_data.get("location", ""),
                "linkedin": profile_data.get("linkedin_url", ""),
                "github": profile_data.get("github_url", ""),
                "portfolio": profile_data.get("portfolio_url", "")
            },
            "education": [
                {
                    "id": str(edu.get("id", "")),
                    "institution": edu.get("institution", ""),
                    "degree": edu.get("degree", ""),
                    "field": edu.get("field_of_study", ""),
                    "startYear": edu.get("start_year", ""),
                    "endYear": edu.get("end_year", ""),
                    "grade": edu.get("grade", ""),
                    "description": edu.get("description", "")
                } for edu in education_result.data
            ] if education_result.data else [],
            "experience": [
                {
                    "id": str(exp.get("id", "")),
                    "company": exp.get("company", ""),
                    "position": exp.get("position", ""),
                    "startDate": exp.get("start_date", ""),
                    "endDate": exp.get("end_date", ""),
                    "current": exp.get("is_current", False),
                    "description": exp.get("description", ""),
                    "technologies": exp.get("technologies", []),
                    "location": exp.get("location", "")
                } for exp in experience_result.data
            ] if experience_result.data else [],
            "projects": [
                {
                    "id": str(proj.get("id", "")),
                    "title": proj.get("title", ""),
                    "description": proj.get("description", ""),
                    "technologies": proj.get("technologies", []),
                    "startDate": proj.get("start_date", ""),
                    "endDate": proj.get("end_date", ""),
                    "githubUrl": proj.get("github_url", ""),
                    "liveUrl": proj.get("live_url", ""),
                    "highlights": proj.get("highlights", [])
                } for proj in projects_result.data
            ] if projects_result.data else [],
            "skills": [
                {
                    "name": skill.get("name", ""),
                    "level": skill.get("level", ""),
                    "category": skill.get("category", "")
                } for skill in skills_result.data
            ] if skills_result.data else [],
            "certifications": [
                {
                    "id": str(cert.get("id", "")),
                    "name": cert.get("name", ""),
                    "issuer": cert.get("issuer", ""),
                    "issueDate": cert.get("issue_date", ""),
                    "expiryDate": cert.get("expiry_date", ""),
                    "credentialId": cert.get("credential_id", ""),
                    "credentialUrl": cert.get("credential_url", "")
                } for cert in certifications_result.data
            ] if certifications_result.data else [],
            "resumeData": {
                "filename": resumes_result.data[0].get("filename", ""),
                "uploadDate": resumes_result.data[0].get("upload_date", ""),
                "extractedText": resumes_result.data[0].get("extracted_text", ""),
                "aiAnalysis": resumes_result.data[0].get("ai_analysis", ""),
                "skillGaps": resumes_result.data[0].get("skill_gaps", []),
                "recommendations": resumes_result.data[0].get("recommendations", [])
            } if resumes_result.data else None,
            "achievements": [],
            "languages": [],
            "interests": [],
            "summary": profile_data.get("professional_summary", ""),
            "completionPercentage": profile_data.get("completion_percentage", 0),
            "createdAt": profile_data.get("created_at", datetime.utcnow().isoformat()),
            "updatedAt": profile_data.get("updated_at", datetime.utcnow().isoformat())
        }

    except Exception as e:
        logger.error(f"Error getting profile: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get profile: {str(e)}")

@app.put("/profile/{user_id}")
async def update_profile(user_id: str, profile_data: dict):
    """Update user profile"""
    try:
        # Update profile data
        result = supabase.table("user_profiles").upsert({
            "user_id": user_id,
            **profile_data
        }).execute()

        logger.info("Profile updated successfully")

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