#!/usr/bin/env python3
"""
Fix the original trained models by correcting their saved configurations
"""
import tensorflow as tf
import h5py
import json
import numpy as np
import os

def fix_model_config(model_path, output_path):
    """Fix the model configuration to accept proper RGB input"""
    print(f"🔧 Fixing model config: {model_path} -> {output_path}")
    
    try:
        # Try to load the model file as HDF5 to examine structure
        with h5py.File(model_path, 'r') as f:
            print("📂 Model file structure:")
            
            def print_structure(name, obj):
                print(f"  {name}: {type(obj)}")
                if isinstance(obj, h5py.Group):
                    for key in obj.keys():
                        print(f"    - {key}")
            
            f.visititems(print_structure)
            
            # Try to get model config
            if 'model_config' in f.attrs:
                config = json.loads(f.attrs['model_config'].decode('utf-8'))
                print(f"✅ Found model config")
                
                # Look for input layer configuration
                if 'config' in config and 'layers' in config['config']:
                    for i, layer in enumerate(config['config']['layers']):
                        if layer.get('class_name') == 'InputLayer':
                            print(f"🎯 Found input layer at index {i}")
                            print(f"   Current config: {layer['config']}")
                            
                            # Fix the batch input shape
                            if 'batch_input_shape' in layer['config']:
                                old_shape = layer['config']['batch_input_shape']
                                if len(old_shape) == 4 and old_shape[-1] == 1:  # [None, H, W, 1]
                                    # Change from grayscale to RGB
                                    layer['config']['batch_input_shape'] = [old_shape[0], old_shape[1], old_shape[2], 3]
                                    print(f"   Fixed shape: {old_shape} -> {layer['config']['batch_input_shape']}")
                                elif len(old_shape) == 4 and old_shape[1] == 225:  # Wrong size
                                    # Fix size to 224
                                    layer['config']['batch_input_shape'] = [None, 224, 224, 3]
                                    print(f"   Fixed shape: {old_shape} -> {layer['config']['batch_input_shape']}")
                
                # Save the fixed config back
                print("💾 Saving fixed model...")
                
                # Create a copy of the file with fixed config
                with h5py.File(output_path, 'w') as out_f:
                    # Copy all groups and datasets
                    for key in f.keys():
                        f.copy(key, out_f)
                    
                    # Copy all attributes except model_config
                    for key, value in f.attrs.items():
                        if key != 'model_config':
                            out_f.attrs[key] = value
                    
                    # Save the fixed config
                    out_f.attrs['model_config'] = json.dumps(config).encode('utf-8')
                
                print(f"✅ Fixed model saved to {output_path}")
                return True
            else:
                print("❌ No model_config found in file")
                return False
                
    except Exception as e:
        print(f"❌ Error fixing model: {e}")
        return False

def test_fixed_model(model_path, model_name):
    """Test if the fixed model works"""
    print(f"\n🧪 Testing fixed {model_name}")
    
    try:
        model = tf.keras.models.load_model(model_path, compile=False)
        print(f"✅ Loaded successfully")
        print(f"   Input shape: {model.input_shape}")
        print(f"   Output shape: {model.output_shape}")
        
        # Test with RGB input
        test_input = np.random.random((1, 224, 224, 3)).astype(np.float32)
        prediction = model.predict(test_input, verbose=0)
        print(f"   Test prediction shape: {prediction.shape}")
        print(f"   Test prediction values: {prediction.flatten()}")
        
        return model
        
    except Exception as e:
        print(f"❌ Testing failed: {e}")
        return None

def main():
    print("🚀 Fixing original trained models")
    
    models_to_fix = [
        ("models/vgg16_standalone_authnet.keras", "models/vgg16_fixed_real.keras", "VGG16"),
        ("models/effnet_standalone_authnet.keras", "models/effnet_fixed_real.keras", "EfficientNet")
    ]
    
    fixed_models = {}
    
    for input_path, output_path, name in models_to_fix:
        if os.path.exists(input_path):
            success = fix_model_config(input_path, output_path)
            if success:
                model = test_fixed_model(output_path, name)
                if model:
                    fixed_models[name] = model
        else:
            print(f"❌ {name} not found at {input_path}")
    
    # Test all fixed models with same input
    if fixed_models:
        print(f"\n🎯 Testing all fixed models with same image:")
        test_image = np.random.random((1, 224, 224, 3)).astype(np.float32)
        
        for name, model in fixed_models.items():
            pred = model.predict(test_image, verbose=0)
            print(f"  {name}: {pred.shape} -> {pred.flatten()}")

if __name__ == "__main__":
    main()
