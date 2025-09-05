#!/usr/bin/env python3
"""
Test script to verify models produce different predictions
"""
import requests
import os
from PIL import Image, ImageDraw
import io
import time

def create_test_image():
    """Create a simple test image"""
    img = Image.new('RGB', (224, 224), color='white')
    draw = ImageDraw.Draw(img)
    # Draw some patterns to make the image more interesting
    draw.rectangle([50, 50, 174, 174], fill='red')
    draw.ellipse([75, 75, 149, 149], fill='blue')
    
    buffer = io.BytesIO()
    img.save(buffer, format='JPEG')
    return buffer.getvalue()

def test_model_differences():
    """Test that all models give different predictions"""
    print("Testing Model Differences")
    print("========================")
    
    # Check if backend is running
    try:
        response = requests.get('http://localhost:8000/health', timeout=5)
        if response.status_code != 200:
            print("❌ Backend health check failed")
            return False
    except:
        print("❌ Backend is not reachable at http://localhost:8000")
        return False
    
    print("✅ Backend is running")
    
    # Create test image
    test_image = create_test_image()
    print(f"Created test image ({len(test_image)} bytes)")
    
    # Test each model
    models = ['cnn', 'effnet', 'vgg']
    predictions = {}
    
    for model in models:
        print(f"\nTesting {model} model...")
        try:
            files = {'file': ('test.jpg', test_image, 'image/jpeg')}
            response = requests.post(
                f'http://localhost:8000/predict/{model}',
                files=files,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                predictions[model] = data['probabilities']
                print(f"✅ {model} prediction: {data['probabilities']}")
                print(f"   Predicted class: {data['predicted_class']}")
                print(f"   Heatmap: {'Yes' if data.get('heatmap') else 'No'}")
            else:
                print(f"❌ {model} failed with status {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ {model} failed with error: {e}")
            return False
    
    # Check if predictions are different
    print("\n" + "="*50)
    print("COMPARISON:")
    
    cnn_pred = predictions.get('cnn', [])
    effnet_pred = predictions.get('effnet', [])
    vgg_pred = predictions.get('vgg', [])
    
    print(f"CNN:        {cnn_pred}")
    print(f"EfficientNet: {effnet_pred}")
    print(f"VGG16:      {vgg_pred}")
    
    # Check if all predictions are different
    all_different = True
    
    if cnn_pred and effnet_pred:
        cnn_effnet_diff = abs(cnn_pred[0] - effnet_pred[0]) > 0.01
        print(f"CNN vs EfficientNet different: {cnn_effnet_diff}")
        all_different &= cnn_effnet_diff
    
    if cnn_pred and vgg_pred:
        cnn_vgg_diff = abs(cnn_pred[0] - vgg_pred[0]) > 0.01
        print(f"CNN vs VGG16 different: {cnn_vgg_diff}")
        all_different &= cnn_vgg_diff
        
    if effnet_pred and vgg_pred:
        effnet_vgg_diff = abs(effnet_pred[0] - vgg_pred[0]) > 0.01
        print(f"EfficientNet vs VGG16 different: {effnet_vgg_diff}")
        all_different &= effnet_vgg_diff
    
    print(f"\n✅ All models produce different predictions: {all_different}")
    
    return all_different

def test_ensemble_endpoint():
    """Test the ensemble endpoint"""
    print("\nTesting Ensemble Endpoint")
    print("========================")
    
    test_image = create_test_image()
    
    try:
        files = {'file': ('test.jpg', test_image, 'image/jpeg')}
        response = requests.post(
            'http://localhost:8000/predict/ensemble',
            files=files,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Ensemble prediction successful!")
            print(f"   Ensemble result: {data.get('ensemble', {}).get('majority_label', 'N/A')}")
            print(f"   Confidence: {data.get('ensemble', {}).get('ensemble_confidence', 'N/A')}")
            print(f"   Models involved: {len(data.get('models', []))}")
            
            for model in data.get('models', []):
                print(f"   - {model.get('model', 'Unknown')}: {model.get('probabilities', [])}")
            
            return True
        else:
            print(f"❌ Ensemble failed with status {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Ensemble failed with error: {e}")
        return False

if __name__ == "__main__":
    success1 = test_model_differences()
    success2 = test_ensemble_endpoint()
    
    print("\n" + "="*50)
    print("FINAL RESULTS:")
    print(f"Individual models working: {success1}")
    print(f"Ensemble endpoint working: {success2}")
    
    if success1 and success2:
        print("🎉 All tests passed! The system is working correctly.")
    else:
        print("⚠️ Some tests failed. Check the output above.")