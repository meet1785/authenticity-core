# Rate Limiting and Caching System

## Overview

AuthenticityNet now includes a comprehensive rate limiting and caching system to improve performance, security, and reliability. This document describes the new features and how to configure them.

## Features

### 1. Rate Limiting

Rate limiting protects the backend API from abuse and ensures fair resource allocation among users.

**Default Limits:**
- General endpoints: 30 requests/minute
- Prediction endpoints (`/predict/{model}`): 20 requests/minute  
- Ensemble predictions (`/predict/ensemble`): 10 requests/minute

When a client exceeds the rate limit, they receive a `429 Too Many Requests` response.

**Configuration** (in `config.py`):
```python
RATE_LIMIT_CONFIG = {
    "enabled": True,
    "default_limit": "30/minute",
    "predict_limit": "20/minute",
    "ensemble_limit": "10/minute",
}
```

### 2. Intelligent Caching

The caching system stores prediction results to avoid redundant model inference when the same image is analyzed multiple times.

**Key Features:**
- Content-based caching using SHA-256 hashing of image data
- Separate cache entries for different models and thresholds
- TTL (Time To Live) support with automatic expiration
- Optional heatmap caching (can be disabled to save memory)
- Thread-safe implementation using `cachetools.TTLCache`

**Performance Impact:**
- Cached responses are ~99% faster than fresh predictions
- Significantly reduces GPU/CPU load for repeated queries
- Transparent to API clients

**Configuration** (in `config.py`):
```python
CACHE_CONFIG = {
    "enabled": True,
    "max_size": 100,  # Maximum number of cached predictions
    "ttl_seconds": 3600,  # Cache entries expire after 1 hour
    "cache_heatmaps": True,  # Include heatmaps in cache
}
```

### 3. Structured Logging

The system includes comprehensive logging with JSON formatting for easy parsing and analysis.

**Features:**
- JSON-formatted logs for production use
- Human-readable console output for development
- Automatic log rotation (10MB max size, 5 backup files)
- Request and prediction tracking
- Error logging with context

**Log Locations:**
- File: `backend/logs/authnet.log`
- Console: stdout

**Configuration** (in `config.py`):
```python
LOGGING_CONFIG = {
    "enabled": True,
    "level": "INFO",
    "log_requests": True,
    "log_predictions": True,
    "log_file": "logs/authnet.log",
    "max_log_size_mb": 10,
    "backup_count": 5
}
```

## New API Endpoints

### GET /cache/stats

Returns cache statistics including hit rate and current size.

**Response:**
```json
{
  "enabled": true,
  "hits": 150,
  "misses": 50,
  "hit_rate": "75.00%",
  "current_size": 45,
  "max_size": 100
}
```

### POST /cache/clear

Clears all cached predictions. Rate limited to 10 requests/minute to prevent abuse.

**Response:**
```json
{
  "message": "Cache cleared successfully"
}
```

### GET /health (Enhanced)

The health endpoint now includes cache and rate limiting status.

**Response:**
```json
{
  "status": "ok",
  "loaded_models": ["cnn", "vgg", "effnet"],
  "available_models": ["cnn", "effnet", "vgg", "vgg16"],
  "cache": {
    "enabled": true,
    "hits": 150,
    "misses": 50,
    "hit_rate": "75.00%",
    "current_size": 45,
    "max_size": 100
  },
  "rate_limiting": {
    "enabled": true,
    "limits": {
      "default": "30/minute",
      "predict": "20/minute",
      "ensemble": "10/minute"
    }
  }
}
```

## Testing

A comprehensive test suite is provided in `test_rate_limit_cache.py`:

```bash
cd backend
python test_rate_limit_cache.py
```

**Tests include:**
1. Health endpoint verification
2. Cache functionality (speed improvement verification)
3. Cache statistics
4. Rate limiting trigger verification

## Performance Metrics

Based on testing with a test image:
- **First request** (no cache): ~340ms
- **Cached request**: ~3.7ms (~99% faster)
- **Cache hit rate**: Typically 50-80% in production use

## Disabling Features

To disable rate limiting or caching, set `enabled: False` in the respective configuration:

```python
# Disable rate limiting
RATE_LIMIT_CONFIG = {
    "enabled": False,
    ...
}

# Disable caching
CACHE_CONFIG = {
    "enabled": False,
    ...
}

# Disable logging
LOGGING_CONFIG = {
    "enabled": False,
    ...
}
```

## Dependencies

New dependencies added to `requirements.txt`:
- `slowapi==0.1.9` - Rate limiting middleware for FastAPI
- `cachetools==5.3.2` - Advanced caching utilities
- `python-json-logger==2.0.7` - JSON log formatting

## Security Considerations

1. **Rate Limiting:** Protects against DoS attacks and ensures fair usage
2. **Cache Security:** Image hashes prevent cache poisoning
3. **Logging:** No sensitive data (images) is logged, only metadata
4. **IP-Based Limiting:** Rate limits are per IP address

## Future Enhancements

Potential improvements for future releases:
- Redis-based distributed caching for multi-instance deployments
- User authentication and API key-based rate limiting
- Metrics dashboard for monitoring cache performance
- Configurable rate limit tiers based on user roles
