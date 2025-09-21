# Backend Execution Guide

This guide explains how to set up and run the FastAPI backend services with Groq integration and Supabase database.

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

# JWT Configuration (for API Gateway)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Service URLs (Docker internal)
PROFILE_SERVICE_URL=http://profile-service:8006
RESUME_ANALYZER_GROQ_URL=http://resume-analyzer-groq:8007
```

### 2. Get Required API Keys

#### Groq API Key:
1. Go to [https://console.groq.com/](https://console.groq.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env` file

#### Supabase Service Key:
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the "service_role" key (not the anon key)
4. Add it to your `.env` file

## Running the Backend

### Option 1: Run Specific Services (Recommended)

Run only the services you need for profile functionality:

```bash
cd backend

# Run profile service and resume analyzer
docker-compose up --build profile-service resume-analyzer-groq

# Or run in detached mode
docker-compose up --build -d profile-service resume-analyzer-groq
```

### Option 2: Run All Services

```bash
cd backend

# Build and run all services
docker-compose up --build

# Or run in detached mode
docker-compose up --build -d
```

## Service Endpoints

Once running, the following services will be available:

- **Profile Service**: `http://localhost:8006`
  - Health Check: `GET /health`
  - Extract Profile: `POST /extract-profile`
  - Get Profile: `GET /profile/{user_id}`
  - Update Profile: `PUT /profile/{user_id}`

- **Resume Analyzer (Groq)**: `http://localhost:8007`
  - Health Check: `GET /health`
  - Analyze Resume: `POST /analyze-resume`
  - Extract Profile Data: `POST /extract-profile`
  - Quick Suggestions: `POST /quick-suggestions`

## Testing the Services

### 1. Health Check

```bash
# Test profile service
curl http://localhost:8006/health

# Test resume analyzer
curl http://localhost:8007/health
```

### 2. Upload Resume for Analysis

```bash
curl -X POST \
  http://localhost:8007/analyze-resume \
  -F "resume=@path/to/your/resume.pdf" \
  -F "job_role=Frontend Developer" \
  -F "job_description=React developer with TypeScript experience" \
  -F "user_id=test-user-123"
```

### 3. Extract Profile Data

```bash
curl -X POST \
  http://localhost:8006/extract-profile \
  -F "resume=@path/to/your/resume.pdf" \
  -F "user_id=test-user-123"
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   - Make sure ports 8006 and 8007 are not in use
   - Change ports in `docker-compose.yml` if needed

2. **API Key Issues**
   - Verify your Groq API key is valid
   - Check if you have sufficient API credits
   - Ensure Supabase service key has proper permissions

3. **Database Connection Issues**
   - Verify Supabase URL and service key
   - Check if RLS policies are properly configured
   - Ensure the database schema is migrated

4. **File Upload Issues**
   - Supported formats: PDF, DOCX
   - Maximum file size: 16MB (configurable)
   - Ensure proper multipart/form-data headers

### Logs and Debugging

```bash
# View logs for specific service
docker-compose logs -f profile-service
docker-compose logs -f resume-analyzer-groq

# View all logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose down && docker-compose up --build
```

## Frontend Integration

The frontend should call these endpoints:

- **Resume Upload**: `POST http://localhost:8006/extract-profile`
- **Profile Data**: `GET http://localhost:8006/profile/{user_id}`
- **Profile Update**: `PUT http://localhost:8006/profile/{user_id}`

## Database Schema

The backend uses the following Supabase tables:
- `user_profiles` - Main profile information
- `user_education` - Education records
- `user_experience` - Work experience
- `user_projects` - Project portfolio
- `user_skills` - Skills with proficiency levels
- `user_certifications` - Certifications and achievements
- `user_resumes` - Resume files and AI analysis results

## Security Notes

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive configuration
3. **Restrict Supabase RLS policies** to authenticated users only
4. **Validate file uploads** on both frontend and backend
5. **Use HTTPS** in production environments

## Production Deployment

For production deployment:

1. Use proper environment variables management
2. Set up load balancing and health checks
3. Configure proper logging and monitoring
4. Use production-grade database connections
5. Set up CI/CD pipelines for automated deployment
6. Configure proper CORS policies
7. Use reverse proxy (nginx) for better performance

## Support

If you encounter issues:

1. Check the logs using `docker-compose logs -f`
2. Verify all environment variables are set correctly
3. Test individual endpoints using curl or Postman
4. Check Supabase dashboard for database connectivity
5. Verify Groq API key and usage limits