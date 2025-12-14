"""
Analytics Manager for AuthenticityNet
Tracks and analyzes model predictions and system performance.
"""
import sqlite3
import hashlib
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List, Tuple
from contextlib import contextmanager
import json

logger = logging.getLogger(__name__)


class AnalyticsManager:
    """
    Manages analytics collection and storage for model predictions.
    Stores predictions in SQLite database with privacy features.
    """
    
    def __init__(self, db_path: str = "analytics.db", retention_days: int = 30):
        """
        Initialize the analytics manager.
        
        Args:
            db_path: Path to SQLite database file
            retention_days: Number of days to retain records
        """
        self.db_path = db_path
        self.retention_days = retention_days
        self._init_database()
        logger.info(f"Analytics manager initialized: db={db_path}, retention={retention_days} days")
    
    @contextmanager
    def _get_connection(self):
        """Context manager for database connections."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
            conn.commit()
        except Exception as e:
            conn.rollback()
            logger.error(f"Database error: {e}")
            raise
        finally:
            conn.close()
    
    def _init_database(self):
        """Initialize the database schema."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS predictions (
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
                )
            """)
            
            # Create indexes for common queries
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_timestamp 
                ON predictions(timestamp)
            """)
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_model_name 
                ON predictions(model_name)
            """)
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_model_timestamp 
                ON predictions(model_name, timestamp)
            """)
            
            conn.commit()
            logger.info("Database schema initialized successfully")
    
    def record_prediction(
        self,
        model: str,
        predicted_class: int,
        confidence: float,
        threshold: float = 0.5,
        processing_time: float = 0.0,
        cached: bool = False,
        image_hash: Optional[str] = None,
        client_ip_hash: Optional[str] = None,
        ensemble_votes: Optional[Dict[str, int]] = None,
        total_models: Optional[int] = None
    ):
        """
        Record a prediction in the database.
        
        Args:
            model: Name of the model used
            predicted_class: Predicted class (0=real, 1=fake)
            confidence: Confidence score
            threshold: Threshold used for classification
            processing_time: Processing time in milliseconds
            cached: Whether result was served from cache
            image_hash: Hash of the input image (for privacy)
            client_ip_hash: Hash of client IP (for privacy)
            ensemble_votes: Voting details for ensemble predictions
            total_models: Total number of models in ensemble
        """
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                
                # Serialize ensemble votes to JSON if provided
                ensemble_votes_json = json.dumps(ensemble_votes) if ensemble_votes else None
                
                cursor.execute("""
                    INSERT INTO predictions (
                        model_name, predicted_class, confidence, threshold,
                        processing_time_ms, cached, image_hash, client_ip_hash,
                        ensemble_votes, total_models
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    model, predicted_class, confidence, threshold,
                    processing_time, cached, image_hash, client_ip_hash,
                    ensemble_votes_json, total_models
                ))
                
                logger.debug(f"Recorded prediction: model={model}, class={predicted_class}, confidence={confidence:.3f}")
        except Exception as e:
            logger.error(f"Failed to record prediction: {e}")
    
    def get_summary_stats(self, hours: int = 24) -> Dict[str, Any]:
        """
        Get summary statistics for recent predictions.
        
        Args:
            hours: Number of hours to look back
            
        Returns:
            Dictionary containing summary statistics
        """
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cutoff_time = datetime.now() - timedelta(hours=hours)
                
                # Total predictions
                cursor.execute("""
                    SELECT COUNT(*) as total,
                           AVG(confidence) as avg_confidence,
                           AVG(processing_time_ms) as avg_processing_time,
                           SUM(CASE WHEN cached = 1 THEN 1 ELSE 0 END) as cached_count,
                           SUM(CASE WHEN predicted_class = 1 THEN 1 ELSE 0 END) as fake_count,
                           SUM(CASE WHEN predicted_class = 0 THEN 1 ELSE 0 END) as real_count
                    FROM predictions
                    WHERE timestamp >= ?
                """, (cutoff_time,))
                
                row = cursor.fetchone()
                if not row:
                    return {
                        "total_predictions": 0,
                        "avg_confidence": 0.0,
                        "avg_processing_time_ms": 0.0,
                        "cache_hit_rate": 0.0,
                        "fake_predictions": 0,
                        "real_predictions": 0,
                        "hours": hours
                    }
                
                total = row[0] if row[0] else 0
                avg_confidence = row[1] if row[1] else 0.0
                avg_processing_time = row[2] if row[2] else 0.0
                cached_count = row[3] if row[3] else 0
                fake_count = row[4] if row[4] else 0
                real_count = row[5] if row[5] else 0
                
                if total == 0:
                    return {
                        "total_predictions": 0,
                        "avg_confidence": 0.0,
                        "avg_processing_time_ms": 0.0,
                        "cache_hit_rate": 0.0,
                        "fake_predictions": 0,
                        "real_predictions": 0,
                        "hours": hours
                    }
                
                cache_hit_rate = (cached_count / total) * 100 if total > 0 else 0
                
                # Per-model breakdown
                cursor.execute("""
                    SELECT model_name, COUNT(*) as count
                    FROM predictions
                    WHERE timestamp >= ?
                    GROUP BY model_name
                    ORDER BY count DESC
                """, (cutoff_time,))
                
                models = {}
                for row in cursor.fetchall():
                    models[row[0]] = row[1]
                
                return {
                    "total_predictions": total,
                    "avg_confidence": round(avg_confidence, 3),
                    "avg_processing_time_ms": round(avg_processing_time, 2),
                    "cache_hit_rate": round(cache_hit_rate, 2),
                    "fake_predictions": fake_count,
                    "real_predictions": real_count,
                    "models": models,
                    "hours": hours
                }
        except Exception as e:
            logger.error(f"Failed to get summary stats: {e}")
            return {"error": str(e)}
    
    def get_model_stats(self, model_name: str, hours: int = 24) -> Dict[str, Any]:
        """
        Get statistics for a specific model.
        
        Args:
            model_name: Name of the model
            hours: Number of hours to look back
            
        Returns:
            Dictionary containing model-specific statistics
        """
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cutoff_time = datetime.now() - timedelta(hours=hours)
                
                cursor.execute("""
                    SELECT COUNT(*) as total,
                           AVG(confidence) as avg_confidence,
                           MIN(confidence) as min_confidence,
                           MAX(confidence) as max_confidence,
                           AVG(processing_time_ms) as avg_processing_time,
                           SUM(CASE WHEN cached = 1 THEN 1 ELSE 0 END) as cached_count,
                           SUM(CASE WHEN predicted_class = 1 THEN 1 ELSE 0 END) as fake_count,
                           SUM(CASE WHEN predicted_class = 0 THEN 1 ELSE 0 END) as real_count
                    FROM predictions
                    WHERE model_name = ? AND timestamp >= ?
                """, (model_name, cutoff_time))
                
                row = cursor.fetchone()
                total = row['total'] or 0
                
                if total == 0:
                    return {
                        "model": model_name,
                        "total_predictions": 0,
                        "hours": hours
                    }
                
                cache_hit_rate = (row['cached_count'] / total) * 100 if total > 0 else 0
                
                return {
                    "model": model_name,
                    "total_predictions": total,
                    "avg_confidence": round(row['avg_confidence'], 3) if row['avg_confidence'] else 0.0,
                    "min_confidence": round(row['min_confidence'], 3) if row['min_confidence'] else 0.0,
                    "max_confidence": round(row['max_confidence'], 3) if row['max_confidence'] else 0.0,
                    "avg_processing_time_ms": round(row['avg_processing_time'], 2) if row['avg_processing_time'] else 0.0,
                    "cache_hit_rate": round(cache_hit_rate, 2),
                    "fake_predictions": row['fake_count'] or 0,
                    "real_predictions": row['real_count'] or 0,
                    "hours": hours
                }
        except Exception as e:
            logger.error(f"Failed to get model stats: {e}")
            return {"error": str(e)}
    
    def get_recent_predictions(
        self, 
        limit: int = 100, 
        model: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get recent prediction history.
        
        Args:
            limit: Maximum number of records to return
            model: Filter by model name (optional)
            
        Returns:
            List of recent predictions
        """
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                
                if model:
                    cursor.execute("""
                        SELECT id, timestamp, model_name, predicted_class, 
                               confidence, threshold, processing_time_ms, cached,
                               total_models
                        FROM predictions
                        WHERE model_name = ?
                        ORDER BY timestamp DESC
                        LIMIT ?
                    """, (model, limit))
                else:
                    cursor.execute("""
                        SELECT id, timestamp, model_name, predicted_class,
                               confidence, threshold, processing_time_ms, cached,
                               total_models
                        FROM predictions
                        ORDER BY timestamp DESC
                        LIMIT ?
                    """, (limit,))
                
                predictions = []
                for row in cursor.fetchall():
                    predictions.append({
                        "id": row['id'],
                        "timestamp": row['timestamp'],
                        "model": row['model_name'],
                        "predicted_class": row['predicted_class'],
                        "confidence": round(row['confidence'], 3) if row['confidence'] else 0.0,
                        "threshold": row['threshold'],
                        "processing_time_ms": round(row['processing_time_ms'], 2) if row['processing_time_ms'] else 0.0,
                        "cached": bool(row['cached']),
                        "total_models": row['total_models']
                    })
                
                return predictions
        except Exception as e:
            logger.error(f"Failed to get recent predictions: {e}")
            return []
    
    def get_confidence_distribution(
        self, 
        model_name: Optional[str] = None, 
        bins: int = 10
    ) -> Dict[str, Any]:
        """
        Calculate confidence score distribution.
        
        Args:
            model_name: Filter by model name (optional)
            bins: Number of bins for histogram
            
        Returns:
            Dictionary containing distribution data
        """
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                
                if model_name:
                    cursor.execute("""
                        SELECT confidence
                        FROM predictions
                        WHERE model_name = ?
                    """, (model_name,))
                else:
                    cursor.execute("SELECT confidence FROM predictions")
                
                confidences = [row['confidence'] for row in cursor.fetchall()]
                
                if not confidences:
                    return {
                        "model": model_name,
                        "bins": [],
                        "counts": [],
                        "total": 0
                    }
                
                # Create histogram bins
                bin_edges = [i / bins for i in range(bins + 1)]
                bin_counts = [0] * bins
                
                for conf in confidences:
                    # Find which bin this confidence belongs to
                    bin_idx = min(int(conf * bins), bins - 1)
                    bin_counts[bin_idx] += 1
                
                # Format bin labels
                bin_labels = [f"{bin_edges[i]:.2f}-{bin_edges[i+1]:.2f}" for i in range(bins)]
                
                return {
                    "model": model_name or "all",
                    "bins": bin_labels,
                    "counts": bin_counts,
                    "total": len(confidences)
                }
        except Exception as e:
            logger.error(f"Failed to get confidence distribution: {e}")
            return {"error": str(e)}
    
    def get_ensemble_agreement(self, hours: int = 24) -> Dict[str, Any]:
        """
        Analyze ensemble voting patterns and model agreement.
        
        Args:
            hours: Number of hours to look back
            
        Returns:
            Dictionary containing agreement statistics
        """
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cutoff_time = datetime.now() - timedelta(hours=hours)
                
                cursor.execute("""
                    SELECT ensemble_votes, total_models, predicted_class
                    FROM predictions
                    WHERE model_name = 'ensemble' 
                      AND timestamp >= ?
                      AND ensemble_votes IS NOT NULL
                """, (cutoff_time,))
                
                rows = cursor.fetchall()
                
                if not rows:
                    return {
                        "total_ensemble_predictions": 0,
                        "hours": hours
                    }
                
                total = len(rows)
                unanimous_count = 0
                majority_count = 0
                split_count = 0
                
                for row in rows:
                    try:
                        votes = json.loads(row['ensemble_votes']) if row['ensemble_votes'] else {}
                        total_models = row['total_models'] or 3
                        fake_votes = votes.get('fake_votes', 0)
                        
                        if fake_votes == 0 or fake_votes == total_models:
                            unanimous_count += 1
                        elif fake_votes > total_models / 2 or fake_votes < total_models / 2:
                            majority_count += 1
                        else:
                            split_count += 1
                    except (json.JSONDecodeError, KeyError):
                        continue
                
                return {
                    "total_ensemble_predictions": total,
                    "unanimous_agreement": unanimous_count,
                    "unanimous_rate": round((unanimous_count / total) * 100, 2) if total > 0 else 0.0,
                    "majority_agreement": majority_count,
                    "majority_rate": round((majority_count / total) * 100, 2) if total > 0 else 0.0,
                    "split_decisions": split_count,
                    "split_rate": round((split_count / total) * 100, 2) if total > 0 else 0.0,
                    "hours": hours
                }
        except Exception as e:
            logger.error(f"Failed to get ensemble agreement: {e}")
            return {"error": str(e)}
    
    def cleanup_old_records(self) -> int:
        """
        Remove records older than retention period.
        
        Returns:
            Number of records deleted
        """
        try:
            deleted_count = 0
            cutoff_date = datetime.now() - timedelta(days=self.retention_days)
            
            # Delete records in a separate transaction
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("""
                DELETE FROM predictions
                WHERE timestamp < ?
            """, (cutoff_date,))
            deleted_count = cursor.rowcount
            conn.commit()
            conn.close()
            
            if deleted_count > 0:
                logger.info(f"Cleaned up {deleted_count} old records (older than {self.retention_days} days)")
            
            # Optimize database in a separate connection without transaction
            conn = sqlite3.connect(self.db_path)
            conn.isolation_level = None  # Disable transactions for VACUUM
            cursor = conn.cursor()
            cursor.execute("VACUUM")
            conn.close()
            
            return deleted_count
        except Exception as e:
            logger.error(f"Failed to cleanup old records: {e}")
            return 0
    
    def close(self):
        """Close the analytics manager and cleanup resources."""
        logger.info("Analytics manager closed")


def hash_data(data: str) -> str:
    """
    Hash data for privacy (SHA-256).
    
    Args:
        data: Data to hash
        
    Returns:
        Hexadecimal hash string
    """
    return hashlib.sha256(data.encode()).hexdigest()
