# Connecting Frontend to FastAPI Backend

This guide explains how to connect the React frontend from `authenticity-core` to the FastAPI backend we've created.

## Overview

To connect the frontend to the backend, you'll need to:

1. Update the API configuration in the frontend
2. Ensure the backend is running and accessible
3. Configure CORS on the backend to allow frontend requests

## Frontend Changes

### 1. Update API Configuration

In the frontend code, you need to modify the `api.ts` file to point to your backend server. Here's how to update it:

```typescript
// In src/lib/api.ts

// Change this line:
const API_BASE_URL = localStorage.getItem('api_base_url') || '';

// To this:
const API_BASE_URL = localStorage.getItem('api_base_url') || 'http://localhost:8000';
```

This sets the default API URL to your local FastAPI server if no custom URL is configured.

### 2. Update API Status Component

Update the `ApiStatus.tsx` component to check the actual API connection:

```typescript
// In src/components/ApiStatus.tsx
import { Shield, Activity, Database, Cpu } from "lucide-react";
import { useEffect, useState } from "react";
import { testAPIConnection } from "@/lib/api";

export function ApiStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      const startTime = Date.now();
      try {
        const connected = await testAPIConnection();
        const endTime = Date.now();
        setIsConnected(connected);
        setLatency(endTime - startTime);
      } catch (error) {
        setIsConnected(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="glass-panel rounded-lg p-3 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className={`status-indicator ${isConnected ? 'text-primary' : 'text-muted-foreground'}`} />
          <span className="text-xs font-medium">
            {isConnected ? 'API Connected' : 'Demo Mode'}
          </span>
        </div>

        {latency && (
          <div className="flex items-center gap-1">
            <Activity className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{latency}ms</span>
          </div>
        )}

        {isConnected && (
          <div className="flex items-center gap-1">
            <Cpu className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">GPU</span>
          </div>
        )}
      </div>
    </div>
  );
}
```

### 3. Update Detection Logic

Modify the `detection.ts` file to use the API instead of mock data:

```typescript
// In src/lib/detection.ts
import { DetectionResult, ModelPrediction } from "@/types/detection";
import { detectDeepfakeAPI } from "./api";

export async function detectDeepfake(
  imageData: string | File,
  config?: { models?: string[]; returnHeatmaps?: boolean }
): Promise<DetectionResult> {
  try {
    // Always try to use the API first
    return await detectDeepfakeAPI(imageData, {
      models: config?.models || ['CNN', 'EfficientNet', 'VGG16'],
      returnHeatmaps: true,
    });
  } catch (error) {
    console.log('API call failed, falling back to mock data:', error);
    // Fall back to mock data if API fails
    
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Generate mock predictions with realistic variations
    const cnnConfidence = 80 + Math.random() * 19; // 80-99%
    const efficientNetConfidence = 75 + Math.random() * 24; // 75-99%
    const vitConfidence = 82 + Math.random() * 17; // 82-99%

    // Randomly determine if fake (30% chance for demo)
    const isFake = Math.random() < 0.3;

    const modelPredictions: ModelPrediction[] = [
      {
        name: "CNN",
        realConfidence: isFake ? 100 - cnnConfidence : cnnConfidence,
        fakeConfidence: isFake ? cnnConfidence : 100 - cnnConfidence,
      },
      {
        name: "EfficientNet",
        realConfidence: isFake ? 100 - efficientNetConfidence : efficientNetConfidence,      
        fakeConfidence: isFake ? efficientNetConfidence : 100 - efficientNetConfidence,      
      },
      {
        name: "VGG16",
        realConfidence: isFake ? 100 - vitConfidence : vitConfidence,
        fakeConfidence: isFake ? vitConfidence : 100 - vitConfidence,
      },
    ];

    // Calculate ensemble confidence (majority voting)
    const avgConfidence = modelPredictions.reduce((acc, model) => {
      return acc + (isFake ? model.fakeConfidence : model.realConfidence);
    }, 0) / modelPredictions.length;

    return {
      prediction: isFake ? "Fake" : "Real",
      isDeepfake: isFake,
      ensembleConfidence: Math.round(avgConfidence),
      modelPredictions: modelPredictions.map(pred => ({
        ...pred,
        realConfidence: Math.round(pred.realConfidence),
        fakeConfidence: Math.round(pred.fakeConfidence),
      })),
      timestamp: new Date().toISOString(),
      // Mock heatmaps for demo
      cnnHeatmap: undefined,
      efficientNetHeatmap: undefined,
      vitHeatmap: undefined,
      imageUrl: imageData instanceof File ? URL.createObjectURL(imageData) : imageData,
    };
  }
}
```

## Backend Changes

### 1. Enable CORS

Update your `main.py` file to enable CORS for the frontend:

```python
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, specify the actual frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rest of your code...
```

## Running the Connected Application

1. Start the backend server:
   ```
   cd path/to/backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

2. In a separate terminal, start the frontend:
   ```
   cd path/to/authenticity-core
   npm install
   npm run dev
   ```

3. Open the frontend in your browser (usually at http://localhost:5173)

4. The API status indicator should show "API Connected" if everything is working correctly

## Remote Backend Setup

If your friend is hosting the backend on their machine:

1. They need to run the backend with the host flag to make it accessible on their network:
   ```
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

2. You need to configure the frontend to use their IP address:
   - Open the frontend application
   - Click on the settings/configuration icon
   - Enter your friend's IP address with the port (e.g., `http://192.168.1.100:8000`)
   - Click "Test Connection" and then "Save"

3. Alternatively, use a tunneling service like ngrok:
   ```
   ngrok http 8000
   ```
   Then use the ngrok URL as the API base URL in the frontend configuration.

## Troubleshooting

- **CORS Errors**: If you see CORS errors in the browser console, ensure the backend CORS middleware is configured correctly
- **Connection Refused**: Check that the backend server is running and accessible from the frontend's location
- **404 Errors**: Verify that the API endpoints in the frontend match those defined in the backend