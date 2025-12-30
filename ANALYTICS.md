# Analytics & Monitoring

AuthenticityNet includes a comprehensive analytics system to track, monitor, and analyze model predictions and system performance over time.

## Overview

The analytics system provides:
- 📊 **Real-time statistics** on prediction patterns and model performance
- 🔍 **Per-model metrics** for each detection model (CNN, EfficientNet, VGG16)
- 📈 **Confidence distributions** to understand prediction certainty
- 🤝 **Ensemble agreement analysis** to track model consensus
- 🗄️ **SQLite database** for efficient data storage
- 🔒 **Privacy-first design** with automatic data hashing
- 🧹 **Automatic cleanup** of old records

## Configuration

Analytics settings are configured in `backend/config.py`:

```python
ANALYTICS_CONFIG = {
    "enabled": True,                    # Enable/disable analytics
    "db_path": "analytics.db",          # Database file path
    "retention_days": 30,               # Days to retain records
    "track_client_ips": True,           # Hash and track client IPs
    "auto_cleanup": True,               # Automatic cleanup of old records
    "cleanup_interval_hours": 24        # Cleanup frequency
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | bool | `True` | Master switch for analytics system |
| `db_path` | str | `"analytics.db"` | Path to SQLite database file |
| `retention_days` | int | `30` | Number of days to retain records |
| `track_client_ips` | bool | `True` | Whether to hash and track client IPs |
| `auto_cleanup` | bool | `True` | Enable automatic cleanup of old records |
| `cleanup_interval_hours` | int | `24` | Hours between automatic cleanups |

## API Endpoints

All analytics endpoints are protected by rate limiting and require analytics to be enabled.

### 1. Summary Statistics

Get overall system statistics for recent predictions.

**Endpoint:** `GET /analytics/summary`

**Query Parameters:**
- `hours` (optional): Number of hours to look back (default: 24, max: 720)

**Example Request:**
```bash
curl "http://localhost:8000/analytics/summary?hours=24"
```

**Example Response:**
```json
{
  "total_predictions": 1523,
  "avg_confidence": 0.847,
  "avg_processing_time_ms": 125.43,
  "cache_hit_rate": 67.2,
  "fake_predictions": 892,
  "real_predictions": 631,
  "models": {
    "ensemble": 423,
    "cnn": 402,
    "vgg": 357,
    "effnet": 341
  },
  "hours": 24
}
```

**Response Fields:**
- `total_predictions`: Total number of predictions made
- `avg_confidence`: Average confidence score (0-1)
- `avg_processing_time_ms`: Average processing time in milliseconds
- `cache_hit_rate`: Percentage of predictions served from cache
- `fake_predictions`: Count of predictions classified as fake
- `real_predictions`: Count of predictions classified as real
- `models`: Per-model prediction counts
- `hours`: Time period of the statistics

### 2. Model-Specific Statistics

Get detailed statistics for a specific model.

**Endpoint:** `GET /analytics/models/{model_name}`

**Path Parameters:**
- `model_name`: Model name (`cnn`, `effnet`, `vgg`, or `ensemble`)

**Query Parameters:**
- `hours` (optional): Number of hours to look back (default: 24, max: 720)

**Example Request:**
```bash
curl "http://localhost:8000/analytics/models/cnn?hours=24"
```

**Example Response:**
```json
{
  "model": "cnn",
  "total_predictions": 402,
  "avg_confidence": 0.831,
  "min_confidence": 0.102,
  "max_confidence": 0.998,
  "avg_processing_time_ms": 118.76,
  "cache_hit_rate": 65.4,
  "fake_predictions": 245,
  "real_predictions": 157,
  "hours": 24
}
```

**Response Fields:**
- `model`: Model name
- `total_predictions`: Total predictions for this model
- `avg_confidence`: Average confidence score
- `min_confidence`: Minimum confidence score observed
- `max_confidence`: Maximum confidence score observed
- `avg_processing_time_ms`: Average processing time
- `cache_hit_rate`: Cache hit rate for this model
- `fake_predictions`: Count of fake predictions
- `real_predictions`: Count of real predictions

### 3. Recent Predictions

Retrieve recent prediction history.

**Endpoint:** `GET /analytics/predictions`

**Query Parameters:**
- `limit` (optional): Maximum records to return (default: 100, max: 1000)
- `model` (optional): Filter by model name

**Example Request:**
```bash
curl "http://localhost:8000/analytics/predictions?limit=50&model=cnn"
```

**Example Response:**
```json
{
  "predictions": [
    {
      "id": 1523,
      "timestamp": "2025-12-14 13:45:32",
      "model": "cnn",
      "predicted_class": 1,
      "confidence": 0.847,
      "threshold": 0.5,
      "processing_time_ms": 123.45,
      "cached": false,
      "total_models": null
    },
    {
      "id": 1522,
      "timestamp": "2025-12-14 13:44:18",
      "model": "cnn",
      "predicted_class": 0,
      "confidence": 0.234,
      "threshold": 0.5,
      "processing_time_ms": 98.21,
      "cached": true,
      "total_models": null
    }
  ],
  "count": 50
}
```

**Response Fields:**
- `predictions`: Array of prediction records
  - `id`: Unique prediction ID
  - `timestamp`: When the prediction was made
  - `model`: Model used
  - `predicted_class`: Predicted class (0=real, 1=fake)
  - `confidence`: Confidence score
  - `threshold`: Threshold used for classification
  - `processing_time_ms`: Processing time
  - `cached`: Whether result was from cache
  - `total_models`: Number of models (ensemble only)
- `count`: Number of predictions returned

### 4. Confidence Distribution

Get confidence score distribution (histogram).

**Endpoint:** `GET /analytics/confidence-distribution`

**Query Parameters:**
- `model` (optional): Filter by model name
- `bins` (optional): Number of histogram bins (default: 10, max: 20)

**Example Request:**
```bash
curl "http://localhost:8000/analytics/confidence-distribution?model=cnn&bins=10"
```

**Example Response:**
```json
{
  "model": "cnn",
  "bins": [
    "0.00-0.10", "0.10-0.20", "0.20-0.30", "0.30-0.40",
    "0.40-0.50", "0.50-0.60", "0.60-0.70", "0.70-0.80",
    "0.80-0.90", "0.90-1.00"
  ],
  "counts": [23, 45, 67, 89, 102, 98, 112, 134, 156, 176],
  "total": 1002
}
```

**Response Fields:**
- `model`: Model name (or "all" if no filter)
- `bins`: Bin labels showing confidence ranges
- `counts`: Count of predictions in each bin
- `total`: Total number of predictions

### 5. Ensemble Agreement

Analyze ensemble voting patterns and model agreement.

**Endpoint:** `GET /analytics/ensemble-agreement`

**Query Parameters:**
- `hours` (optional): Number of hours to look back (default: 24, max: 720)

**Example Request:**
```bash
curl "http://localhost:8000/analytics/ensemble-agreement?hours=24"
```

**Example Response:**
```json
{
  "total_ensemble_predictions": 423,
  "unanimous_agreement": 301,
  "unanimous_rate": 71.16,
  "majority_agreement": 122,
  "majority_rate": 28.84,
  "split_decisions": 0,
  "split_rate": 0.0,
  "hours": 24
}
```

**Response Fields:**
- `total_ensemble_predictions`: Total ensemble predictions
- `unanimous_agreement`: Count of unanimous votes (all models agree)
- `unanimous_rate`: Percentage of unanimous votes
- `majority_agreement`: Count of majority votes (2+ models agree)
- `majority_rate`: Percentage of majority votes
- `split_decisions`: Count of split decisions (tie votes)
- `split_rate`: Percentage of split decisions

## Database Schema

The analytics system uses SQLite with the following schema:

```sql
CREATE TABLE predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    model_name TEXT NOT NULL,
    predicted_class INTEGER NOT NULL,
    confidence REAL NOT NULL,
    threshold REAL DEFAULT 0.5,
    processing_time_ms REAL,
    cached BOOLEAN DEFAULT 0,
    image_hash TEXT,
    client_ip_hash TEXT,
    ensemble_votes TEXT,
    total_models INTEGER
);

-- Indexes for performance
CREATE INDEX idx_timestamp ON predictions(timestamp);
CREATE INDEX idx_model_name ON predictions(model_name);
CREATE INDEX idx_model_timestamp ON predictions(model_name, timestamp);
```

## Privacy & Security

The analytics system is designed with privacy in mind:

### Data Hashing

Sensitive data is automatically hashed using SHA-256:
- **Image hashes**: Full SHA-256 hash of uploaded images (for duplicate detection)
- **Client IP hashes**: SHA-256 hash of client IP addresses (when tracking is enabled)

**Example:**
```python
import hashlib

# Image content is hashed
image_hash = hashlib.sha256(image_bytes).hexdigest()
# Result: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"

# Client IPs are hashed
client_ip_hash = hashlib.sha256("192.168.1.100".encode()).hexdigest()
# Result: "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e"
```

### Disabling IP Tracking

To disable IP address tracking:

```python
ANALYTICS_CONFIG = {
    "enabled": True,
    "track_client_ips": False,  # Don't track client IPs
    # ... other settings
}
```

### Data Retention

Records are automatically deleted after the retention period:

```python
ANALYTICS_CONFIG = {
    "retention_days": 30,        # Keep records for 30 days
    "auto_cleanup": True,        # Enable automatic cleanup
    "cleanup_interval_hours": 24 # Run cleanup daily
}
```

### SQL Injection Protection

All queries use parameterized statements to prevent SQL injection:

```python
# Safe - parameterized query
cursor.execute("SELECT * FROM predictions WHERE model_name = ?", (model_name,))

# Never used - unsafe string interpolation
# cursor.execute(f"SELECT * FROM predictions WHERE model_name = '{model_name}'")
```

## Usage Examples

### Basic Monitoring

Check overall system health:

```bash
# Get 24-hour summary
curl "http://localhost:8000/analytics/summary"

# Get weekly summary
curl "http://localhost:8000/analytics/summary?hours=168"
```

### Model Performance Comparison

Compare models:

```bash
# CNN performance
curl "http://localhost:8000/analytics/models/cnn?hours=24"

# VGG performance
curl "http://localhost:8000/analytics/models/vgg?hours=24"

# EfficientNet performance
curl "http://localhost:8000/analytics/models/effnet?hours=24"
```

### Debugging Issues

Investigate recent predictions:

```bash
# Last 100 predictions
curl "http://localhost:8000/analytics/predictions?limit=100"

# Last 50 CNN predictions
curl "http://localhost:8000/analytics/predictions?limit=50&model=cnn"
```

### Quality Analysis

Analyze prediction confidence:

```bash
# Overall confidence distribution
curl "http://localhost:8000/analytics/confidence-distribution"

# CNN confidence distribution with 20 bins
curl "http://localhost:8000/analytics/confidence-distribution?model=cnn&bins=20"
```

### Ensemble Analysis

Check model agreement:

```bash
# 24-hour ensemble agreement
curl "http://localhost:8000/analytics/ensemble-agreement"

# 7-day ensemble agreement
curl "http://localhost:8000/analytics/ensemble-agreement?hours=168"
```

## Performance Impact

The analytics system is designed for minimal performance impact:

### Recording Overhead

- **Average overhead**: < 2ms per prediction
- **Database operations**: Asynchronous when possible
- **No blocking**: Prediction endpoints never wait for analytics

### Measurements

```python
# Without analytics
Prediction time: 125.43ms

# With analytics enabled
Prediction time: 126.89ms
Analytics overhead: 1.46ms (1.16%)
```

### Optimization Tips

1. **Increase cleanup interval** for high-traffic systems:
   ```python
   ANALYTICS_CONFIG = {
       "cleanup_interval_hours": 168,  # Weekly instead of daily
   }
   ```

2. **Reduce retention period** to keep database small:
   ```python
   ANALYTICS_CONFIG = {
       "retention_days": 7,  # Keep only 1 week
   }
   ```

3. **Disable IP tracking** to reduce data:
   ```python
   ANALYTICS_CONFIG = {
       "track_client_ips": False,
   }
   ```

## Troubleshooting

### Analytics Not Working

Check if analytics is enabled:

```bash
curl "http://localhost:8000/analytics/summary"
```

If you get `{"detail": "Analytics not enabled"}`, check:
1. `ANALYTICS_CONFIG["enabled"]` is `True` in `config.py`
2. Backend has restarted after config changes
3. No errors in backend logs

### Database Locked

If you see "database is locked" errors:
1. Ensure only one backend instance is running
2. Check that cleanup interval isn't too frequent
3. Consider increasing `retention_days` to reduce cleanup frequency

### Large Database File

If `analytics.db` grows too large:
1. Reduce `retention_days` in config
2. Run manual cleanup:
   ```python
   from analytics_manager import AnalyticsManager
   analytics = AnalyticsManager("analytics.db", retention_days=7)
   deleted = analytics.cleanup_old_records()
   print(f"Deleted {deleted} records")
   ```

### Missing Statistics

If statistics appear incomplete:
1. Check time range (default is 24 hours)
2. Verify predictions are being recorded (check database)
3. Ensure system time is correct

## Integration with Monitoring Tools

### Export to CSV

Export analytics data for external analysis:

```python
import sqlite3
import csv

conn = sqlite3.connect('analytics.db')
cursor = conn.cursor()
cursor.execute("SELECT * FROM predictions ORDER BY timestamp DESC LIMIT 1000")

with open('predictions.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow([desc[0] for desc in cursor.description])
    writer.writerows(cursor.fetchall())

conn.close()
```

### Prometheus Integration

Create custom Prometheus metrics:

```python
from prometheus_client import Counter, Histogram, Gauge

prediction_counter = Counter('predictions_total', 'Total predictions', ['model', 'class'])
confidence_histogram = Histogram('prediction_confidence', 'Prediction confidence', ['model'])
processing_time = Histogram('processing_time_seconds', 'Processing time', ['model'])

# Update metrics from analytics
stats = analytics.get_summary_stats(hours=1)
for model, count in stats['models'].items():
    # Update gauges/counters
    pass
```

### Grafana Dashboard

Connect Grafana to SQLite:
1. Install SQLite plugin for Grafana
2. Add SQLite data source pointing to `analytics.db`
3. Create dashboards with queries:

```sql
-- Predictions over time
SELECT 
    datetime(timestamp) as time,
    COUNT(*) as predictions
FROM predictions
WHERE timestamp >= datetime('now', '-24 hours')
GROUP BY datetime(timestamp, 'minute')

-- Confidence distribution
SELECT 
    model_name,
    AVG(confidence) as avg_confidence
FROM predictions
WHERE timestamp >= datetime('now', '-24 hours')
GROUP BY model_name
```

## Best Practices

1. **Regular monitoring**: Check summary stats daily
2. **Performance tracking**: Monitor `avg_processing_time_ms`
3. **Quality checks**: Review confidence distributions weekly
4. **Ensemble analysis**: Verify model agreement rates
5. **Cleanup verification**: Confirm old records are being removed
6. **Backup database**: Periodically backup `analytics.db`
7. **Privacy review**: Regularly audit what data is being stored

## Future Enhancements

Potential future additions:
- Real-time dashboards
- Alerting on anomalies
- A/B testing support
- Model drift detection
- Advanced analytics (ROC curves, confusion matrices)
- Integration with MLflow or similar platforms

## Support

For issues or questions about analytics:
1. Check backend logs for error messages
2. Verify configuration in `config.py`
3. Run test suite: `python backend/test_analytics.py`
4. Review database: `sqlite3 analytics.db` then `.schema`
