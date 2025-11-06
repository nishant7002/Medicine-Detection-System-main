@echo off
echo ========================================
echo   Medicine Detection System - Frontend
echo ========================================
echo.

REM Try to use Python HTTP server, or fall back to opening file
python -m http.server 8000 >nul 2>&1 &
if errorlevel 1 (
    echo Python server not available, opening index.html directly...
    start index.html
    pause
    exit
)

REM Wait a moment for server to start
timeout /t 1 /nobreak >nul

REM Open browser
echo Server started on http://localhost:8000
start http://localhost:8000

echo.
echo Frontend is now running!
echo Press any key to stop the server...
pause

