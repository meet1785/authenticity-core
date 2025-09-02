from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np
from PIL import Image
import io
import requests
import os
from config import MODEL_CONFIG, SERVER_CONFIG, PREPROCESSING_CONFIG

app = FastAPI()

# Apply CORS settings from config
app.add_middleware(
    CORSMiddleware,
    **SERVER_CONFIG["cors"]
)

# Check if we should use remote models
use_remote_models = bool(MODEL_CONFIG["remote"]["server_url"])

# Initialize models dictionary
models = {}

# Load local models if not using remote models
if not use_remote_models:
    try:
        print("Loading local models...")
        models["cnn"] = load_model(MODEL_CONFIG["local"]["cnn"])
        models["effnet"] = load_model(MODEL_CONFIG["local"]["effnet"])
        models["vgg"] = load_model(MODEL_CONFIG["local"]["vgg"])
        print("Local models loaded successfully")
    except Exception as e:
        print(f"Error loading local models: {e}")
        # Continue without models - they might be loaded later or we'll use remote

# Preprocess uploaded image
def preprocess_image(file, target_size=None):
    if target_size is None:
        target_size = PREPROCESSING_CONFIG["image_size"]
        
    img = Image.open(io.BytesIO(file)).convert("RGB")
    img = img.resize(target_size)
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    
    if PREPROCESSING_CONFIG["normalize"]:
        img_array /= PREPROCESSING_CONFIG["normalization_factor"]
        
    return img_array

@app.post("/predict/{model_name}")
async def predict(model_name: str, file: UploadFile = File(...)):
    if model_name not in ["cnn", "effnet", "vgg"]:
        raise HTTPException(status_code=400, detail="Invalid model name. Use cnn, effnet, or vgg")
    
    contents = await file.read()
    
    # If using remote models, forward the request
    if use_remote_models:
        try:
            remote_url = f"{MODEL_CONFIG['remote']['server_url']}{MODEL_CONFIG['remote']['endpoints'][model_name]}"
            
            # Prepare headers with API key if provided
            headers = {}
            if MODEL_CONFIG['remote']['api_key']:
                headers['Authorization'] = f"Bearer {MODEL_CONFIG['remote']['api_key']}"
            
            # Create a new file-like object from the contents
            files = {'file': (file.filename, contents, file.content_type)}
            
            # Forward the request to the remote model server
            response = requests.post(
                remote_url,
                files=files,
                headers=headers,
                timeout=MODEL_CONFIG['remote']['timeout']
            )
            
            # Check if the request was successful
            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Remote model server error: {response.text}"
                )
                
        except requests.RequestException as e:
            raise HTTPException(
                status_code=503,
                detail=f"Error connecting to remote model server: {str(e)}"
            )
    
    # If not using remote models, use local models
    if model_name not in models:
        raise HTTPException(
            status_code=503,
            detail=f"Model {model_name} is not loaded and no remote server is configured"
        )
    
    # Process with local model
    try:
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
        raise HTTPException(
            status_code=500,
            detail=f"Error processing with local model: {str(e)}"
        )

@app.get("/")
def root():
    return {"message": "Backend is running. Use /predict/cnn or /predict/effnet or /predict/vgg"}

@app.get("/health")
def health_check():
    return {"status": "ok"}