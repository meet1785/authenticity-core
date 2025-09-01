# Model Server for AuthNet
# This script runs a dedicated model server that the main application can connect to

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np
from PIL import Image
import io
import uvicorn
import os

app = FastAPI(title="AuthNet Model Server")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model paths - can be customized by your friend
MODEL_PATHS = {
    "cnn": "models/cnn_standalone.keras",
    "effnet": "models/effnet_standalone_authnet.keras",
    "vgg": "models/vgg16_standalone_authnet.keras"
}

# Image preprocessing settings
IMAGE_SIZE = (224, 224)
NORMALIZE = True
NORMALIZATION_FACTOR = 255.0

# Load models
models = {}

# Preprocess uploaded image
def preprocess_image(file):
    img = Image.open(io.BytesIO(file)).convert("RGB")
    img = img.resize(IMAGE_SIZE)
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    
    if NORMALIZE:
        img_array /= NORMALIZATION_FACTOR
        
    return img_array

@app.on_event("startup")
async def startup_event():
    """Load models on startup"""
    try:
        print("Loading models...")
        for model_name, model_path in MODEL_PATHS.items():
            if os.path.exists(model_path):
                models[model_name] = load_model(model_path)
                print(f"Loaded model: {model_name}")
            else:
                print(f"Warning: Model file not found: {model_path}")
        print("Model loading complete")
    except Exception as e:
        print(f"Error loading models: {e}")

@app.post("/predict/{model_name}")
async def predict(model_name: str, file: UploadFile = File(...)):
    """Make a prediction using the specified model"""
    if model_name not in MODEL_PATHS:
        raise HTTPException(status_code=400, detail=f"Invalid model name. Use one of: {', '.join(MODEL_PATHS.keys())}")
    
    if model_name not in models:
        raise HTTPException(status_code=503, detail=f"Model {model_name} is not loaded")
    
    try:
        contents = await file.read()
        img_array = preprocess_image(contents)
        prediction = models[model_name].predict(img_array)
        predicted_class = int(np.argmax(prediction, axis=1)[0])
        probabilities = prediction.tolist()[0]
        
        return {
            "model": model_name,
            "predicted_class": predicted_class,
            "probabilities": probabilities
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@app.get("/health")
def health_check():
    """Health check endpoint"""
    loaded_models = list(models.keys())
    return {
        "status": "ok",
        "loaded_models": loaded_models,
        "available_models": list(MODEL_PATHS.keys())
    }

@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "AuthNet Model Server is running",
        "endpoints": {
            "health": "/health",
            "predict": "/predict/{model_name}"
        },
        "loaded_models": list(models.keys())
    }

if __name__ == "__main__":
    # Run the server on port 8001 by default
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run("model_server:app", host="0.0.0.0", port=port, reload=True)