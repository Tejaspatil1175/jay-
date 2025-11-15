@echo off
echo ========================================
echo   Finora Backend - Starting Services
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if MongoDB is running
echo [INFO] Checking MongoDB connection...
mongo --eval "db.version()" >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] MongoDB is not running!
    echo Please start MongoDB or update MONGODB_URI in .env file
    echo.
)

REM Check if .env file exists
if not exist ".env" (
    echo [WARNING] .env file not found!
    echo Creating from .env.example...
    copy .env.example .env
    echo [INFO] Please update .env file with your API keys!
    notepad .env
    pause
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies!
        pause
        exit /b 1
    )
)

REM Start Apache Tika with Docker
echo [INFO] Starting Apache Tika server...
docker-compose up -d tika 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] Failed to start Tika with Docker
    echo Document processing may not work
    echo Install Docker from: https://www.docker.com/products/docker-desktop
    echo.
)

REM Start the backend server
echo.
echo ========================================
echo   Starting Finora Backend Server
echo ========================================
echo.
echo Server will start at: http://localhost:5000
echo Press Ctrl+C to stop
echo.

call npm start

pause
