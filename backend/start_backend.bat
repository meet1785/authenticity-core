@echo off
echo Starting AuthNet Backend with Remote Model Configuration
echo ======================================================

REM Check if Python is installed
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Check if virtual environment exists, create if not
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
    if %ERRORLEVEL% NEQ 0 (
        echo Error creating virtual environment
        pause
        exit /b 1
    )
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate

REM Install requirements if needed
echo Installing requirements...
pip install -r requirements.txt

REM Ask for model server URL
set /p MODEL_SERVER_URL=Enter your friend's model server URL (e.g., http://192.168.1.100:8001): 

REM Test connection to model server
echo Testing connection to model server...
python test_connection.py %MODEL_SERVER_URL%

REM Start the backend server
echo Starting backend server...
uvicorn main:app --reload --host 0.0.0.0 --port 8000

pause