# StudyMate Backend

A comprehensive backend system for StudyMate application with microservices architecture, AI-powered features, and MongoDB integration.

## 🏗️ Architecture

The backend consists of multiple microservices:

- **API Gateway** (Port 8000) - Central routing and authentication
- **Course Generation Agent** (Port 8001) - AI-powered course creation
- **Interview Coach Agent** (Port 8002) - Mock interview system
- **Chat Mentor Agent** (Port 8003) - AI tutoring and assistance
- **Progress Analyst Agent** (Port 8004) - Learning analytics
- **Resume Analyzer Agent** (Port 8005) - Resume analysis and feedback
- **Profile Service** (Port 8006) - User profile management with Groq AI

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- MongoDB (handled via Docker)
- Redis (handled via Docker)
- Groq API Key for resume parsing

### Environment Setup

1. **Set Environment Variables**
   Create a `.env` file in the `backend` directory:
   ```bash
   GROQ_API_KEY=your_groq_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   JWT_SECRET=your_jwt_secret_key_here
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
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/profile/{user_id}` - Get user profile
- `PUT /api/profile/{user_id}` - Update user profile
- `POST /api/profile/extract-profile` - Extract profile from resume

### Profile Service (http://localhost:8006)
- `GET /health` - Health check
- `POST /extract-profile` - Extract profile data from resume using Groq AI
- `GET /profile/{user_id}` - Get user profile
- `PUT /profile/{user_id}` - Update user profile

### Course Generation (http://localhost:8001)
- `POST /generate_course` - Generate AI-powered courses

### Interview Coach (http://localhost:8002)
- `POST /start_interview` - Start mock interview
- `POST /submit_feedback/{interview_id}` - Submit interview feedback

### Other Services
- Chat Mentor: http://localhost:8003
- Progress Analyst: http://localhost:8004
- Resume Analyzer: http://localhost:8005

## 🧪 Testing the Profile Service

### 1. Health Check
```bash
curl http://localhost:8000/health
curl http://localhost:8006/health
```

### 2. Test Resume Upload and Parsing
```bash
# Upload a resume for profile extraction
curl -X POST http://localhost:8000/api/profile/extract-profile \
  -H "Authorization: Bearer your_jwt_token" \
  -F "resume=@path/to/your/resume.pdf" \
  -F "user_id=test_user_123"
```

### 3. Get User Profile
```bash
curl -X GET http://localhost:8000/api/profile/test_user_123 \
  -H "Authorization: Bearer your_jwt_token"
```

### 4. Update Profile
```bash
curl -X PUT http://localhost:8000/api/profile/test_user_123 \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "personalInfo": {
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    }
  }'
```

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
# Access profile service container
docker-compose exec profile-service bash

# Access MongoDB
docker-compose exec mongodb mongosh -u root -p password
```

## 📊 MongoDB Collections

The system uses the following MongoDB collections:

- `users` - User authentication data
- `profiles` - User profile information
- `courses` - Generated courses
- `chapters` - Course chapters
- `mock_interviews` - Interview sessions
- `progress_tracking` - Learning progress

### Access MongoDB
```bash
# Connect to MongoDB
docker-compose exec mongodb mongosh -u root -p password

# Switch to studymate database
use studymate

# View collections
show collections

# Query profiles
db.profiles.find().pretty()
```

## 🔍 Common Issues and Solutions

### 1. Service Won't Start
- Check if ports are available
- Verify environment variables
- Check Docker logs: `docker-compose logs service-name`

### 2. MongoDB Connection Issues
- Ensure MongoDB container is running
- Check connection string in docker-compose.yml
- Verify credentials

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
- `GROQ_API_KEY` - Required for resume parsing
- `GEMINI_API_KEY` - Required for other AI features
- `JWT_SECRET` - Required for authentication
- `MONGODB_URL` - MongoDB connection string
- `REDIS_URL` - Redis connection string

### Service Communication
Services communicate via HTTP APIs through the Docker network. The API Gateway routes external requests to appropriate services.

## 📝 API Documentation

For detailed API documentation, start the services and visit:
- API Gateway Docs: http://localhost:8000/docs
- Profile Service Docs: http://localhost:8006/docs

## 🔒 Security

- JWT-based authentication
- Environment variable for sensitive data
- CORS configuration for frontend integration
- Input validation and sanitization

## 📈 Monitoring

Monitor service health using:
- Health check endpoints (`/health`)
- Docker container status
- Service logs
- MongoDB connection status

## 🤝 Contributing

1. Follow the microservices architecture
2. Add proper error handling
3. Include comprehensive logging
4. Update documentation
5. Test thoroughly before deployment