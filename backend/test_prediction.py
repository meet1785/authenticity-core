#!/usr/bin/env python3
"""Test script to verify models are loading and predicting correctly with heatmaps"""

import requests
import os
from PIL import Image, ImageDraw
import io
import base64

def create_test_image():
    """Create a simple test image"""
    img = Image.new('RGB', (224, 224), color='white')
    draw = ImageDraw.Draw(img)
    
    # Draw some patterns
    draw.rectangle([50, 50, 174, 174], fill='red', outline='black', width=3)
    draw.ellipse([75, 75, 149, 149], fill='blue')
    draw.text((90, 105), "TEST", fill='white')
    
    # Save to bytes
    img_buffer = io.BytesIO()
    img.save(img_buffer, format='JPEG')
    img_buffer.seek(0)
    return img_buffer.getvalue()

def test_endpoint(model_name, image_data):
    """Test a specific model endpoint"""
    print(f"\nTesting {model_name} model...")
    
    try:
        files = {'file': ('test.jpg', image_data, 'image/jpeg')}
        response = requests.post(
            f'http://localhost:8000/predict/{model_name}',
            files=files,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ {model_name} prediction successful!")
            print(f"   Predicted class: {data['predicted_class']}")
            print(f"   Probabilities: {data['probabilities']}")
            print(f"   Heatmap generated: {'Yes' if data.get('heatmap') else 'No'}")
            if data.get('heatmap'):
                print(f"   Heatmap size: {len(data['heatmap'])} characters")
            return True
        else:
            print(f"❌ {model_name} failed with status {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except requests.RequestException as e:
        print(f"❌ {model_name} connection error: {e}")
        return False

def main():
    print("AuthNet Model Testing")
    print("====================")
    
    # Test backend health
    try:
        response = requests.get('http://localhost:8000/health', timeout=5)
        if response.status_code == 200:
            print("✅ Backend is running")
        else:
            print("❌ Backend health check failed")
            return
    except:
        print("❌ Backend is not reachable at http://localhost:8000")
        return
    
    # Create test image
    test_image = create_test_image()
    print(f"Created test image ({len(test_image)} bytes)")
    
    # Test each model
    models = ['cnn', 'effnet', 'vgg']
    results = {}
    
    for model in models:
        results[model] = test_endpoint(model, test_image)
    
    print("\n" + "="*50)
    print("SUMMARY:")
    for model, success in results.items():
        status = "✅ WORKING" if success else "❌ FAILED"
        print(f"{model.upper()}: {status}")
    
    if all(results.values()):
        print("\n🎉 All models are working correctly!")
    else:
        print("\n⚠️  Some models have issues. Check the errors above.")

if __name__ == "__main__":
    main()
