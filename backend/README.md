# StudyMate Backend

**Simplified microservices backend focusing on Profile Builder functionality with Supabase integration.**

> **📋 See REMOVED.md** for details on removed components and future development plans.
> **🚀 See EXECUTION.md** for detailed setup and running instructions.

## 🏗️ Current Architecture

**Clean & Focused Microservices:**

- **API Gateway** (Port 8000) - Central routing and authentication with Supabase
- **Resume Analyzer** (Port 8003) - AI-powered resume analysis using Groq API
- **Profile Service** (Port 8006) - User profile management with Supabase integration

**Database:** Supabase PostgreSQL with Row Level Security (RLS)
**Authentication:** Supabase Auth
**File Storage:** Supabase Storage
**AI Provider:** Groq API for resume analysis

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Groq API Key from [console.groq.com](https://console.groq.com/)
- Supabase Project (already configured)

### Environment Setup

1. **Set Environment Variables**
   Create a `.env` file in the `backend` directory:
   ```bash
   GROQ_API_KEY=your_groq_api_key_here
   SUPABASE_URL=https://jwmsgrodliegekbrhvgt.supabase.co
   SUPABASE_SERVICE_KEY=your_supabase_service_key_here
   SUPABASE_DB_URL=your_supabase_db_connection_string
   JWT_SECRET=your_jwt_secret_key_here
   RESUME_ANALYZER_URL=http://resume-analyzer:8003
   PROFILE_SERVICE_URL=http://profile-service:8006
   ```

2. **Build and Run Services**
   ```bash
   # Navigate to backend directory
   cd backend
   
   # Build and start all services
   docker-compose up --build
   
   # Or run in detached mode
   docker-compose up --build -d
   ```

3. **Verify Services**
   Check if all services are running:
   ```bash
   docker-compose ps
   ```

## 🔧 Service Endpoints

### API Gateway (http://localhost:8000)
- `GET /health` - Health check
- `GET /docs` - FastAPI interactive documentation
- `POST /api/resume/analyze` - Analyze resume (proxied to resume-analyzer)
- `POST /api/profile/extract` - Extract profile data (proxied to profile-service)
- `GET /api/profile/{user_id}` - Get user profile (proxied to profile-service)
- `PUT /api/profile/{user_id}` - Update user profile (proxied to profile-service)

### Resume Analyzer (http://localhost:8003)
- `GET /health` - Health check
- `GET /docs` - Service documentation
- `POST /analyze` - Analyze resume file with AI-powered job matching
- **Features:** PDF/DOCX parsing, ATS scoring, skill extraction, job role matching

### Profile Service (http://localhost:8006)
- `GET /health` - Health check
- `GET /docs` - Service documentation
- `POST /extract-profile` - Extract structured profile data from resume using Groq AI
- `GET /profile/{user_id}` - Retrieve user profile from Supabase
- `PUT /profile/{user_id}` - Update user profile in Supabase
- **Features:** Resume parsing, profile auto-population, Supabase integration

## 🧪 Testing the Services

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
  -F "file=@path/to/your/resume.pdf" \
  -F "job_role=Software Engineer" \
  -F "user_id=test_user_123"
```

### 3. Test Profile Extraction
```bash
# Extract profile data from resume
curl -X POST http://localhost:8000/api/profile/extract \
  -F "file=@path/to/your/resume.pdf" \
  -F "user_id=test_user_123"
```

### 4. Get User Profile
```bash
curl -X GET http://localhost:8000/api/profile/test_user_123
```

### 5. Interactive Testing
Visit http://localhost:8000/docs for Swagger UI testing interface

## 🐛 Debugging and Logs

### View Service Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs profile-service
docker-compose logs api-gateway

# Follow logs in real-time
docker-compose logs -f profile-service
```

### Check Service Status
```bash
# List all containers
docker-compose ps

# Check specific container
docker-compose ps profile-service
```

### Access Service Containers
```bash
# Access service containers
docker-compose exec api-gateway bash
docker-compose exec resume-analyzer bash
docker-compose exec profile-service bash
```

## 📊 Supabase Database

**Database Type:** PostgreSQL with Row Level Security (RLS)

### Key Tables:
- `profiles` - User profile information extracted from resumes
- `resume_extractions` - Resume analysis results and AI insights
- Authentication managed by Supabase Auth

### Access Database:
- **Supabase Dashboard:** https://supabase.com/dashboard/project/jwmsgrodliegekbrhvgt
- **SQL Editor:** Available in Supabase Dashboard
- **Direct Connection:** Use connection string from project settings

## 🔍 Common Issues and Solutions

### 1. Service Won't Start
- Check if ports are available
- Verify environment variables
- Check Docker logs: `docker-compose logs service-name`

### 2. Supabase Connection Issues
- Verify SUPABASE_URL and SUPABASE_SERVICE_KEY in environment
- Check service key permissions in Supabase Dashboard
- Test connection from Supabase SQL Editor

### 3. Groq API Errors
- Verify GROQ_API_KEY in environment
- Check API quota and rate limits
- Review service logs for detailed error messages

### 4. Resume Parsing Issues
- Ensure file format is PDF, DOC, or DOCX
- Check file size (should be under reasonable limits)
- Verify Groq API is responding

## 🛠️ Development

### Adding New Services
1. Create service directory in `backend/agents/`
2. Add Dockerfile and requirements.txt
3. Update docker-compose.yml
4. Add routes to API Gateway

### Environment Variables
- `GROQ_API_KEY` - Required for AI-powered resume parsing and analysis
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_KEY` - Supabase service role key for backend access
- `SUPABASE_DB_URL` - PostgreSQL connection string for direct DB access
- `JWT_SECRET` - Required for internal service authentication

### Service Communication
- **Docker Network:** Services communicate via internal Docker network
- **API Gateway:** Routes external requests to appropriate microservices  
- **Database:** All services connect to shared Supabase PostgreSQL instance
- **Authentication:** Supabase JWT tokens for user authentication

## 📝 API Documentation

For detailed API documentation, start the services and visit:
- **API Gateway:** http://localhost:8000/docs
- **Resume Analyzer:** http://localhost:8003/docs  
- **Profile Service:** http://localhost:8006/docs

## 🔒 Security

- **Supabase Authentication:** Built-in JWT token validation
- **Row Level Security (RLS):** Database-level access control
- **Environment Variables:** All sensitive data in environment files
- **CORS Configuration:** Proper frontend integration security
- **Input Validation:** Comprehensive request validation and sanitization

## 📈 Monitoring

Monitor service health using:
- **Health Endpoints:** `/health` on all services  
- **Docker Status:** `docker-compose ps`
- **Service Logs:** `docker-compose logs -f [service]`
- **Supabase Dashboard:** Real-time database and auth monitoring
- **API Documentation:** Interactive testing via `/docs` endpoints

## 🤝 Contributing

1. Follow the microservices architecture
2. Add proper error handling
3. Include comprehensive logging
4. Update documentation
5. Test thoroughly before deployment