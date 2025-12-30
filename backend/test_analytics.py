#!/usr/bin/env python3
"""
Test suite for analytics functionality
"""
import os
import sys
import time
import sqlite3
import tempfile
from analytics_manager import AnalyticsManager, hash_data

def test_database_initialization():
    """Test that database is created with proper schema"""
    print("\n" + "="*60)
    print("TEST 1: Database Initialization")
    print("="*60)
    
    try:
        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp:
            db_path = tmp.name
        
        # Initialize analytics manager
        analytics = AnalyticsManager(db_path=db_path, retention_days=30)
        
        # Verify database exists
        if not os.path.exists(db_path):
            print("❌ Database file not created")
            return False
        
        # Verify table exists
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='predictions'")
        result = cursor.fetchone()
        conn.close()
        
        if not result:
            print("❌ Predictions table not created")
            return False
        
        print("✅ Database and schema initialized correctly")
        
        # Cleanup
        analytics.close()
        os.unlink(db_path)
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_record_prediction():
    """Test recording predictions"""
    print("\n" + "="*60)
    print("TEST 2: Recording Predictions")
    print("="*60)
    
    try:
        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp:
            db_path = tmp.name
        
        analytics = AnalyticsManager(db_path=db_path, retention_days=30)
        
        # Record a test prediction
        analytics.record_prediction(
            model="cnn",
            predicted_class=1,
            confidence=0.85,
            threshold=0.5,
            processing_time=150.5,
            cached=False,
            image_hash="abc123",
            client_ip_hash="def456"
        )
        
        # Verify it was recorded
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM predictions")
        count = cursor.fetchone()[0]
        conn.close()
        
        if count != 1:
            print(f"❌ Expected 1 record, found {count}")
            return False
        
        print("✅ Prediction recorded successfully")
        
        # Cleanup
        analytics.close()
        os.unlink(db_path)
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_summary_stats():
    """Test summary statistics"""
    print("\n" + "="*60)
    print("TEST 3: Summary Statistics")
    print("="*60)
    
    try:
        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp:
            db_path = tmp.name
        
        analytics = AnalyticsManager(db_path=db_path, retention_days=30)
        
        # Record multiple predictions
        for i in range(10):
            analytics.record_prediction(
                model="cnn" if i % 2 == 0 else "vgg",
                predicted_class=1 if i < 6 else 0,
                confidence=0.7 + (i * 0.02),
                threshold=0.5,
                processing_time=100 + i * 10,
                cached=(i % 3 == 0),
                image_hash=f"hash{i}",
                client_ip_hash=f"ip{i}"
            )
        
        # Get summary stats
        stats = analytics.get_summary_stats(hours=24)
        
        # Verify stats
        if stats["total_predictions"] != 10:
            print(f"❌ Expected 10 predictions, got {stats['total_predictions']}")
            return False
        
        if stats["fake_predictions"] != 6:
            print(f"❌ Expected 6 fake predictions, got {stats['fake_predictions']}")
            return False
        
        if stats["real_predictions"] != 4:
            print(f"❌ Expected 4 real predictions, got {stats['real_predictions']}")
            return False
        
        print(f"✅ Summary stats correct:")
        print(f"   Total: {stats['total_predictions']}")
        print(f"   Fake: {stats['fake_predictions']}")
        print(f"   Real: {stats['real_predictions']}")
        print(f"   Avg confidence: {stats['avg_confidence']}")
        print(f"   Cache hit rate: {stats['cache_hit_rate']}%")
        
        # Cleanup
        analytics.close()
        os.unlink(db_path)
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_model_stats():
    """Test per-model statistics"""
    print("\n" + "="*60)
    print("TEST 4: Per-Model Statistics")
    print("="*60)
    
    try:
        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp:
            db_path = tmp.name
        
        analytics = AnalyticsManager(db_path=db_path, retention_days=30)
        
        # Record predictions for specific model
        for i in range(5):
            analytics.record_prediction(
                model="cnn",
                predicted_class=1,
                confidence=0.8 + (i * 0.02),
                threshold=0.5,
                processing_time=120,
                cached=False
            )
        
        # Get model stats
        stats = analytics.get_model_stats(model_name="cnn", hours=24)
        
        if stats["total_predictions"] != 5:
            print(f"❌ Expected 5 predictions, got {stats['total_predictions']}")
            return False
        
        if stats["model"] != "cnn":
            print(f"❌ Expected model 'cnn', got {stats['model']}")
            return False
        
        print(f"✅ Model stats correct:")
        print(f"   Model: {stats['model']}")
        print(f"   Total: {stats['total_predictions']}")
        print(f"   Avg confidence: {stats['avg_confidence']}")
        print(f"   Min confidence: {stats['min_confidence']}")
        print(f"   Max confidence: {stats['max_confidence']}")
        
        # Cleanup
        analytics.close()
        os.unlink(db_path)
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_recent_predictions():
    """Test recent predictions query"""
    print("\n" + "="*60)
    print("TEST 5: Recent Predictions")
    print("="*60)
    
    try:
        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp:
            db_path = tmp.name
        
        analytics = AnalyticsManager(db_path=db_path, retention_days=30)
        
        # Record predictions
        for i in range(15):
            analytics.record_prediction(
                model="cnn" if i < 10 else "vgg",
                predicted_class=i % 2,
                confidence=0.75,
                threshold=0.5,
                processing_time=100
            )
            time.sleep(0.01)  # Small delay to ensure different timestamps
        
        # Get recent predictions (all)
        predictions = analytics.get_recent_predictions(limit=10)
        
        if len(predictions) != 10:
            print(f"❌ Expected 10 predictions, got {len(predictions)}")
            return False
        
        # Get recent predictions (filtered by model)
        cnn_predictions = analytics.get_recent_predictions(limit=20, model="cnn")
        
        if len(cnn_predictions) != 10:
            print(f"❌ Expected 10 CNN predictions, got {len(cnn_predictions)}")
            return False
        
        print(f"✅ Recent predictions query working:")
        print(f"   Total recent (limit 10): {len(predictions)}")
        print(f"   CNN predictions: {len(cnn_predictions)}")
        
        # Cleanup
        analytics.close()
        os.unlink(db_path)
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_confidence_distribution():
    """Test confidence distribution calculation"""
    print("\n" + "="*60)
    print("TEST 6: Confidence Distribution")
    print("="*60)
    
    try:
        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp:
            db_path = tmp.name
        
        analytics = AnalyticsManager(db_path=db_path, retention_days=30)
        
        # Record predictions with varying confidence
        confidences = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95]
        for conf in confidences:
            analytics.record_prediction(
                model="cnn",
                predicted_class=1 if conf > 0.5 else 0,
                confidence=conf,
                threshold=0.5,
                processing_time=100
            )
        
        # Get distribution
        dist = analytics.get_confidence_distribution(model_name="cnn", bins=10)
        
        if dist["total"] != len(confidences):
            print(f"❌ Expected {len(confidences)} total, got {dist['total']}")
            return False
        
        if len(dist["bins"]) != 10:
            print(f"❌ Expected 10 bins, got {len(dist['bins'])}")
            return False
        
        print(f"✅ Confidence distribution working:")
        print(f"   Total samples: {dist['total']}")
        print(f"   Bins: {len(dist['bins'])}")
        print(f"   Distribution: {dist['counts']}")
        
        # Cleanup
        analytics.close()
        os.unlink(db_path)
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_ensemble_agreement():
    """Test ensemble agreement analysis"""
    print("\n" + "="*60)
    print("TEST 7: Ensemble Agreement")
    print("="*60)
    
    try:
        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp:
            db_path = tmp.name
        
        analytics = AnalyticsManager(db_path=db_path, retention_days=30)
        
        # Record ensemble predictions with different voting patterns
        # Unanimous (3-0)
        for i in range(5):
            analytics.record_prediction(
                model="ensemble",
                predicted_class=1,
                confidence=0.9,
                threshold=0.5,
                processing_time=200,
                ensemble_votes={"fake_votes": 3, "total_models": 3},
                total_models=3
            )
        
        # Unanimous (0-3)
        for i in range(3):
            analytics.record_prediction(
                model="ensemble",
                predicted_class=0,
                confidence=0.1,
                threshold=0.5,
                processing_time=200,
                ensemble_votes={"fake_votes": 0, "total_models": 3},
                total_models=3
            )
        
        # Majority (2-1)
        for i in range(2):
            analytics.record_prediction(
                model="ensemble",
                predicted_class=1,
                confidence=0.7,
                threshold=0.5,
                processing_time=200,
                ensemble_votes={"fake_votes": 2, "total_models": 3},
                total_models=3
            )
        
        # Get agreement stats
        agreement = analytics.get_ensemble_agreement(hours=24)
        
        if agreement["total_ensemble_predictions"] != 10:
            print(f"❌ Expected 10 ensemble predictions, got {agreement['total_ensemble_predictions']}")
            return False
        
        if agreement["unanimous_agreement"] != 8:
            print(f"❌ Expected 8 unanimous, got {agreement['unanimous_agreement']}")
            return False
        
        print(f"✅ Ensemble agreement working:")
        print(f"   Total: {agreement['total_ensemble_predictions']}")
        print(f"   Unanimous: {agreement['unanimous_agreement']} ({agreement['unanimous_rate']}%)")
        print(f"   Majority: {agreement['majority_agreement']} ({agreement['majority_rate']}%)")
        
        # Cleanup
        analytics.close()
        os.unlink(db_path)
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_cleanup():
    """Test old record cleanup"""
    print("\n" + "="*60)
    print("TEST 8: Record Cleanup")
    print("="*60)
    
    try:
        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp:
            db_path = tmp.name
        
        # Use very short retention for testing
        analytics = AnalyticsManager(db_path=db_path, retention_days=0)
        
        # Record some predictions
        for i in range(5):
            analytics.record_prediction(
                model="cnn",
                predicted_class=1,
                confidence=0.8,
                threshold=0.5,
                processing_time=100
            )
        
        # Wait a moment
        time.sleep(0.1)
        
        # Run cleanup (should delete all since retention is 0 days)
        deleted = analytics.cleanup_old_records()
        
        if deleted != 5:
            print(f"❌ Expected 5 records deleted, got {deleted}")
            return False
        
        # Verify records are gone
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM predictions")
        count = cursor.fetchone()[0]
        conn.close()
        
        if count != 0:
            print(f"❌ Expected 0 records remaining, found {count}")
            return False
        
        print(f"✅ Cleanup working:")
        print(f"   Deleted: {deleted} records")
        print(f"   Remaining: {count} records")
        
        # Cleanup
        analytics.close()
        os.unlink(db_path)
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_privacy_hashing():
    """Test privacy hashing functionality"""
    print("\n" + "="*60)
    print("TEST 9: Privacy Hashing")
    print("="*60)
    
    try:
        # Test hash_data function
        test_data = "sensitive_data_123"
        hash1 = hash_data(test_data)
        hash2 = hash_data(test_data)
        
        # Same input should produce same hash
        if hash1 != hash2:
            print("❌ Hash inconsistency - same input produces different hashes")
            return False
        
        # Hash should be hexadecimal
        try:
            int(hash1, 16)
        except ValueError:
            print("❌ Hash is not hexadecimal")
            return False
        
        # Different input should produce different hash
        hash3 = hash_data("different_data")
        if hash1 == hash3:
            print("❌ Different inputs produce same hash")
            return False
        
        print(f"✅ Privacy hashing working:")
        print(f"   Hash length: {len(hash1)}")
        print(f"   Sample hash: {hash1[:16]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_empty_database_queries():
    """Test queries on empty database"""
    print("\n" + "="*60)
    print("TEST 10: Empty Database Queries")
    print("="*60)
    
    try:
        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp:
            db_path = tmp.name
        
        analytics = AnalyticsManager(db_path=db_path, retention_days=30)
        
        # Test all query methods on empty database
        summary = analytics.get_summary_stats(hours=24)
        if summary["total_predictions"] != 0:
            print(f"❌ Expected 0 predictions in summary")
            return False
        
        model_stats = analytics.get_model_stats(model_name="cnn", hours=24)
        if model_stats["total_predictions"] != 0:
            print(f"❌ Expected 0 predictions in model stats")
            return False
        
        predictions = analytics.get_recent_predictions(limit=10)
        if len(predictions) != 0:
            print(f"❌ Expected 0 recent predictions")
            return False
        
        distribution = analytics.get_confidence_distribution(bins=10)
        if distribution["total"] != 0:
            print(f"❌ Expected 0 in distribution")
            return False
        
        agreement = analytics.get_ensemble_agreement(hours=24)
        if agreement["total_ensemble_predictions"] != 0:
            print(f"❌ Expected 0 ensemble predictions")
            return False
        
        print("✅ Empty database queries handled correctly")
        
        # Cleanup
        analytics.close()
        os.unlink(db_path)
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all tests"""
    print("Analytics Test Suite")
    print("="*60)
    
    results = []
    results.append(("Database Initialization", test_database_initialization()))
    results.append(("Record Prediction", test_record_prediction()))
    results.append(("Summary Statistics", test_summary_stats()))
    results.append(("Model Statistics", test_model_stats()))
    results.append(("Recent Predictions", test_recent_predictions()))
    results.append(("Confidence Distribution", test_confidence_distribution()))
    results.append(("Ensemble Agreement", test_ensemble_agreement()))
    results.append(("Record Cleanup", test_cleanup()))
    results.append(("Privacy Hashing", test_privacy_hashing()))
    results.append(("Empty Database Queries", test_empty_database_queries()))
    
    # Print summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = 0
    failed = 0
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print(f"\nTotal: {len(results)} tests")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    
    if failed == 0:
        print("\n🎉 All tests passed!")
        sys.exit(0)
    else:
        print(f"\n⚠️  {failed} test(s) failed.")
        sys.exit(1)

if __name__ == "__main__":
    main()
