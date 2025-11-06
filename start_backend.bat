@echo off
echo ========================================
echo   Medicine Detection System - Backend
echo ========================================
echo.

cd backend

REM Check if virtual environment exists
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
    echo.
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate
echo.

REM Check if dependencies are installed
if not exist "venv\Lib\site-packages\flask" (
    echo Installing dependencies...
    pip install -r requirements.txt
    echo.
)

REM Start the server
echo Starting backend server...
echo.
python app.py

pause

