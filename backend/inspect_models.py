import tensorflow as tf
import numpy as np
import os

def inspect_model(model_path, model_name):
    """Inspect a Keras model file to understand its architecture"""
    print(f"\n🔍 Inspecting {model_name} model...")
    print(f"Path: {model_path}")
    
    try:
        # Load the model
        model = tf.keras.models.load_model(model_path, compile=False)
        
        print(f"✅ Model loaded successfully")
        print(f"Model type: {type(model)}")
        
        # Print model summary
        print(f"\n📊 Model Summary:")
        model.summary()
        
        # Print input shape
        print(f"\n📥 Input Shape: {model.input_shape}")
        print(f"Expected input: {model.input_shape}")
        
        # Print output shape
        print(f"📤 Output Shape: {model.output_shape}")
        
        # List all layers with their input/output shapes
        print(f"\n🏗️ Layer Details:")
        for i, layer in enumerate(model.layers):
            print(f"  {i}: {layer.name} ({layer.__class__.__name__})")
            try:
                print(f"      Input: {layer.input_shape}")
                print(f"      Output: {layer.output_shape}")
            except:
                print(f"      Shape info not available")
        
        # Find convolutional layers
        conv_layers = []
        for layer in model.layers:
            if 'conv' in layer.__class__.__name__.lower():
                conv_layers.append(layer.name)
        
        print(f"\n🔥 Convolutional Layers: {conv_layers}")
        
        # Test with different input shapes
        print(f"\n🧪 Testing different input shapes:")
        
        # Test RGB input (3 channels)
        try:
            test_rgb = np.random.random((1, 224, 224, 3)).astype(np.float32)
            pred_rgb = model.predict(test_rgb, verbose=0)
            print(f"  ✅ RGB input (224,224,3): Works - Output shape: {np.array(pred_rgb).shape}")
        except Exception as e:
            print(f"  ❌ RGB input (224,224,3): Failed - {e}")
        
        # Test grayscale input (1 channel)
        try:
            test_gray = np.random.random((1, 224, 224, 1)).astype(np.float32)
            pred_gray = model.predict(test_gray, verbose=0)
            print(f"  ✅ Grayscale input (224,224,1): Works - Output shape: {np.array(pred_gray).shape}")
        except Exception as e:
            print(f"  ❌ Grayscale input (224,224,1): Failed - {e}")
            
        # Test different sizes
        try:
            test_225 = np.random.random((1, 225, 225, 3)).astype(np.float32)
            pred_225 = model.predict(test_225, verbose=0)
            print(f"  ✅ RGB input (225,225,3): Works - Output shape: {np.array(pred_225).shape}")
        except Exception as e:
            print(f"  ❌ RGB input (225,225,3): Failed - {e}")
        
        return model
        
    except Exception as e:
        print(f"❌ Failed to load model: {e}")
        return None

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Inspect all models
    models_to_inspect = [
        ("cnn_standalone.keras", "CNN"),
        ("vgg16_standalone_authnet.keras", "VGG16"),
        ("effnet_standalone_authnet.keras", "EfficientNet")
    ]
    
    for model_file, model_name in models_to_inspect:
        model_path = os.path.join(base_dir, "models", model_file)
        if os.path.exists(model_path):
            inspect_model(model_path, model_name)
        else:
            print(f"❌ Model not found: {model_path}")
        print("="*80)
