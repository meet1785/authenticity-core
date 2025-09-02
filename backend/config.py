# Configuration for AuthNet backend

# Model settings
MODEL_CONFIG = {
    # Local model paths (used when REMOTE_MODEL_SERVER is empty)
    "local": {
        "cnn": "models/cnn_standalone.keras",
        "effnet": "models/efficientnet_real_weights.keras",  # Using extracted real weights
        "vgg": "models/vgg16_real_weights.keras"              # Using extracted real weights
    },
    
    # Remote model server settings
    "remote": {
        # Set this to your friend's IP address or hostname when using remote models
        # Example: "http://192.168.1.100:8001" or "https://model-server.example.com"
        "server_url": "",
        
        # API endpoints for each model
        "endpoints": {
            "cnn": "/predict/cnn",
            "effnet": "/predict/effnet",
            "vgg": "/predict/vgg"
        },
        
        # Authentication (if required)
        "api_key": "",
        
        # Connection timeout in seconds
        "timeout": 30
    }
}

# Server settings
SERVER_CONFIG = {
    # CORS settings
    "cors": {
        "allow_origins": ["*"],  # For production, replace with specific origins
        "allow_credentials": True,
        "allow_methods": ["*"],
        "allow_headers": ["*"]
    },
    
    # Server host and port
    "host": "0.0.0.0",  # Binds to all interfaces
    "port": 8000
}

# Preprocessing settings
PREPROCESSING_CONFIG = {
    "image_size": (224, 224),
    "normalize": True,
    "normalization_factor": 255.0
}