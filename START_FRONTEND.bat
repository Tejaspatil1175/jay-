@echo off
echo ========================================
echo   Opening Finora AI Frontend
echo ========================================
echo.

cd frontend

echo Starting local web server...
echo.
echo Frontend will be available at: http://localhost:8080
echo.
echo IMPORTANT: Keep this window open!
echo Press Ctrl+C to stop the server
echo.

python -m http.server 8080

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Python not found or failed to start server
    echo Alternative: Just double-click 'frontend/index.html'
    pause
)
