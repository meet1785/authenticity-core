#!/usr/bin/env python3
"""
Inspect original trained models to understand their exact requirements
"""
import tensorflow as tf
from keras.models import load_model
import numpy as np

def inspect_original_models():
    """Inspect the original trained models"""
    
    print("🔍 Inspecting original VGG model...")
    try:
        vgg_model = load_model("models/vgg16_standalone_authnet.keras")
        print(f"✅ VGG loaded successfully")
        print(f"   Input shape: {vgg_model.input_shape}")
        print(f"   Output shape: {vgg_model.output_shape}")
        print(f"   Model layers count: {len(vgg_model.layers)}")
        print(f"   First layer: {vgg_model.layers[0].name} -> {vgg_model.layers[0]}")
        print(f"   Last layer: {vgg_model.layers[-1].name} -> {vgg_model.layers[-1]}")
        
        # Test with different input sizes
        test_224 = np.random.random((1, 224, 224, 3))
        test_225 = np.random.random((1, 225, 225, 3))
        test_256 = np.random.random((1, 256, 256, 3))
        
        try:
            pred_224 = vgg_model.predict(test_224, verbose=0)
            print(f"   ✅ 224x224x3 works: {pred_224.shape} -> {pred_224.flatten()}")
        except Exception as e:
            print(f"   ❌ 224x224x3 failed: {e}")
            
        try:
            pred_225 = vgg_model.predict(test_225, verbose=0)
            print(f"   ✅ 225x225x3 works: {pred_225.shape} -> {pred_225.flatten()}")
        except Exception as e:
            print(f"   ❌ 225x225x3 failed: {e}")
            
        try:
            pred_256 = vgg_model.predict(test_256, verbose=0)
            print(f"   ✅ 256x256x3 works: {pred_256.shape} -> {pred_256.flatten()}")
        except Exception as e:
            print(f"   ❌ 256x256x3 failed: {e}")
            
    except Exception as e:
        print(f"❌ Failed to load VGG: {e}")
    
    print("\n🔍 Inspecting original EffNet model...")
    try:
        effnet_model = load_model("models/effnet_standalone_authnet.keras")
        print(f"✅ EffNet loaded successfully")
        print(f"   Input shape: {effnet_model.input_shape}")
        print(f"   Output shape: {effnet_model.output_shape}")
        print(f"   Model layers count: {len(effnet_model.layers)}")
        print(f"   First layer: {effnet_model.layers[0].name} -> {effnet_model.layers[0]}")
        print(f"   Last layer: {effnet_model.layers[-1].name} -> {effnet_model.layers[-1]}")
        
        # Test with different input sizes
        try:
            pred_224 = effnet_model.predict(test_224, verbose=0)
            print(f"   ✅ 224x224x3 works: {pred_224.shape} -> {pred_224.flatten()}")
        except Exception as e:
            print(f"   ❌ 224x224x3 failed: {e}")
            
        try:
            pred_225 = effnet_model.predict(test_225, verbose=0)
            print(f"   ✅ 225x225x3 works: {pred_225.shape} -> {pred_225.flatten()}")
        except Exception as e:
            print(f"   ❌ 225x225x3 failed: {e}")
            
        try:
            pred_256 = effnet_model.predict(test_256, verbose=0)
            print(f"   ✅ 256x256x3 works: {pred_256.shape} -> {pred_256.flatten()}")
        except Exception as e:
            print(f"   ❌ 256x256x3 failed: {e}")
            
    except Exception as e:
        print(f"❌ Failed to load EffNet: {e}")

if __name__ == "__main__":
    inspect_original_models()
