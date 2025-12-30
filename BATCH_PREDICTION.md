# Batch Prediction API

The Batch Prediction API allows you to process multiple images in a single request, improving efficiency for bulk operations while maintaining all the benefits of individual predictions including caching, analytics, and model selection.

## Overview

### Key Benefits
- **Efficiency**: Process up to 10 images in one API call
- **Performance**: Leverages intelligent caching for faster repeated predictions
- **Convenience**: Single request instead of multiple API calls
- **Analytics**: Each image prediction is tracked individually
- **Flexibility**: Works with all models (CNN, EfficientNet, VGG16, Ensemble)

### Rate Limiting
Batch predictions have a more conservative rate limit (5 requests/minute by default) compared to single predictions, since each batch can process multiple images. This helps prevent server overload while still allowing reasonable throughput.

## Configuration

Configure batch processing in `backend/config.py`:

```python
BATCH_CONFIG = {
    "max_images": 10,              # Maximum images per batch
    "timeout_per_image": 30,       # Timeout for each image (seconds)
    "parallel_processing": False,  # Future feature: parallel processing
}

RATE_LIMIT_CONFIG = {
    "batch_limit": "5/minute",     # Batch prediction rate limit
}
```

## API Endpoint

### POST /predict/batch/{model_name}

Process multiple images using a specific model.

**Path Parameters:**
- `model_name`: Model to use (cnn, effnet, vgg, vgg16, or ensemble)

**Query Parameters:**
- `threshold` (optional): Prediction threshold (0.1-0.9, default: 0.5)

**Request Body:**
- `files`: Multiple image files (multipart/form-data)

**Rate Limit:** 5 requests per minute (configurable)

**Maximum Images:** 10 per request (configurable)

## Usage Examples

### Using cURL

**Single Model Batch:**
```bash
curl -X POST "http://localhost:8000/predict/batch/cnn?threshold=0.5" \
  -F "files=@image1.jpg" \
  -F "files=@image2.jpg" \
  -F "files=@image3.jpg"
```

**Ensemble Model Batch:**
```bash
curl -X POST "http://localhost:8000/predict/batch/ensemble" \
  -F "files=@photo1.png" \
  -F "files=@photo2.png"
```

### Using Python

```python
import requests

# Prepare files
files = [
    ('files', ('image1.jpg', open('image1.jpg', 'rb'), 'image/jpeg')),
    ('files', ('image2.jpg', open('image2.jpg', 'rb'), 'image/jpeg')),
    ('files', ('image3.jpg', open('image3.jpg', 'rb'), 'image/jpeg'))
]

# Send batch request
response = requests.post(
    'http://localhost:8000/predict/batch/cnn',
    files=files,
    params={'threshold': 0.5}
)

if response.status_code == 200:
    result = response.json()
    print(f"Processed {result['batch_summary']['successful']} images")
    print(f"Average confidence: {result['batch_summary']['avg_confidence']:.2%}")
    
    # Process individual results
    for img_result in result['results']:
        if 'error' not in img_result:
            print(f"{img_result['filename']}: "
                  f"class={img_result['predicted_class']}, "
                  f"confidence={img_result['probability']:.2%}")
```

### Using JavaScript

```javascript
const formData = new FormData();
formData.append('files', fileInput1.files[0]);
formData.append('files', fileInput2.files[0]);
formData.append('files', fileInput3.files[0]);

fetch('http://localhost:8000/predict/batch/ensemble?threshold=0.5', {
  method: 'POST',
  body: formData
})
  .then(response => response.json())
  .then(data => {
    console.log('Batch Summary:', data.batch_summary);
    data.results.forEach((result, idx) => {
      if (!result.error) {
        console.log(`Image ${idx}:`, result.filename, 
                    'Class:', result.predicted_class);
      }
    });
  });
```

## Response Format

### Successful Response

```json
{
  "batch_summary": {
    "total_images": 3,
    "successful": 3,
    "failed": 0,
    "fake_count": 1,
    "real_count": 2,
    "avg_confidence": 0.723,
    "cached_count": 1,
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
      "probability": 0.85,
      "threshold": 0.5
    },
    {
      "image_index": 1,
      "filename": "image2.jpg",
      "cached": true,
      "model": "cnn",
      "predicted_class": 0,
      "probabilities": [0.78, 0.22],
      "probability": 0.22,
      "threshold": 0.5
    },
    {
      "image_index": 2,
      "filename": "image3.jpg",
      "cached": false,
      "model": "cnn",
      "predicted_class": 0,
      "probabilities": [0.91, 0.09],
      "probability": 0.09,
      "threshold": 0.5
    }
  ],
  "model": "cnn",
  "threshold": 0.5
}
```

### Response Fields

**batch_summary:**
- `total_images`: Total number of images submitted
- `successful`: Number of successfully processed images
- `failed`: Number of images that failed to process
- `fake_count`: Number of images classified as fake
- `real_count`: Number of images classified as real
- `avg_confidence`: Average confidence score across all images
- `cached_count`: Number of predictions served from cache
- `avg_processing_time_ms`: Average processing time per image
- `total_processing_time_ms`: Total time to process all images

**results:** Array of individual image results
- `image_index`: Index of the image in the batch (0-based)
- `filename`: Original filename
- `cached`: Whether result was served from cache
- `model`: Model used for prediction
- `predicted_class`: Predicted class (0=real, 1=fake)
- `probabilities`: Class probabilities [real_prob, fake_prob]
- `probability`: Confidence in fake class
- `threshold`: Threshold used for classification
- `error`: Error message (only present if processing failed)

### Ensemble Model Response

For ensemble models, each result includes additional fields:

```json
{
  "image_index": 0,
  "filename": "image1.jpg",
  "cached": false,
  "models": [
    {
      "model": "cnn",
      "predicted_class": 1,
      "probabilities": [0.2, 0.8],
      "probability": 0.8
    },
    {
      "model": "effnet",
      "predicted_class": 1,
      "probabilities": [0.15, 0.85],
      "probability": 0.85
    },
    {
      "model": "vgg",
      "predicted_class": 0,
      "probabilities": [0.65, 0.35],
      "probability": 0.35
    }
  ],
  "ensemble": {
    "majority_label": "fake",
    "majority_class": 1,
    "fake_votes": 2,
    "total_models": 3,
    "ensemble_confidence": 0.667,
    "threshold": 0.5
  }
}
```

## Error Handling

### Batch Size Exceeded

```json
{
  "detail": "Batch size exceeds maximum allowed (10 images)"
}
```
Status Code: 400

### Invalid Model Name

```json
{
  "detail": "Invalid model name. Use: cnn, effnet, vgg, vgg16, ensemble"
}
```
Status Code: 400

### Invalid Threshold

```json
{
  "detail": "Threshold must be between 0.1 and 0.9"
}
```
Status Code: 400

### No Images Provided

```json
{
  "detail": "No images provided"
}
```
Status Code: 400

### Rate Limit Exceeded

```json
{
  "detail": "Rate limit exceeded: 5 per 1 minute"
}
```
Status Code: 429

### Individual Image Errors

If an individual image fails to process, it will be included in the results with an error field:

```json
{
  "image_index": 1,
  "filename": "corrupted.jpg",
  "error": "Error processing image: cannot identify image file",
  "success": false
}
```

The batch request will still succeed (200 status) with successful images processed and failed images flagged.

## Performance Considerations

### Caching
- Each image in the batch is checked against the cache independently
- Cached images return near-instantly (~3ms vs ~100ms for uncached)
- Cache considers image content, model, and threshold
- Typical cache hit rates: 50-84% for repeated images

### Processing Time
- Average per-image processing time: 100-150ms (uncached)
- Total batch time includes:
  - Image upload time
  - Individual processing time for each image
  - Cache lookups
  - Analytics recording
- Ensemble predictions take 3x longer than single models (all models run)

### Optimization Tips
1. **Use appropriate model**: CNN is fastest, ensemble most accurate
2. **Leverage caching**: Repeated images benefit from cache
3. **Batch similar images**: Process related images together
4. **Monitor rate limits**: Stay within 5 requests/minute
5. **Consider image size**: Smaller images upload faster

## Analytics Integration

All batch predictions are automatically recorded in the analytics system:
- Each image prediction is tracked individually
- Batch statistics are available in analytics endpoints
- Cache hit rates are recorded
- Processing times are tracked

Query batch analytics:
```bash
# Get recent predictions (includes batch predictions)
curl "http://localhost:8000/analytics/predictions?limit=50"

# Get model statistics
curl "http://localhost:8000/analytics/models/cnn?hours=24"

# Get summary statistics
curl "http://localhost:8000/analytics/summary?hours=24"
```

## Best Practices

1. **Optimal Batch Size**: 5-10 images for best balance of throughput and latency
2. **Error Handling**: Check both HTTP status and individual image results
3. **Threshold Selection**: Use default 0.5 unless you have specific requirements
4. **Model Selection**: 
   - CNN: Fastest, good accuracy
   - VGG/EffNet: Better accuracy, slower
   - Ensemble: Best accuracy, 3x slower
5. **Rate Limiting**: Implement client-side throttling to avoid 429 errors
6. **Caching**: Take advantage of cache for duplicate images
7. **Monitoring**: Use analytics endpoints to track batch performance

## Future Enhancements

Planned improvements for batch processing:
- Parallel processing of images within a batch
- Progress callbacks for long-running batches
- Batch size auto-adjustment based on server load
- Redis-based distributed caching for multi-instance deployments
- Streaming responses for real-time progress updates

## Troubleshooting

**Problem**: Rate limit errors
**Solution**: Reduce request frequency or increase `batch_limit` in config

**Problem**: Timeout errors
**Solution**: Reduce batch size or increase `timeout_per_image` in config

**Problem**: High failure rate
**Solution**: Validate image formats before uploading, check server logs

**Problem**: Slow processing
**Solution**: Reduce batch size, use faster model (CNN), or enable caching

**Problem**: Memory issues
**Solution**: Reduce `max_images` in config or restart server to clear cache

## Support

For issues or questions about batch predictions:
1. Check server logs: `backend/logs/authnet.log`
2. Review analytics: `GET /analytics/summary`
3. Test with single predictions first to isolate batch-specific issues
4. Verify configuration in `backend/config.py`
