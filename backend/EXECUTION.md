# StudyMate Backend Execution Guide

This guide provides step-by-step instructions to run the current StudyMate backend focusing on profile builder functionality.

## Current Architecture

**Simplified Microservices focusing on Profile Builder:**
- **API Gateway** (Port 8000) - Central routing and authentication
- **Resume Analyzer** (Port 8003) - AI-powered resume analysis using Groq
- **Profile Service** (Port 8006) - User profile management with Supabase

## Prerequisites

1. **Docker & Docker Compose** installed on your system
2. **Groq API Key** - Get from [https://console.groq.com/](https://console.groq.com/)
3. **Supabase Project** - The project is already configured with database schema

## Environment Setup

### 1. Create Environment Files

Create `backend/.env` file with the following variables:

```bash
# Groq API Configuration
GROQ_API_KEY=your_groq_api_key_here

# Supabase Configuration
SUPABASE_URL=https://jwmsgrodliegekbrhvgt.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_key_here

# Database Configuration (Supabase PostgreSQL)
SUPABASE_DB_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# JWT Configuration (for internal service communication)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Service URLs (Docker internal networking)
RESUME_ANALYZER_URL=http://resume-analyzer:8003
PROFILE_SERVICE_URL=http://profile-service:8006
```

### 2. Get Required Keys

#### Groq API Key:
1. Visit [https://console.groq.com/](https://console.groq.com/)
2. Create account and generate API key
3. Add to `.env` file as `GROQ_API_KEY`

#### Supabase Service Key:
1. Visit Supabase Dashboard → Settings → API
2. Copy the `service_role` key (not the anon key)
3. Add to `.env` file as `SUPABASE_SERVICE_KEY`

## Running the Backend

### Option 1: Docker Compose (Recommended)

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Build and start services:**
   ```bash
   docker-compose up --build
   ```

3. **Run in detached mode (background):**
   ```bash
   docker-compose up --build -d
   ```

### Option 2: Individual Services (Development)

If you prefer to run services individually for debugging:

```bash
# Terminal 1 - API Gateway
cd backend/api-gateway
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 - Resume Analyzer
cd backend/agents/resume-analyzer
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8003

# Terminal 3 - Profile Service
cd backend/agents/profile-service
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8006 --reload
```

## Service Endpoints

### API Gateway (http://localhost:8000)
- `GET /health` - Health check
- `GET /docs` - FastAPI documentation
- `POST /api/resume/analyze` - Analyze resume (routes to resume-analyzer)
- `POST /api/profile/extract` - Extract profile data (routes to profile-service)
- `GET /api/profile/{user_id}` - Get user profile (routes to profile-service)
- `PUT /api/profile/{user_id}` - Update user profile (routes to profile-service)

### Resume Analyzer (http://localhost:8003)
- `GET /health` - Health check
- `GET /docs` - Service documentation
- `POST /analyze` - Analyze resume file with job role matching
- Supports: PDF, DOCX files
- AI Provider: Groq (llama-3.1-70b-versatile)

### Profile Service (http://localhost:8006)
- `GET /health` - Health check
- `GET /docs` - Service documentation
- `POST /extract-profile` - Extract structured profile data from resume
- `GET /profile/{user_id}` - Retrieve user profile
- `PUT /profile/{user_id}` - Update user profile
- Database: Supabase PostgreSQL

## Testing the Services

### 1. Health Checks
```bash
# Test all services are running
curl http://localhost:8000/health
curl http://localhost:8003/health
curl http://localhost:8006/health
```

### 2. Test Resume Analysis
```bash
# Analyze resume against job role
curl -X POST http://localhost:8000/api/resume/analyze \
  -F "file=@path/to/resume.pdf" \
  -F "job_role=Software Engineer" \
  -F "user_id=test-user-123"
```

### 3. Test Profile Extraction
```bash
# Extract profile data from resume
curl -X POST http://localhost:8000/api/profile/extract \
  -F "file=@path/to/resume.pdf" \
  -F "user_id=test-user-123"
```

## Debugging & Monitoring

### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs api-gateway
docker-compose logs resume-analyzer
docker-compose logs profile-service

# Follow logs in real-time
docker-compose logs -f profile-service
```

### Check Service Status
```bash
# List running containers
docker-compose ps

# Restart specific service
docker-compose restart profile-service

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose down && docker-compose up --build
```

### Access Service Containers
```bash
# Access container shell
docker-compose exec api-gateway bash
docker-compose exec profile-service bash

# Check service health from inside container
docker-compose exec profile-service curl localhost:8006/health
```

## Database Access

### Supabase Database
- **Type:** PostgreSQL with Row Level Security (RLS)
- **Tables:** Already configured with proper schema
- **Access:** Via Supabase Dashboard or direct SQL connection

### Key Tables:
- `profiles` - User profile information
- `resume_extractions` - Resume analysis results
- Authentication handled by Supabase Auth

## Troubleshooting

### Common Issues:

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :8000
   # Kill the process or change port in docker-compose.yml
   ```

2. **Groq API Key Issues**
   - Verify key is correctly set in `.env`
   - Check API quota at https://console.groq.com/
   - Check service logs for detailed error messages

3. **Supabase Connection Issues**
   - Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
   - Check if service key has proper permissions
   - Test connection from Supabase Dashboard

4. **File Upload Issues**
   - Ensure file size is reasonable (< 10MB)
   - Check file format (PDF, DOCX supported)
   - Verify multipart/form-data headers

### Service Startup Order:
Services can start in any order due to health checks and retry logic, but typical flow:
1. API Gateway (8000)
2. Resume Analyzer (8003)  
3. Profile Service (8006)

## Development Tips

1. **Use Docker for consistency** - All services are containerized
2. **Check logs frequently** - Use `docker-compose logs -f [service]`
3. **Test endpoints** - Use `/docs` for interactive API testing
4. **Environment variables** - Always use `.env` file for configuration
5. **Health checks** - Services include health endpoints for monitoring

## Next Steps

After confirming this setup works:
1. Test resume upload functionality
2. Verify profile extraction works
3. Check Supabase database integration
4. Test API Gateway routing
5. Ready to integrate with frontend

The backend is now simplified, focused, and ready for debugging and development!