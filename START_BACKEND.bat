@echo off
echo ========================================
echo   Starting Finora AI Backend Server
echo ========================================
echo.

cd backend

echo Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found! Install Node.js first.
    pause
    exit /b 1
)

echo.
echo Installing dependencies...
call npm install

echo.
echo Starting server on port 5000...
echo.
echo Backend will be available at: http://localhost:5000
echo Press Ctrl+C to stop the server
echo.
call npm start

pause
