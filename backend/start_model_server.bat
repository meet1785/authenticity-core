@echo off
echo Starting AuthNet Model Server
echo ===========================

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

REM Check if models directory exists
if not exist models (
    echo Error: Models directory not found
    echo Please make sure the models directory exists with the required model files:
    echo - models/cnn_standalone.keras
    echo - models/effnet_standalone_authnet.keras
    echo - models/vgg16_standalone_authnet.keras
    pause
    exit /b 1
)

REM Get IP address to display to user
echo Your IP addresses:
ipconfig | findstr /i "IPv4"
echo.
echo Your friend should use one of these IP addresses to connect to your model server
echo Example: http://YOUR_IP_ADDRESS:8001
echo.

REM Start the model server
echo Starting model server on port 8001...
python model_server.py

pause