from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
def root():
    return {"message": "AuthNet Backend Running"}

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "loaded_models": ["cnn", "vgg"],
        "available_models": ["cnn", "vgg"]
    }

@app.post("/predict/{model_name}")
async def predict(model_name: str):
    return {
        "model": model_name,
        "predicted_class": 0,
        "probabilities": [0.8, 0.2],
        "heatmap": None
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
