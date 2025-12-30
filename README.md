# AuthenticityNet

AuthenticityNet is an AI-powered image authenticity verification system that uses multiple deep learning models (CNN, EfficientNet, and VGG16) to analyze and classify images. The system consists of a React frontend, FastAPI backend, and supports both local and distributed deployment options.

## Features

- 🤖 **Multiple AI Models**: CNN, EfficientNet, and VGG16 for accurate deepfake detection
- 🎯 **Ensemble Predictions**: Majority voting across models for improved accuracy
- 📦 **Batch Processing**: Process multiple images in a single API call for efficiency
- 🔥 **GradCAM Heatmaps**: Visual explanations of model decisions
- ⚡ **Intelligent Caching**: ~99% faster responses for repeated queries
- 🛡️ **Rate Limiting**: Protection against abuse with configurable limits
- 📊 **Structured Logging**: JSON-formatted logs for monitoring and debugging
- 📈 **Analytics & Monitoring**: Track predictions, model performance, and system metrics
- 🌐 **Distributed Support**: Optional remote model server deployment
- 🎨 **Modern UI**: React-based frontend with real-time analysis

For details on rate limiting and caching, see [RATE_LIMITING_CACHING.md](RATE_LIMITING_CACHING.md).

For details on analytics and monitoring, see [ANALYTICS.md](ANALYTICS.md).

For details on batch predictions, see [BATCH_PREDICTION.md](BATCH_PREDICTION.md).

## Project Structure

```
├── frontend/
│   └── authenticity-core/     # React frontend application
├── models/
│   ├── cnn_standalone.keras
│   ├── effnet_standalone_authnet.keras
│   └── vgg16_standalone_authnet.keras
├── config.py                  # Configuration settings
├── main.py                    # Backend API server
├── model_server.py            # Optional remote model server
├── requirements.txt           # Python dependencies
├── SETUP_GUIDE.md            # Detailed setup instructions
├── start_all.bat             # Script to start both backend and frontend
├── start_backend.bat         # Script to start the backend
├── start_frontend.bat        # Script to start the frontend
├── start_model_server.bat    # Script to start the model server
├── test_connection.py        # Utility to test model server connection
└── README.md                 # This file
```

## Quick Start

For the easiest setup, use the provided batch files:

1. **One-Click Setup (Backend + Frontend)**:
   ```
   start_all.bat
   ```
   This will start both the backend and frontend in separate windows.

2. **Backend Only**:
   ```
   start_backend.bat
   ```
   When prompted, enter the model server URL or leave empty for local models.

3. **Frontend Only**:
   ```
   start_frontend.bat
   ```

For detailed setup instructions, including distributed deployment options, see [SETUP_GUIDE.md](SETUP_GUIDE.md).

## Running the Backend

Start the server with:
```bash
uvicorn main:app --reload
```

The backend will be available at:
- http://127.0.0.1:8000

## API Endpoints

### Root Endpoint
- **GET /** - Check if the API is running

### Prediction Endpoints
- **POST /predict/cnn** - Make predictions using the CNN model
- **POST /predict/effnet** - Make predictions using the EfficientNet model
- **POST /predict/vgg** - Make predictions using the VGG16 model
- **POST /predict/ensemble** - Run all models and return majority vote
- **POST /predict/batch/{model_name}** - Process multiple images in a single request

### Analytics Endpoints
- **GET /analytics/summary** - Overall system statistics
- **GET /analytics/models/{model_name}** - Per-model performance metrics
- **GET /analytics/predictions** - Recent prediction history
- **GET /analytics/confidence-distribution** - Confidence score histogram
- **GET /analytics/ensemble-agreement** - Model agreement analysis

### Cache Endpoints
- **GET /cache/stats** - Cache statistics
- **POST /cache/clear** - Clear the cache

### Health Endpoints
- **GET /health** - System health check

For complete API documentation and examples, see [ANALYTICS.md](ANALYTICS.md).

## Making Requests

### Single Image Prediction

Send a POST request with an image file in the `file` field using `multipart/form-data` format.

Example response:
```json
{
  "model": "cnn",
  "predicted_class": 2,
  "probabilities": [0.1, 0.7, 0.2]
}
```

### Batch Image Prediction

Process multiple images in a single request for improved efficiency:

```bash
curl -X POST "http://localhost:8000/predict/batch/cnn" \
  -F "files=@image1.jpg" \
  -F "files=@image2.jpg" \
  -F "files=@image3.jpg"
```

You can also use the ensemble model for batch predictions:

```bash
curl -X POST "http://localhost:8000/predict/batch/ensemble?threshold=0.5" \
  -F "files=@image1.jpg" \
  -F "files=@image2.jpg"
```

**Batch Prediction Features:**
- Process up to 10 images per request (configurable)
- Uses intelligent caching for faster repeated predictions
- Returns individual results for each image plus summary statistics
- Automatically records analytics for each prediction
- Rate limited to 5 requests per minute (configurable)

Example batch response:
```json
{
  "batch_summary": {
    "total_images": 3,
    "successful": 3,
    "failed": 0,
    "fake_count": 1,
    "real_count": 2,
    "avg_confidence": 0.72,
    "cached_count": 0,
    "avg_processing_time_ms": 105.3,
    "total_processing_time_ms": 316.0
  },
  "results": [
    {
      "image_index": 0,
      "filename": "image1.jpg",
      "cached": false,
      "model": "cnn",
      "predicted_class": 1,
      "probabilities": [0.15, 0.85],
      "probability": 0.85
    }
  ],
  "model": "cnn",
  "threshold": 0.5
}
```

## Frontend Integration

In your frontend application, send requests to the appropriate endpoint based on the model you want to use:

```
POST http://127.0.0.1:8000/predict/cnn
POST http://127.0.0.1:8000/predict/effnet
POST http://127.0.0.1:8000/predict/vgg
POST http://127.0.0.1:8000/predict/batch/cnn
POST http://127.0.0.1:8000/predict/batch/ensemble
```

Make sure to include the image file in the request body as `multipart/form-data` with the field name `file` for single predictions or `files` (multiple) for batch predictions.

## Analytics & Monitoring

AuthenticityNet includes a comprehensive analytics system to track and analyze predictions:

### Quick Analytics Examples

**Get overall statistics:**
```bash
curl "http://localhost:8000/analytics/summary?hours=24"
```

**Get model-specific metrics:**
```bash
curl "http://localhost:8000/analytics/models/cnn?hours=24"
```

**View recent predictions:**
```bash
curl "http://localhost:8000/analytics/predictions?limit=50"
```

**Analyze confidence distribution:**
```bash
curl "http://localhost:8000/analytics/confidence-distribution?model=cnn"
```

**Check ensemble agreement:**
```bash
curl "http://localhost:8000/analytics/ensemble-agreement?hours=24"
```

### What Gets Tracked

- ✅ Total predictions per model
- ✅ Average confidence scores
- ✅ Processing times and performance
- ✅ Cache hit rates
- ✅ Fake vs. real classifications
- ✅ Ensemble voting patterns
- ✅ Model agreement rates
- 🔒 All sensitive data (images, IPs) automatically hashed

### Configuration

Enable/disable analytics in `backend/config.py`:

```python
ANALYTICS_CONFIG = {
    "enabled": True,              # Master switch
    "db_path": "analytics.db",    # Database location
    "retention_days": 30,         # How long to keep data
    "track_client_ips": True,     # Hash and track IPs
    "auto_cleanup": True,         # Auto-remove old records
}
```

For complete documentation, see [ANALYTICS.md](ANALYTICS.md).