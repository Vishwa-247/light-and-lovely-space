# DSA Service - Setup and Testing Guide

This guide will help you set up and test the enhanced DSA Sheet with comprehensive filters and MongoDB persistence.

## Prerequisites

- Docker and Docker Compose installed
- MongoDB running (included in docker-compose)
- Node.js (for frontend development)

## Setup Instructions

### 1. Environment Configuration

1. Copy the environment template:
```bash
cd backend
cp .env.example .env
```

2. Add your environment variables to `.env`:
```env
GROQ_API_KEY=your_groq_api_key_here
MONGODB_URL=mongodb://mongodb:27017
DATABASE_NAME=coding_interview_prep
JWT_SECRET=your_jwt_secret_here
```

### 2. Start the Services

Build and start all services using Docker Compose:

```bash
cd backend
docker-compose up --build
```

This will start:
- MongoDB (port 27017)
- API Gateway (port 8000)
- Profile Service (port 8001)
- Resume Analyzer (port 8002)
- Resume Analyzer Groq (port 8006)
- DSA Service (port 8007)
- Orchestrator (port 8099)

### 3. Verify Services

Check if all services are running:

```bash
# Check DSA Service health
curl http://localhost:8000/api/dsa/health

# Expected response:
# {"status": "healthy", "service": "dsa-service"}

# Check API Gateway
curl http://localhost:8000/health

# Expected response:
# {"status": "healthy", "message": "API Gateway is running"}
```

## DSA Service Features

### 1. Progress Tracking

Track user progress on DSA problems:

```bash
# Update progress
curl -X POST http://localhost:8000/api/dsa/progress \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "topic_id": "string-basics",
    "problem_name": "Reverse String",
    "completed": true,
    "difficulty": "Easy",
    "category": "inside"
  }'

# Get user progress
curl http://localhost:8000/api/dsa/progress/test_user
```

### 2. Filter Management

Save and retrieve user filter preferences:

```bash
# Save filters
curl -X POST http://localhost:8000/api/dsa/filters \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "filters": {
      "difficulty": ["Easy", "Medium"],
      "category": ["inside"],
      "companies": ["Adobe"]
    }
  }'

# Get filters
curl http://localhost:8000/api/dsa/filters/test_user
```

### 3. Favorites Management

Add/remove favorites:

```bash
# Add to favorites
curl -X POST http://localhost:8000/api/dsa/favorites \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "item_id": "string-basics"
  }'

# Remove from favorites
curl -X DELETE http://localhost:8000/api/dsa/favorites/test_user/string-basics

# Get favorites
curl http://localhost:8000/api/dsa/favorites/test_user
```

### 4. Analytics

View user analytics:

```bash
curl http://localhost:8000/api/dsa/analytics/test_user
```

Expected response:
```json
{
  "user_id": "test_user",
  "total_problems": 10,
  "solved_problems": 5,
  "difficulty": {
    "Easy": 3,
    "Medium": 2
  },
  "category": {
    "inside": 4,
    "outside": 1
  },
  "streak_days": 3,
  "last_activity": "2024-01-15T10:30:00Z"
}
```

## Frontend Features

The enhanced DSA Sheet includes:

### 1. Advanced Filtering
- **Difficulty**: Easy, Medium, Hard
- **Category**: Inside (basic), Outside (advanced)
- **Company Names**: Filter by specific companies

### 2. Search Functionality
- Search across topics and companies
- Real-time filtering

### 3. Favorites System
- Mark topics/companies as favorites
- Persistent across sessions

### 4. Progress Tracking
- Visual progress indicators
- Completion percentages
- Statistics dashboard

### 5. MongoDB Persistence
- User preferences saved to MongoDB
- Filter settings persist across sessions
- Progress tracking with analytics

## Testing the Application

### 1. Manual Testing

1. **Start the application**:
```bash
# In one terminal - Backend
cd backend
docker-compose up

# In another terminal - Frontend
npm run dev
```

2. **Navigate to DSA Sheet**:
   - Open http://localhost:5173/dsa-sheet
   - Test filtering by difficulty (Easy, Medium, Hard)
   - Test filtering by category (inside, outside)
   - Test company filtering
   - Test search functionality

3. **Test Favorites**:
   - Click star icons to add/remove favorites
   - Verify persistence after page refresh

### 2. API Testing

Use the provided curl commands above to test each endpoint.

### 3. Database Verification

Connect to MongoDB to verify data persistence:

```bash
# Connect to MongoDB container
docker exec -it mongodb mongosh

# Use the database
use coding_interview_prep

# Check collections
show collections

# View DSA progress
db.dsa_progress.find().pretty()

# View user preferences
db.dsa_preferences.find().pretty()

# View analytics
db.dsa_analytics.find().pretty()
```

## Troubleshooting

### Common Issues

1. **Service not starting**:
   - Check Docker containers: `docker ps`
   - View logs: `docker-compose logs [service-name]`

2. **MongoDB connection issues**:
   - Ensure MongoDB container is running
   - Check network connectivity between services

3. **API Gateway routing issues**:
   - Verify service URLs in api-gateway configuration
   - Check service health endpoints

4. **Frontend build errors**:
   - Clear node_modules and reinstall dependencies
   - Check TypeScript compilation errors

### Debug Commands

```bash
# View all container logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f dsa-service

# Restart specific service
docker-compose restart dsa-service

# Rebuild and restart
docker-compose up --build dsa-service
```

## Performance Monitoring

Monitor the application performance:

1. **Database Queries**: Check MongoDB slow query log
2. **API Response Times**: Monitor endpoint response times
3. **Memory Usage**: Check container resource usage
4. **Error Rates**: Monitor application logs for errors

## Production Deployment

For production deployment:

1. **Environment Variables**: Set production values in `.env`
2. **Database**: Use managed MongoDB service
3. **Scaling**: Use Docker Swarm or Kubernetes
4. **Monitoring**: Implement comprehensive logging and monitoring
5. **Security**: Add authentication and authorization middleware

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review container logs
3. Verify API endpoints using curl commands
4. Check MongoDB data consistency