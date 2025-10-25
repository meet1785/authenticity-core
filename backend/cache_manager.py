"""
Cache Manager for AuthenticityNet
Provides intelligent caching for model predictions to improve performance and reduce redundant computations.
"""
import hashlib
import time
from typing import Optional, Dict, Any
from cachetools import TTLCache
from config import CACHE_CONFIG
import logging

logger = logging.getLogger(__name__)


class PredictionCache:
    """
    Manages caching of model predictions with TTL (Time To Live) support.
    Uses file content hashing to identify identical images.
    """
    
    def __init__(self, max_size: int = 100, ttl_seconds: int = 3600):
        """
        Initialize the prediction cache.
        
        Args:
            max_size: Maximum number of items to cache
            ttl_seconds: Time to live for cache entries in seconds
        """
        self.enabled = CACHE_CONFIG.get("enabled", True)
        self.cache_heatmaps = CACHE_CONFIG.get("cache_heatmaps", True)
        
        if self.enabled:
            self._cache = TTLCache(maxsize=max_size, ttl=ttl_seconds)
            self._stats = {
                "hits": 0,
                "misses": 0,
                "size": 0
            }
            logger.info(f"Cache initialized: max_size={max_size}, ttl={ttl_seconds}s")
        else:
            logger.info("Cache is disabled")
    
    def _generate_key(self, image_bytes: bytes, model_name: str, threshold: float = 0.5) -> str:
        """
        Generate a unique cache key based on image content, model, and threshold.
        
        Args:
            image_bytes: Raw image file bytes
            model_name: Name of the model being used
            threshold: Prediction threshold
            
        Returns:
            Unique cache key string
        """
        # Create hash of image content
        image_hash = hashlib.sha256(image_bytes).hexdigest()[:16]
        # Combine with model name and threshold
        cache_key = f"{model_name}:{image_hash}:{threshold:.2f}"
        return cache_key
    
    def get(self, image_bytes: bytes, model_name: str, threshold: float = 0.5) -> Optional[Dict[str, Any]]:
        """
        Retrieve a cached prediction if available.
        
        Args:
            image_bytes: Raw image file bytes
            model_name: Name of the model
            threshold: Prediction threshold
            
        Returns:
            Cached prediction result or None if not found
        """
        if not self.enabled:
            return None
        
        cache_key = self._generate_key(image_bytes, model_name, threshold)
        
        try:
            if cache_key in self._cache:
                self._stats["hits"] += 1
                result = self._cache[cache_key]
                logger.debug(f"Cache HIT for key: {cache_key}")
                return result
            else:
                self._stats["misses"] += 1
                logger.debug(f"Cache MISS for key: {cache_key}")
                return None
        except Exception as e:
            logger.error(f"Error retrieving from cache: {e}")
            return None
    
    def set(self, image_bytes: bytes, model_name: str, prediction_result: Dict[str, Any], 
            threshold: float = 0.5) -> None:
        """
        Store a prediction result in the cache.
        
        Args:
            image_bytes: Raw image file bytes
            model_name: Name of the model
            prediction_result: The prediction result to cache
            threshold: Prediction threshold used
        """
        if not self.enabled:
            return
        
        cache_key = self._generate_key(image_bytes, model_name, threshold)
        
        try:
            # Optionally exclude heatmap to save memory
            result_to_cache = prediction_result.copy()
            if not self.cache_heatmaps and "heatmap" in result_to_cache:
                result_to_cache["heatmap"] = None
                logger.debug(f"Heatmap excluded from cache for key: {cache_key}")
            
            self._cache[cache_key] = result_to_cache
            self._stats["size"] = len(self._cache)
            logger.debug(f"Cached prediction for key: {cache_key}")
        except Exception as e:
            logger.error(f"Error storing in cache: {e}")
    
    def clear(self) -> None:
        """Clear all cached entries."""
        if self.enabled:
            self._cache.clear()
            self._stats["size"] = 0
            logger.info("Cache cleared")
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics.
        
        Returns:
            Dictionary with cache statistics
        """
        if not self.enabled:
            return {"enabled": False}
        
        hit_rate = (
            self._stats["hits"] / (self._stats["hits"] + self._stats["misses"])
            if (self._stats["hits"] + self._stats["misses"]) > 0
            else 0.0
        )
        
        return {
            "enabled": True,
            "hits": self._stats["hits"],
            "misses": self._stats["misses"],
            "hit_rate": f"{hit_rate:.2%}",
            "current_size": self._stats["size"],
            "max_size": self._cache.maxsize if hasattr(self._cache, 'maxsize') else 0
        }


# Global cache instance
_global_cache: Optional[PredictionCache] = None


def get_cache() -> PredictionCache:
    """Get or create the global cache instance."""
    global _global_cache
    if _global_cache is None:
        _global_cache = PredictionCache(
            max_size=CACHE_CONFIG.get("max_size", 100),
            ttl_seconds=CACHE_CONFIG.get("ttl_seconds", 3600)
        )
    return _global_cache
