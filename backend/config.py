# Configuration for AuthNet backend

# Model settings
MODEL_CONFIG = {
    # Local model paths (used when REMOTE_MODEL_SERVER is empty)
    "local": {
        "cnn": "models/cnn_standalone.keras",                    # Original working model
        "effnet": "models/effnet_standalone_authnet.keras",      # Original trained model
        "vgg": "models/vgg16_standalone_authnet.keras"           # Original trained model
    },
    
    # Fallback models if originals fail to load
    "fallback": {
        "effnet": "models/efficientnet_real_weights.keras",     # Extracted weights version
        "vgg": "models/vgg16_real_weights.keras"                # Extracted weights version
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

# Rate limiting settings
RATE_LIMIT_CONFIG = {
    # Maximum requests per minute per IP address
    "default_limit": "30/minute",
    "predict_limit": "20/minute",  # More restrictive for prediction endpoints
    "ensemble_limit": "10/minute",  # Even more restrictive for ensemble (resource-intensive)
    "batch_limit": "5/minute",  # More restrictive for batch predictions (resource-intensive)
    "enabled": True
}

# Caching settings
CACHE_CONFIG = {
    "enabled": True,
    "max_size": 100,  # Maximum number of cached predictions
    "ttl_seconds": 3600,  # Cache TTL: 1 hour
    "cache_heatmaps": True,  # Whether to cache heatmaps (memory intensive)
}

# Logging settings
LOGGING_CONFIG = {
    "enabled": True,
    "level": "INFO",  # DEBUG, INFO, WARNING, ERROR, CRITICAL
    "log_requests": True,
    "log_predictions": True,
    "log_file": "logs/authnet.log",
    "max_log_size_mb": 10,
    "backup_count": 5
}

# Analytics settings
ANALYTICS_CONFIG = {
    "enabled": True,
    "db_path": "analytics.db",
    "retention_days": 30,
    "track_client_ips": True,
    "auto_cleanup": True,
    "cleanup_interval_hours": 24
}

# Batch prediction settings
BATCH_CONFIG = {
    "max_images": 10,  # Maximum number of images per batch request
    "timeout_per_image": 30,  # Timeout for processing each image in seconds
    "parallel_processing": False,  # Whether to process images in parallel (future feature)
}