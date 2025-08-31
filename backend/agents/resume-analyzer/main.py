from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from typing import Optional
import PyPDF2
import docx
import io
import json
from datetime import datetime
import logging
import sys
sys.path.append('/app/shared')
from database.supabase_connection import (
    init_database, close_database, save_resume_analysis, 
    health_check as db_health_check
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Resume Analyzer Service - Supabase Edition")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AI Configuration - Using both Groq and Gemini
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Initialize AI clients
groq_client = None
gemini_model = None

if GROQ_API_KEY:
    try:
        from groq import Groq
        groq_client = Groq(api_key=GROQ_API_KEY)
        logger.info("✅ Groq client initialized successfully")
    except ImportError:
        logger.warning("⚠️ Groq library not installed, falling back to Gemini")

if GEMINI_API_KEY:
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_model = genai.GenerativeModel('gemini-pro')
        logger.info("✅ Gemini client initialized successfully")
    except ImportError:
        logger.warning("⚠️ Gemini library not installed")

@app.on_event("startup")
async def startup_event():
    """Initialize database connection on startup"""
    try:
        await init_database()
        logger.info("🚀 Resume Analyzer Service started successfully")
    except Exception as e:
        logger.error(f"❌ Failed to initialize database: {e}")
        raise e

@app.on_event("shutdown")
async def shutdown_event():
    """Close database connection on shutdown"""
    await close_database()
    logger.info("🛑 Resume Analyzer Service shutdown complete")

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

async def analyze_with_groq(resume_text: str, job_role: str, job_description: str = "") -> dict:
    """Analyze resume using Groq AI"""
    if not groq_client:
        raise Exception("Groq client not available")
    
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
        
        response = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are an expert resume analyzer. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.1-70b-versatile",
            temperature=0.1,
            max_tokens=2000
        )
        
        analysis = json.loads(response.choices[0].message.content.strip())
        analysis["ai_provider"] = "groq"
        return analysis
        
    except Exception as e:
        logger.error(f"Groq analysis failed: {e}")
        raise e

async def analyze_with_gemini(resume_text: str, job_role: str, job_description: str = "") -> dict:
    """Analyze resume using Gemini AI (fallback)"""
    if not gemini_model:
        raise Exception("Gemini model not available")
    
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
        
        response = gemini_model.generate_content(prompt)
        analysis = json.loads(response.text.strip())
        analysis["ai_provider"] = "gemini"
        return analysis
        
    except Exception as e:
        logger.error(f"Gemini analysis failed: {e}")
        raise e

@app.post("/analyze-resume")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_role: str = Form(...),
    job_description: str = Form(""),
    user_id: Optional[str] = Form(None)
):
    """Analyze uploaded resume for specific job role using Groq/Gemini AI"""
    try:
        logger.info(f"🔍 Starting resume analysis for job role: {job_role}")
        
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
        
        # Try Groq first, fallback to Gemini
        analysis = None
        try:
            if groq_client:
                logger.info("🧠 Analyzing with Groq AI...")
                analysis = await analyze_with_groq(resume_text, job_role, job_description)
            else:
                raise Exception("Groq client not available")
        except Exception as groq_error:
            logger.warning(f"⚠️ Groq analysis failed: {groq_error}")
            try:
                if gemini_model:
                    logger.info("🔄 Falling back to Gemini AI...")
                    analysis = await analyze_with_gemini(resume_text, job_role, job_description)
                else:
                    raise Exception("Gemini model not available")
            except Exception as gemini_error:
                logger.error(f"❌ Both AI providers failed. Groq: {groq_error}, Gemini: {gemini_error}")
                # Return basic fallback analysis
                analysis = {
                    "overall_score": 50,
                    "job_match_score": 50,
                    "ats_score": 50,
                    "strengths": ["Resume uploaded successfully"],
                    "weaknesses": ["AI analysis temporarily unavailable"],
                    "skill_gaps": ["Unable to analyze at this time"],
                    "recommendations": ["Please try again later"],
                    "keywords_found": [],
                    "missing_keywords": [],
                    "sections_analysis": {
                        "summary": "Analysis unavailable",
                        "experience": "Analysis unavailable",
                        "skills": "Analysis unavailable",
                        "education": "Analysis unavailable",
                        "overall_structure": "Analysis unavailable"
                    },
                    "improvement_priority": ["Try uploading again"],
                    "role_specific_advice": ["AI service temporarily unavailable"],
                    "ai_provider": "fallback"
                }
        
        # Prepare response
        result = {
            "success": True,
            "filename": resume.filename,
            "file_size": len(file_content),
            "upload_date": datetime.now().isoformat(),
            "job_role": job_role,
            "job_description": job_description,
            "extracted_text": resume_text[:1000],  # First 1000 chars for preview
            "analysis": analysis,
            "processing_status": "completed"
        }
        
        # Save to Supabase if user_id provided
        if user_id:
            try:
                logger.info(f"💾 Saving analysis to Supabase for user: {user_id}")
                resume_data = {
                    "filename": resume.filename,
                    "file_size": len(file_content),
                    "extracted_text": resume_text,
                    "ai_analysis": analysis,
                    "skill_gaps": analysis.get("skill_gaps", []),
                    "recommendations": analysis.get("recommendations", [])
                }
                
                resume_id = await save_resume_analysis(user_id, resume_data)
                result["resume_id"] = resume_id
                logger.info(f"✅ Analysis saved with ID: {resume_id}")
                
            except Exception as db_error:
                logger.error(f"💥 Database save failed: {db_error}")
                # Don't fail the request if DB save fails
                result["db_warning"] = "Analysis completed but failed to save to database"
        
        logger.info(f"✅ Resume analysis completed successfully for {job_role}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"💥 Critical error in analyze_resume: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint with database status"""
    try:
        db_status = await db_health_check()
        
        ai_status = {
            "groq_available": groq_client is not None,
            "gemini_available": gemini_model is not None
        }
        
        return {
            "status": "healthy",
            "service": "resume-analyzer-supabase",
            "database": db_status,
            "ai_providers": ai_status,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "service": "resume-analyzer-supabase",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "StudyMate Resume Analyzer",
        "version": "2.0.0",
        "database": "supabase_postgresql",
        "ai_providers": ["groq", "gemini"],
        "status": "running"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)