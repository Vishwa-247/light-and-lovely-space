# Phase 1: Migration from Supabase to FastAPI + MongoDB

## Overview
This document outlines the migration from Supabase to a FastAPI + MongoDB microservices architecture for the StudyMate AI platform.

## Files Removed/Deprecated

### Completely Removed Files:
1. **Supabase Integration:**
   - `src/integrations/supabase/client.ts` - ❌ No longer needed
   - `src/integrations/supabase/types.ts` - ❌ Replaced with backend types
   - `supabase/config.toml` - ❌ Supabase configuration
   - `supabase/functions/openai-api/index.ts` - ❌ Edge function replaced by agents

2. **Old Flask API:**
   - `api/flask_api.py` - ❌ Replaced with FastAPI microservices
   - `api/README.md` - ❌ Old API documentation

3. **Static Data Files (migrated to database):**
   - `src/data/staticCourses.ts` - ❌ Data moved to MongoDB
   - `src/data/mockInterviewData.ts` - ❌ Data moved to MongoDB

### Modified Files:
1. **Configuration:**
   - `src/configs/environment.ts` - ✅ Updated for new API endpoints

2. **Services:**
   - `src/services/api.ts` - ✅ Updated to use new API services
   - `src/services/openaiService.ts` - ✅ Will be deprecated in Phase 2

3. **Hooks:**
   - `src/hooks/useSessionManager.ts` - ✅ Updated for JWT authentication
   - `src/hooks/useCourseGeneration.ts` - ✅ Updated to use new course service
   - `src/hooks/auth/useSignIn.ts` - ❓ May need updates
   - `src/hooks/auth/useSignOut.ts` - ❓ May need updates
   - `src/hooks/auth/useSignUp.ts` - ❓ May need updates

4. **Components:**
   - All UI components remain unchanged (keeping same UI)

## New Backend Structure

```
backend/
├── api-gateway/              # Main FastAPI gateway (Port 8000)
│   ├── main.py              # Gateway routing and auth
│   ├── Dockerfile
│   └── requirements.txt
├── agents/
│   ├── course-generation/   # Course Generation Agent (Port 8001)
│   ├── interview-coach/     # Interview Coach Agent (Port 8002)
│   ├── chat-mentor/         # Chat Mentor Agent (Port 8003)
│   ├── progress-analyst/    # Progress Analyst Agent (Port 8004)
│   ├── resume-analyzer/     # Resume Analyzer Agent (Port 8005)
│   └── exam-prep/          # Exam Prep Agent (Port 8006)
├── shared/
│   ├── database/           # MongoDB connection and utilities
│   ├── models/            # Pydantic schemas
│   └── utils/             # Shared utilities
└── docker-compose.yml     # Development orchestration
```

## New Frontend API Layer

```
src/api/
├── client.ts               # API client with JWT handling
└── services/
    ├── authService.ts      # Authentication API calls
    ├── courseService.ts    # Course management API calls
    ├── interviewService.ts # Interview API calls
    └── chatService.ts      # Chat API calls
```

## Database Migration

### MongoDB Collections:
1. **users** - User profiles and authentication
2. **courses** - Course metadata and content
3. **chapters** - Individual course chapters
4. **flashcards** - Course flashcards
5. **mcqs** - Multiple choice questions
6. **qnas** - Question and answer pairs
7. **mock_interviews** - Interview sessions
8. **interview_questions** - Interview question bank
9. **interview_analysis** - Interview analysis results
10. **progress_tracking** - User progress data
11. **dsa_problems** - DSA problem tracking

## Development Setup

### Prerequisites:
- Docker and Docker Compose
- Node.js (for frontend)
- Python 3.11+ (for backend development)

### Environment Variables:
Create a `.env` file in the backend directory:
```env
MONGODB_URL=mongodb://admin:password@localhost:27017/studymate_db?authSource=admin
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-change-in-production
GEMINI_API_KEY=your-gemini-api-key
```

### Start Development Environment:
```bash
# Start backend services
cd backend
docker-compose up -d

# Start frontend (in separate terminal)
cd ..
npm run dev
```

### API Endpoints:
- **API Gateway:** http://localhost:8000
- **Course Generation Agent:** http://localhost:8001
- **Interview Coach Agent:** http://localhost:8002
- **MongoDB:** localhost:27017
- **Redis:** localhost:6379

## Migration Status

### ✅ Completed:
1. FastAPI backend architecture setup
2. MongoDB database design and connection
3. API Gateway with JWT authentication
4. Course Generation Agent
5. Interview Coach Agent
6. Frontend API layer updates
7. Authentication system migration
8. Docker development environment

### 🚧 In Progress:
1. Chat Mentor Agent
2. Progress Analyst Agent
3. Resume Analyzer Agent
4. Exam Prep Agent
5. Data migration scripts

### ⏳ Pending (Phase 2):
1. AI/ML model integration
2. Inter-agent communication system
3. Production deployment setup
4. Advanced analytics and monitoring

## API Compatibility

The new API maintains compatibility with existing frontend code through:
1. Service layer abstraction
2. Legacy method wrappers
3. Consistent data structures
4. Error handling

## Testing

### Backend Testing:
```bash
cd backend
python -m pytest
```

### Frontend Testing:
```bash
npm test
```

### Integration Testing:
```bash
# Start all services
docker-compose up -d

# Run integration tests
npm run test:integration
```

## Rollback Plan

If issues arise, you can rollback by:
1. Reverting the modified files to their previous versions
2. Re-installing Supabase dependencies
3. Stopping Docker containers

## Next Steps (Phase 2)

1. Implement remaining agents
2. Add AI/ML model integration
3. Setup inter-agent communication
4. Implement advanced features (mind maps, visual content)
5. Production deployment and monitoring

## Support

For issues or questions during migration:
1. Check Docker container logs: `docker-compose logs [service-name]`
2. Verify API endpoints are responding: `curl http://localhost:8000/health`
3. Check MongoDB connection: `docker exec -it studymate_mongodb mongo`