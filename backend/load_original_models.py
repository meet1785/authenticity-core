#!/usr/bin/env python3
"""
Alternative approach: Load models with custom input preprocessing
"""
import tensorflow as tf
import numpy as np
from keras.layers import Input, Lambda
from keras.models import Model
import os

def create_input_preprocessor(original_model_path, model_name, expected_input_channels=1):
    """Create a wrapper model that preprocesses RGB input for the original model"""
    print(f"🔧 Creating input preprocessor for {model_name}")
    print(f"   Original model: {original_model_path}")
    print(f"   Expected input channels: {expected_input_channels}")
    
    try:
        # First, try to understand what the model actually expects
        # by trying to load it with compile=False
        print("   Attempting direct load...")
        
        # Try loading with custom objects or different approaches
        custom_objects = {
            'swish': tf.keras.activations.swish,
            'Swish': tf.keras.activations.swish,
            'relu': tf.keras.activations.relu,
        }
        
        try:
            # Try to load the model architecture only (no weights initially)
            original_model = tf.keras.models.load_model(original_model_path, compile=False, custom_objects=custom_objects)
            print(f"   ✅ Loaded original model")
            print(f"   Input shape: {original_model.input_shape}")
            print(f"   Output shape: {original_model.output_shape}")
            
            # The model loaded successfully, so the issue might be elsewhere
            # Let's test it directly
            test_input = np.random.random((1, 224, 224, 3)).astype(np.float32)
            try:
                prediction = original_model.predict(test_input, verbose=0)
                print(f"   ✅ Model works with RGB input: {prediction.shape} -> {prediction.flatten()}")
                return original_model
            except Exception as e:
                print(f"   ❌ Model fails with RGB input: {e}")
                # Continue to create wrapper
                
        except Exception as load_error:
            print(f"   ❌ Direct load failed: {load_error}")
            
            # If direct loading fails, try to extract weights and recreate
            return create_manual_reconstruction(original_model_path, model_name)
        
        # If we get here, the model loaded but doesn't work with RGB
        # Create a preprocessing wrapper
        rgb_input = Input(shape=(224, 224, 3), name='rgb_input')
        
        if expected_input_channels == 1:
            # Convert RGB to grayscale
            preprocessed = Lambda(
                lambda x: tf.reduce_mean(x, axis=-1, keepdims=True),
                name='rgb_to_grayscale'
            )(rgb_input)
        else:
            # Just pass RGB through
            preprocessed = rgb_input
        
        # Apply the original model
        output = original_model(preprocessed)
        
        # Create the wrapper model
        wrapper_model = Model(inputs=rgb_input, outputs=output, name=f'{model_name}_wrapper')
        
        print(f"   ✅ Created wrapper model")
        return wrapper_model
        
    except Exception as e:
        print(f"   ❌ Failed to create preprocessor: {e}")
        return None

def create_manual_reconstruction(model_path, model_name):
    """Manually reconstruct the model if loading fails"""
    print(f"   🔨 Attempting manual reconstruction for {model_name}")
    
    # For now, return None - this would require reverse engineering the exact architecture
    # which is complex without being able to load the model
    return None

def test_all_approaches():
    """Test different approaches to load the original models"""
    
    models_to_test = [
        ("models/cnn_standalone.keras", "CNN", 3),  # RGB
        ("models/vgg16_standalone_authnet.keras", "VGG16", 1),  # Grayscale?
        ("models/effnet_standalone_authnet.keras", "EfficientNet", 1)  # Grayscale?
    ]
    
    working_models = {}
    
    for model_path, name, channels in models_to_test:
        if os.path.exists(model_path):
            print(f"\n{'='*60}")
            model = create_input_preprocessor(model_path, name, channels)
            if model:
                working_models[name] = model
        else:
            print(f"\n❌ {name} not found at {model_path}")
    
    # Test all working models
    if working_models:
        print(f"\n🎯 Testing all working models:")
        test_image = np.random.random((1, 224, 224, 3)).astype(np.float32)
        
        for name, model in working_models.items():
            try:
                pred = model.predict(test_image, verbose=0)
                print(f"  ✅ {name}: {pred.shape} -> {pred.flatten()[:3]}...")
                
                # Save the working model
                output_path = f"models/{name.lower()}_working.keras"
                model.save(output_path)
                print(f"     💾 Saved to {output_path}")
                
            except Exception as e:
                print(f"  ❌ {name}: Error -> {e}")

if __name__ == "__main__":
    test_all_approaches()
