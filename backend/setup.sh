#!/bin/bash

echo "🚀 Setting up StudyMate AI Backend..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start the services
echo "🔨 Building and starting backend services..."
docker-compose up --build -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

echo ""
echo "🎉 Backend setup complete!"
echo ""
echo "Services running:"
echo "📡 API Gateway: http://localhost:8000"
echo "🤖 Resume Analyzer: http://localhost:8001"
echo "📚 Course Generation: http://localhost:8002"
echo "🎤 Interview Coach: http://localhost:8003"
echo "💬 Chat Mentor: http://localhost:8004"
echo "📊 Progress Analyst: http://localhost:8005"
echo "🗄️  MongoDB: localhost:27017"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"