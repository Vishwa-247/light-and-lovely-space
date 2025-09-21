@echo off
echo 🚀 StudyMate Profile Service Launcher
echo ====================================

cd /d "%~dp0"

echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to activate virtual environment!
    echo Please make sure venv is properly set up
    pause
    exit /b 1
)
echo ✅ Virtual environment activated!
echo.

echo 📦 Installing/updating required packages...
python -m pip install --upgrade pip
python -m pip install fastapi uvicorn groq asyncpg supabase python-dotenv PyPDF2 python-docx python-multipart pydantic

echo ✅ Packages installed!
echo.

echo 👤 Starting Profile Service on http://localhost:8006
echo 📖 API Documentation: http://localhost:8006/docs
echo ❤️  Health Check: http://localhost:8006/health
echo.
echo Press Ctrl+C to stop the server
echo ====================================
echo.

python -m uvicorn agents.profile-service.main:app --host 0.0.0.0 --port 8006 --reload

pause
