#!/usr/bin/env powershell
Write-Host "🧪 Testing StudyMate Backend Services" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Test API Gateway (Port 8000)
Write-Host ""
Write-Host "🌐 Testing API Gateway (Port 8000)..." -ForegroundColor Blue
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ API Gateway is healthy!" -ForegroundColor Green
        $healthData = $response.Content | ConvertFrom-Json
        Write-Host "   Status: $($healthData.status)"
    }
} catch {
    Write-Host "❌ API Gateway not responding: $_" -ForegroundColor Red
}

# Test Profile Service (Port 8006) 
Write-Host ""
Write-Host "👤 Testing Profile Service (Port 8006)..." -ForegroundColor Blue
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8006/health" -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Profile Service is healthy!" -ForegroundColor Green
        $healthData = $response.Content | ConvertFrom-Json
        Write-Host "   Status: $($healthData.status)"
        Write-Host "   Service: $($healthData.service)"
    }
} catch {
    Write-Host "❌ Profile Service not responding: $_" -ForegroundColor Red
}

# Test root endpoint for Profile Service
Write-Host ""
Write-Host "🔍 Testing Profile Service root endpoint..." -ForegroundColor Blue
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8006/" -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Profile Service root endpoint working!" -ForegroundColor Green
        $rootData = $response.Content | ConvertFrom-Json
        Write-Host "   Service: $($rootData.service)"
        Write-Host "   Version: $($rootData.version)"
    }
} catch {
    Write-Host "❌ Profile Service root endpoint failed: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Service URLs:" -ForegroundColor Yellow
Write-Host "   API Gateway: http://localhost:8000" -ForegroundColor Cyan
Write-Host "   Profile Service: http://localhost:8006" -ForegroundColor Cyan
Write-Host "   API Docs: http://localhost:8006/docs" -ForegroundColor Cyan

Read-Host "Press Enter to exit"
