@echo off
echo ===================================
echo Starting Finora Frontend
echo ===================================
echo.

cd frontend

echo Installing dependencies...
call npm install

echo.
echo Starting development server...
echo Server will open at http://localhost:3000
echo.

call npm run dev

pause
