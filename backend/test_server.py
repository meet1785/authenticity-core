from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

# Apply CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
def root():
    return {"message": "Backend is running. Models loading..."}

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "loaded_models": [],
        "available_models": ["cnn", "vgg"]
    }

@app.post("/predict/{model_name}")
async def predict(model_name: str, file: UploadFile = File(...)):
    return {
        "model": model_name,
        "predicted_class": 0,
        "probabilities": [0.7, 0.3],
        "heatmap": None,
        "message": "Models still loading, returning test data"
    }

if __name__ == "__main__":
    print("🚀 Starting FastAPI server...")
    uvicorn.run("test_server:app", host="0.0.0.0", port=8000, reload=True)
