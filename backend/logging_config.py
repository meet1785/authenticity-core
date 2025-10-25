"""
Logging configuration for AuthenticityNet
Provides structured logging with JSON formatting and file rotation.
"""
import logging
import sys
import os
from logging.handlers import RotatingFileHandler
from pythonjsonlogger import jsonlogger
from config import LOGGING_CONFIG


def setup_logging():
    """
    Configure logging for the application with both file and console handlers.
    Uses JSON formatting for structured logging.
    """
    if not LOGGING_CONFIG.get("enabled", True):
        logging.basicConfig(level=logging.WARNING)
        return
    
    # Get log level from config
    log_level_str = LOGGING_CONFIG.get("level", "INFO")
    log_level = getattr(logging, log_level_str.upper(), logging.INFO)
    
    # Create logs directory if it doesn't exist
    log_file = LOGGING_CONFIG.get("log_file", "logs/authnet.log")
    log_dir = os.path.dirname(log_file)
    if log_dir and not os.path.exists(log_dir):
        os.makedirs(log_dir, exist_ok=True)
    
    # Create root logger
    logger = logging.getLogger()
    logger.setLevel(log_level)
    
    # Remove existing handlers to avoid duplicates
    logger.handlers.clear()
    
    # JSON Formatter for structured logging
    json_formatter = jsonlogger.JsonFormatter(
        '%(asctime)s %(name)s %(levelname)s %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Console handler (human-readable)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)
    console_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)
    
    # File handler with rotation (JSON format)
    max_bytes = LOGGING_CONFIG.get("max_log_size_mb", 10) * 1024 * 1024
    backup_count = LOGGING_CONFIG.get("backup_count", 5)
    
    try:
        file_handler = RotatingFileHandler(
            log_file,
            maxBytes=max_bytes,
            backupCount=backup_count
        )
        file_handler.setLevel(log_level)
        file_handler.setFormatter(json_formatter)
        logger.addHandler(file_handler)
        logger.info(f"Logging configured successfully. Log file: {log_file}")
    except Exception as e:
        logger.warning(f"Could not set up file logging: {e}. Using console only.")
    
    # Configure specific loggers to reduce noise
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("multipart").setLevel(logging.WARNING)
    
    return logger


class RequestLogger:
    """
    Helper class for logging API requests and responses.
    """
    
    @staticmethod
    def log_request(endpoint: str, method: str, client_ip: str, **kwargs):
        """Log an incoming API request."""
        if not LOGGING_CONFIG.get("log_requests", True):
            return
        
        logger = logging.getLogger("authnet.request")
        logger.info(
            "API Request",
            extra={
                "endpoint": endpoint,
                "method": method,
                "client_ip": client_ip,
                **kwargs
            }
        )
    
    @staticmethod
    def log_prediction(model: str, predicted_class: int, confidence: float, 
                       cached: bool = False, processing_time: float = 0.0, **kwargs):
        """Log a model prediction."""
        if not LOGGING_CONFIG.get("log_predictions", True):
            return
        
        logger = logging.getLogger("authnet.prediction")
        logger.info(
            "Prediction",
            extra={
                "model": model,
                "predicted_class": predicted_class,
                "confidence": confidence,
                "cached": cached,
                "processing_time_ms": round(processing_time * 1000, 2),
                **kwargs
            }
        )
    
    @staticmethod
    def log_error(error_type: str, error_message: str, **kwargs):
        """Log an error."""
        logger = logging.getLogger("authnet.error")
        logger.error(
            error_type,
            extra={
                "error_message": error_message,
                **kwargs
            }
        )


# Initialize logging when module is imported
setup_logging()
