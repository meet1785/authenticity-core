@echo off
echo Starting AuthNet Application (Backend and Frontend)
echo ======================================================

REM Resolve Python command (prefer existing python, fallback to py -3)
set "PY_CMD=python"
where python >nul 2>&1 || set "PY_CMD=py -3"
%PY_CMD% --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Python is not installed or not in PATH
    echo Install from https://www.python.org/downloads/ or enable App Execution Alias.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Create a new command window for the backend
echo Starting backend server in a new window...
start cmd /k "title AuthNet Backend && call start_backend.bat"

REM Wait a moment for the backend to start
timeout /t 5 /nobreak

REM Create a new command window for the frontend
echo Starting frontend server in a new window...
start cmd /k "title AuthNet Frontend && call start_frontend.bat"

echo ======================================================
echo AuthNet application is starting:
echo - Backend: http://localhost:8000
echo - Frontend: http://localhost:5173 (will open automatically)
echo ======================================================
echo You can close this window, but keep the backend and frontend windows open.

pause