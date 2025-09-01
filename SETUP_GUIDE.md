# AuthenticityNet Setup Guide

This guide will help you set up and run the AuthenticityNet application, which consists of a frontend, backend API, and optional model server for distributed deployment.

## Project Overview

AuthenticityNet is an AI-powered image authenticity verification system with three components:

1. **Frontend**: React-based user interface for uploading and analyzing images
2. **Backend API**: FastAPI server that processes requests and connects to models
3. **Model Server** (optional): Separate server that hosts the AI models for distributed setup

## Setup Options

### Option 1: Local Setup (All-in-One)

Run everything on your local machine:

1. Backend API with local models
2. Frontend connecting to local backend

### Option 2: Distributed Setup

Distribute components across machines:

1. Your friend runs the Model Server
2. You run the Backend API (connecting to remote Model Server)
3. You run the Frontend (connecting to your Backend API)

## Setup Instructions

### Backend Setup

1. Navigate to the project directory:
   ```
   cd "C:\Users\MEET\Documents\AuthNetFolder[1]\AuthNetFolder"
   ```

2. Run the `start_backend.bat` script:
   ```
   start_backend.bat
   ```

3. When prompted, enter the model server URL:
   - For local setup: Leave empty and press Enter
   - For distributed setup: Enter your friend's model server URL (e.g., `http://192.168.1.100:8001`)

4. The backend will start on `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd "C:\Users\MEET\Documents\AuthNetFolder[1]\AuthNetFolder\frontend\authenticity-core"
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. The frontend will be available at `http://localhost:5173`

## Distributed Setup (For Your Friend)

If using the distributed setup, your friend needs to:

1. Copy the project files to their machine
2. Run the model server:
   ```
   start_model_server.bat
   ```
3. Share their IP address with you
4. You'll use `http://their-ip-address:8001` as the model server URL

## Configuration

### Backend Configuration

The backend configuration is in `config.py`:

- `MODEL_CONFIG`: Settings for local and remote models
- `SERVER_CONFIG`: API server settings including CORS, host, and port
- `PREPROCESSING_CONFIG`: Image preprocessing settings

### Frontend Configuration

The frontend connects to the backend API using the URL configured in `localStorage` or defaults to `http://localhost:8000`.

## Troubleshooting

### Connection Issues

1. **Backend can't connect to Model Server**:
   - Check if the Model Server is running
   - Verify the URL is correct
   - Ensure there are no firewall issues

2. **Frontend can't connect to Backend**:
   - Check if the Backend is running
   - Verify CORS settings in `config.py`
   - Check browser console for errors

### Model Loading Issues

1. **Models not found**:
   - Ensure model files exist in the `models` directory
   - Check file paths in `config.py`

## Additional Resources

- See `DISTRIBUTED_SETUP.md` for detailed distributed deployment instructions
- See `FRONTEND_CONNECTION.md` for frontend-backend connection details