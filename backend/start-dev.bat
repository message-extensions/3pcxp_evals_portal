@echo off
REM Development Server Launcher for Windows
REM Starts FastAPI backend with auto-reload

echo ================================================
echo   3PCxP Evals Portal - Backend (Development)
echo ================================================
echo.

REM Check if .env file exists
if not exist .env (
    echo [!] ERROR: .env file not found
    echo [*] Please copy .env.example to .env and configure it
    echo.
    echo     copy .env.example .env
    echo.
    pause
    exit /b 1
)

REM Check if virtual environment exists
if not exist .venv\Scripts\activate.bat (
    echo [!] Virtual environment not found
    echo [*] Creating virtual environment with uv...
    echo.
    uv venv
    if %errorlevel% neq 0 (
        echo [!] Failed to create virtual environment
        echo [*] Make sure uv is installed: pip install uv
        pause
        exit /b 1
    )
)

REM Activate virtual environment
call .venv\Scripts\activate.bat

REM Check if dependencies are installed
python -c "import fastapi" 2>nul
if %errorlevel% neq 0 (
    echo [*] Installing dependencies with uv...
    echo.
    uv pip install -e ".[dev]"
    if %errorlevel% neq 0 (
        echo [!] Failed to install dependencies
        pause
        exit /b 1
    )
)

echo [*] Starting development server with auto-reload...
echo [*] Frontend: http://localhost:8000
echo [*] API Docs: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo.

uvicorn app.main:app --reload --port 8000
