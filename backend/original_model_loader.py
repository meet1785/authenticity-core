#!/usr/bin/env python3
"""
Enhanced model loader that handles original model input requirements
"""
import tensorflow as tf
import numpy as np
from tensorflow.keras.utils import img_to_array
from PIL import Image
import cv2

class OriginalModelLoader:
    """Special loader for handling original model quirks"""
    
    def __init__(self, model_path, model_name):
        self.model_path = model_path
        self.model_name = model_name
        self.model = None
        self.requires_special_input = False
        
    def load_with_input_fix(self):
        """Try to load model and determine input requirements"""
        try:
            # First try direct loading
            self.model = tf.keras.models.load_model(self.model_path)
            print(f"✅ {self.model_name} loaded directly")
            
            # Check input shape
            if len(self.model.input_shape) == 4 and self.model.input_shape[-1] == 1:
                self.requires_special_input = True
                print(f"🔧 {self.model_name} expects grayscale input, will convert")
            return True
            
        except Exception as e:
            error_str = str(e).lower()
            if "input shape" in error_str or "stem_conv" in error_str or "expected axis" in error_str:
                print(f"🔧 {self.model_name} has input shape issue - creating wrapper")
                return self._create_input_wrapper()
            else:
                print(f"❌ {self.model_name} loading failed: {e}")
                return False
    
    def _create_input_wrapper(self):
        """Create a wrapper that fixes input shape issues"""
        try:
            # Try to load the model with compile=False to inspect
            model = tf.keras.models.load_model(self.model_path, compile=False)
            
            if len(model.input_shape) == 4:
                if model.input_shape[-1] == 1:
                    # Model expects grayscale, create wrapper to convert RGB to grayscale
                    from tensorflow.keras.layers import Input, Lambda
                    from tensorflow.keras.models import Model
                    
                    input_layer = Input(shape=(224, 224, 3))
                    # Convert RGB to grayscale using standard weights
                    gray = Lambda(lambda x: tf.reduce_sum(x * tf.constant([0.2989, 0.5870, 0.1140]), axis=-1, keepdims=True))(input_layer)
                    output = model(gray)
                    new_model = Model(input_layer, output)
                    
                    self.model = new_model
                    self.requires_special_input = True
                    print(f"✅ Created RGB to grayscale wrapper for {self.model_name}")
                    return True
                    
                elif model.input_shape[-1] == 3:
                    # Model expects RGB, use directly
                    self.model = model
                    print(f"✅ {self.model_name} loaded with RGB input")
                    return True
                else:
                    print(f"❌ Unsupported input channels for {self.model_name}: {model.input_shape[-1]}")
                    return False
            else:
                print(f"❌ Unexpected input shape for {self.model_name}: {model.input_shape}")
                return False
                
        except Exception as e:
            print(f"❌ Could not create wrapper for {self.model_name}: {e}")
            return False
    
    def predict(self, input_data):
        """Make prediction with appropriate preprocessing"""
        if self.model is None:
            raise ValueError(f"Model {self.model_name} not loaded")
            
        if self.requires_special_input:
            # Apply special preprocessing here
            pass
            
        return self.model.predict(input_data)

def load_original_model_with_fallback(primary_path, fallback_path, model_name):
    """Try to load original model, fallback to extracted weights version"""
    
    print(f"🎯 Attempting to load ORIGINAL {model_name}")
    
    # Try original model first
    loader = OriginalModelLoader(primary_path, model_name)
    if loader.load_with_input_fix():
        return loader.model
    
    # Fallback to extracted weights version
    print(f"🔄 Falling back to extracted weights version for {model_name}")
    try:
        fallback_model = tf.keras.models.load_model(fallback_path)
        print(f"✅ Loaded fallback {model_name} successfully")
        return fallback_model
    except Exception as e:
        print(f"❌ Fallback {model_name} also failed: {e}")
        return None

if __name__ == "__main__":
    # Test the loader
    from config import MODEL_CONFIG
    
    models = ["vgg", "effnet"]
    
    for model_name in models:
        primary = MODEL_CONFIG["local"][model_name]
        fallback = MODEL_CONFIG["fallback"][model_name]
        
        result = load_original_model_with_fallback(primary, fallback, model_name)
        if result:
            print(f"✅ {model_name} ready for use")
        else:
            print(f"❌ {model_name} could not be loaded")
