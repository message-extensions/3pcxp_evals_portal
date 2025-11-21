@echo off
REM Production Server Launcher for Windows
REM Starts FastAPI backend with multiple workers

echo ================================================
echo   3PCxP Evals Portal - Backend (Production)
echo ================================================
echo.

REM Check if .env file exists
if not exist .env (
    echo [!] ERROR: .env file not found
    echo [*] Please copy .env.example to .env and configure it
    echo.
    pause
    exit /b 1
)

REM Check if virtual environment exists
if not exist .venv\Scripts\activate.bat (
    echo [!] Virtual environment not found. Run setup first.
    pause
    exit /b 1
)

REM Activate virtual environment
call .venv\Scripts\activate.bat

echo [*] Starting production server with 4 workers...
echo [*] Frontend: http://0.0.0.0:8000
echo [*] API Docs: http://0.0.0.0:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo.

uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
