@echo off
echo Starting AuthNet Frontend
echo ======================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Navigate to frontend directory
cd frontend\authenticity-core

REM Check if node_modules exists, install dependencies if not
if not exist node_modules (
    echo Installing dependencies...
    npm install
    if %ERRORLEVEL% NEQ 0 (
        echo Error installing dependencies
        pause
        exit /b 1
    )
)

REM Start the development server
echo Starting frontend development server...
echo The frontend will be available at http://localhost:5173
npm run dev

pause