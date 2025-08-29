from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
import os
from typing import Optional
import PyPDF2
import docx
import io
import json
from datetime import datetime
from bson import ObjectId
import sys
sys.path.append('/app/shared')
from database.connection import get_profiles_collection, get_sync_database

# Configure Gemini API
GEMINI_API_KEY = "AIzaSyBr964zVyQutiRjAUId0l767TyfaAiPEuE"
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-pro')

app = FastAPI(title="Resume Analyzer Service")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF file"""
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
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
        print(f"Error extracting DOCX text: {e}")
        return ""

def extract_resume_data(resume_text: str, job_role: str, job_description: str = "") -> dict:
    """Use Gemini to extract structured data from resume"""
    try:
        prompt = f"""
        Analyze the following resume and extract structured information for the job role: {job_role}
        
        Job Description (if provided): {job_description}
        
        Resume Text:
        {resume_text}
        
        Please provide a JSON response with the following structure:
        {{
            "personal_info": {{
                "name": "Full name",
                "email": "Email address",
                "phone": "Phone number",
                "location": "Location/Address"
            }},
            "summary": "Professional summary or objective",
            "skills": ["List of technical and soft skills"],
            "experience": [
                {{
                    "title": "Job title",
                    "company": "Company name",
                    "duration": "Employment period",
                    "description": "Job description and achievements"
                }}
            ],
            "education": [
                {{
                    "degree": "Degree name",
                    "institution": "University/School name",
                    "year": "Graduation year",
                    "gpa": "GPA if mentioned"
                }}
            ],
            "projects": [
                {{
                    "name": "Project name",
                    "description": "Project description",
                    "technologies": ["Technologies used"]
                }}
            ],
            "certifications": ["List of certifications"],
            "languages": ["Programming languages or spoken languages"]
        }}
        
        Only return valid JSON, no additional text.
        """
        
        response = model.generate_content(prompt)
        # Parse the JSON response
        extracted_data = json.loads(response.text.strip())
        return extracted_data
    except Exception as e:
        print(f"Error extracting resume data: {e}")
        return {}

def analyze_resume_for_job(resume_text: str, job_role: str, job_description: str = "") -> dict:
    """Analyze resume against specific job role using Gemini"""
    try:
        prompt = f"""
        Analyze this resume for the job role: {job_role}
        
        Job Description: {job_description}
        
        Resume Content:
        {resume_text}
        
        Provide a comprehensive analysis in JSON format:
        {{
            "overall_score": "Score out of 100",
            "job_match_score": "How well resume matches the job role (0-100)",
            "ats_score": "ATS compatibility score (0-100)",
            "strengths": ["List of resume strengths relevant to the job"],
            "weaknesses": ["Areas that need improvement"],
            "skill_gaps": ["Missing skills for the job role"],
            "recommendations": ["Specific recommendations to improve the resume"],
            "keywords_found": ["Important keywords found in resume"],
            "missing_keywords": ["Important keywords missing from resume"],
            "sections_analysis": {{
                "summary": "Analysis of professional summary",
                "experience": "Analysis of work experience",
                "skills": "Analysis of skills section",
                "education": "Analysis of education",
                "overall_structure": "Analysis of resume structure and formatting"
            }},
            "improvement_priority": ["Top 3 areas to focus on for improvement"],
            "role_specific_advice": ["Advice specific to the {job_role} role"]
        }}
        
        Only return valid JSON, no additional text.
        """
        
        response = model.generate_content(prompt)
        analysis = json.loads(response.text.strip())
        return analysis
    except Exception as e:
        print(f"Error analyzing resume: {e}")
        return {
            "overall_score": 0,
            "job_match_score": 0,
            "ats_score": 0,
            "strengths": [],
            "weaknesses": ["Error analyzing resume"],
            "skill_gaps": [],
            "recommendations": ["Please try uploading the resume again"],
            "keywords_found": [],
            "missing_keywords": [],
            "sections_analysis": {},
            "improvement_priority": [],
            "role_specific_advice": []
        }

@app.post("/analyze-resume")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_role: str = Form(...),
    job_description: str = Form(""),
    user_id: Optional[str] = Form(None)
):
    """Analyze uploaded resume for specific job role"""
    try:
        # Read file content
        file_content = await resume.read()
        
        # Extract text based on file type
        if resume.content_type == "application/pdf":
            resume_text = extract_text_from_pdf(file_content)
        elif resume.content_type in ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"]:
            resume_text = extract_text_from_docx(file_content)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
        
        if not resume_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from resume")
        
        # Extract structured data
        extracted_data = extract_resume_data(resume_text, job_role, job_description)
        
        # Analyze resume
        analysis = analyze_resume_for_job(resume_text, job_role, job_description)
        
        # Prepare response
        result = {
            "filename": resume.filename,
            "file_size": len(file_content),
            "upload_date": datetime.now().isoformat(),
            "job_role": job_role,
            "job_description": job_description,
            "extracted_text": resume_text[:1000],  # First 1000 chars for preview
            "extracted_data": extracted_data,
            "analysis": analysis,
            "processing_status": "completed"
        }
        
        # Save to database if user_id provided
        if user_id:
            try:
                # Get MongoDB database
                db = get_sync_database()
                profiles_collection = db["profiles"]
                
                # Save resume analysis to database
                resume_record = {
                    "user_id": user_id,
                    "filename": resume.filename,
                    "file_size": len(file_content),
                    "upload_date": datetime.now(),
                    "job_role": job_role,
                    "job_description": job_description,
                    "extracted_text": resume_text,
                    "extracted_data": extracted_data,
                    "analysis": analysis,
                    "processing_status": "completed"
                }
                
                profiles_collection.insert_one(resume_record)
                
            except Exception as db_error:
                print(f"Database error: {db_error}")
                # Don't fail the request if DB save fails
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in analyze_resume: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/extract-profile-data")
async def extract_profile_data(
    resume: UploadFile = File(...),
    user_id: str = Form(...)
):
    """Extract profile data from resume to populate profile builder"""
    try:
        # Read file content
        file_content = await resume.read()
        
        # Extract text based on file type
        if resume.content_type == "application/pdf":
            resume_text = extract_text_from_pdf(file_content)
        elif resume.content_type in ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"]:
            resume_text = extract_text_from_docx(file_content)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
        
        if not resume_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from resume")
        
        # Extract structured data for profile
        extracted_data = extract_resume_data(resume_text, "General", "")
        
        # Transform data to match profile structure
        profile_data = {
            "personalInfo": {
                "fullName": extracted_data.get("personal_info", {}).get("name", ""),
                "email": extracted_data.get("personal_info", {}).get("email", ""),
                "phone": extracted_data.get("personal_info", {}).get("phone", ""),
                "location": extracted_data.get("personal_info", {}).get("location", ""),
                "linkedin": "",
                "github": "",
                "portfolio": ""
            },
            "experience": [
                {
                    "title": exp.get("title", ""),
                    "company": exp.get("company", ""),
                    "location": "",
                    "startDate": "",
                    "endDate": "",
                    "current": False,
                    "description": exp.get("description", "")
                }
                for exp in extracted_data.get("experience", [])
            ],
            "education": [
                {
                    "degree": edu.get("degree", ""),
                    "institution": edu.get("institution", ""),
                    "location": "",
                    "startDate": "",
                    "endDate": edu.get("year", ""),
                    "gpa": edu.get("gpa", ""),
                    "description": ""
                }
                for edu in extracted_data.get("education", [])
            ],
            "projects": [
                {
                    "name": proj.get("name", ""),
                    "description": proj.get("description", ""),
                    "technologies": proj.get("technologies", []),
                    "url": "",
                    "github": "",
                    "startDate": "",
                    "endDate": ""
                }
                for proj in extracted_data.get("projects", [])
            ],
            "skills": extracted_data.get("skills", []),
            "certifications": [
                {
                    "name": cert,
                    "issuer": "",
                    "date": "",
                    "url": "",
                    "description": ""
                }
                for cert in extracted_data.get("certifications", [])
            ],
            "resumeData": {
                "filename": resume.filename,
                "uploadDate": datetime.now().isoformat(),
                "extractedText": resume_text[:500],  # Preview text
                "aiAnalysis": "Resume data extracted successfully for profile building",
                "skillGaps": [],
                "recommendations": [
                    "Review and verify all extracted information",
                    "Add missing details like dates, locations, and URLs",
                    "Complete your profile with additional projects and achievements"
                ]
            }
        }
        
        return profile_data
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in extract_profile_data: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "resume-analyzer"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)