@echo off
echo 🚀 Setting up StudyMate AI Backend...

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker first.
    echo Visit: https://docs.docker.com/get-docker/
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    echo Visit: https://docs.docker.com/compose/install/
    pause
    exit /b 1
)

echo ✅ Docker and Docker Compose are installed

REM Stop any existing containers
echo 🛑 Stopping existing containers...
docker-compose down

REM Build and start the services
echo 🔨 Building and starting backend services...
docker-compose up --build -d

REM Wait for services to start
echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak

REM Check if services are running
echo 🔍 Checking service status...
docker-compose ps

echo.
echo 🎉 Backend setup complete!
echo.
echo Services running:
echo 📡 API Gateway: http://localhost:8000
echo 🤖 Resume Analyzer: http://localhost:8001
echo 📚 Course Generation: http://localhost:8002
echo 🎤 Interview Coach: http://localhost:8003
echo 💬 Chat Mentor: http://localhost:8004
echo 📊 Progress Analyst: http://localhost:8005
echo 🗄️  MongoDB: localhost:27017
echo.
echo To view logs: docker-compose logs -f
echo To stop: docker-compose down
pause