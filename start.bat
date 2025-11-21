@echo off
REM 3PCxP Evals Portal Launcher for Windows

echo ================================================
echo   3PCxP Evals Portal - Phase 1 MVP
echo ================================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo [*] Starting HTTP server with Python...
    echo [*] Portal will be available at: http://localhost:8000
    echo.
    echo Press Ctrl+C to stop the server
    echo.
    python -m http.server 8000
) else (
    echo [!] Python not found. Trying alternative methods...
    echo.
    
    REM Check if Node.js is available
    node --version >nul 2>&1
    if %errorlevel% == 0 (
        echo [*] Starting HTTP server with Node.js...
        echo [*] Portal will be available at: http://localhost:8000
        echo.
        npx http-server -p 8000
    ) else (
        echo [!] Neither Python nor Node.js found.
        echo.
        echo Please do one of the following:
        echo   1. Install Python: https://www.python.org/downloads/
        echo   2. Install Node.js: https://nodejs.org/
        echo   3. Open index.html directly in your browser
        echo.
        pause
    )
)
