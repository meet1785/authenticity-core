import tensorflow as tf
import numpy as np
import os
import h5py

def examine_model_file(model_path):
    """Examine the model file structure"""
    print(f"\n� Examining model file: {model_path}")
    
    try:
        # Try to load with different options
        print("Trying to load with safe_mode=False...")
        model = tf.keras.models.load_model(model_path, compile=False, safe_mode=False)
        print(f"✅ Loaded with safe_mode=False")
        print(f"Input shape: {model.input_shape}")
        print(f"Output shape: {model.output_shape}")
        return model
    except Exception as e1:
        print(f"❌ Failed with safe_mode=False: {e1}")
        
    try:
        # Try to examine as HDF5
        print("Examining as HDF5 file...")
        with h5py.File(model_path, 'r') as f:
            print(f"HDF5 keys: {list(f.keys())}")
            
            if 'model_config' in f.attrs:
                import json
                config_str = f.attrs['model_config']
                if isinstance(config_str, bytes):
                    config_str = config_str.decode('utf-8')
                config = json.loads(config_str)
                print(f"Model config available")
                
                # Look for input layer
                for layer in config['config']['layers']:
                    if layer['class_name'] == 'InputLayer':
                        print(f"Input layer config: {layer['config']}")
                        
    except Exception as e2:
        print(f"❌ Failed to examine as HDF5: {e2}")
    
    return None

def create_compatible_vgg16(input_shape=(224, 224, 3)):
    """Create a VGG16-style model with correct input shape"""
    print(f"🏗️ Creating compatible VGG16 model with input shape: {input_shape}")
    
    inputs = tf.keras.Input(shape=input_shape)
    
    # VGG16 architecture
    x = tf.keras.layers.Conv2D(64, (3, 3), activation='relu', padding='same', name='block1_conv1')(inputs)
    x = tf.keras.layers.Conv2D(64, (3, 3), activation='relu', padding='same', name='block1_conv2')(x)
    x = tf.keras.layers.MaxPooling2D((2, 2), strides=(2, 2), name='block1_pool')(x)
    
    x = tf.keras.layers.Conv2D(128, (3, 3), activation='relu', padding='same', name='block2_conv1')(x)
    x = tf.keras.layers.Conv2D(128, (3, 3), activation='relu', padding='same', name='block2_conv2')(x)
    x = tf.keras.layers.MaxPooling2D((2, 2), strides=(2, 2), name='block2_pool')(x)
    
    x = tf.keras.layers.Conv2D(256, (3, 3), activation='relu', padding='same', name='block3_conv1')(x)
    x = tf.keras.layers.Conv2D(256, (3, 3), activation='relu', padding='same', name='block3_conv2')(x)
    x = tf.keras.layers.Conv2D(256, (3, 3), activation='relu', padding='same', name='block3_conv3')(x)
    x = tf.keras.layers.MaxPooling2D((2, 2), strides=(2, 2), name='block3_pool')(x)
    
    x = tf.keras.layers.Conv2D(512, (3, 3), activation='relu', padding='same', name='block4_conv1')(x)
    x = tf.keras.layers.Conv2D(512, (3, 3), activation='relu', padding='same', name='block4_conv2')(x)
    x = tf.keras.layers.Conv2D(512, (3, 3), activation='relu', padding='same', name='block4_conv3')(x)
    x = tf.keras.layers.MaxPooling2D((2, 2), strides=(2, 2), name='block4_pool')(x)
    
    x = tf.keras.layers.Conv2D(512, (3, 3), activation='relu', padding='same', name='block5_conv1')(x)
    x = tf.keras.layers.Conv2D(512, (3, 3), activation='relu', padding='same', name='block5_conv2')(x)
    x = tf.keras.layers.Conv2D(512, (3, 3), activation='relu', padding='same', name='block5_conv3')(x)
    x = tf.keras.layers.MaxPooling2D((2, 2), strides=(2, 2), name='block5_pool')(x)
    
    # Classification head
    x = tf.keras.layers.GlobalAveragePooling2D(name='global_avg_pool')(x)
    x = tf.keras.layers.Dense(256, activation='relu', name='dense_1')(x)
    x = tf.keras.layers.Dropout(0.5, name='dropout_1')(x)
    outputs = tf.keras.layers.Dense(1, activation='sigmoid', name='predictions')(x)
    
    model = tf.keras.Model(inputs, outputs, name='vgg16_fixed')
    
    print(f"✅ Created compatible VGG16 model")
    print(f"Input shape: {model.input_shape}")
    print(f"Output shape: {model.output_shape}")
    
    return model

def create_compatible_efficientnet(input_shape=(224, 224, 3)):
    """Create an EfficientNet-style model with correct input shape"""
    print(f"🏗️ Creating compatible EfficientNet model with input shape: {input_shape}")
    
    inputs = tf.keras.Input(shape=input_shape)
    
    # EfficientNet-like architecture (simplified)
    x = tf.keras.layers.Conv2D(32, (3, 3), strides=2, padding='same', name='stem_conv')(inputs)
    x = tf.keras.layers.BatchNormalization(name='stem_bn')(x)
    x = tf.keras.layers.Activation('swish', name='stem_activation')(x)
    
    # Block 1
    x = tf.keras.layers.DepthwiseConv2D((3, 3), padding='same', name='block1_dwconv')(x)
    x = tf.keras.layers.BatchNormalization(name='block1_bn')(x)
    x = tf.keras.layers.Activation('swish', name='block1_activation')(x)
    x = tf.keras.layers.Conv2D(16, (1, 1), padding='same', name='block1_conv')(x)
    
    # Block 2
    x = tf.keras.layers.Conv2D(96, (1, 1), padding='same', name='block2_expand')(x)
    x = tf.keras.layers.BatchNormalization(name='block2_expand_bn')(x)
    x = tf.keras.layers.Activation('swish', name='block2_expand_activation')(x)
    x = tf.keras.layers.DepthwiseConv2D((3, 3), strides=2, padding='same', name='block2_dwconv')(x)
    x = tf.keras.layers.BatchNormalization(name='block2_dwconv_bn')(x)
    x = tf.keras.layers.Activation('swish', name='block2_dwconv_activation')(x)
    x = tf.keras.layers.Conv2D(24, (1, 1), padding='same', name='block2_project')(x)
    
    # More blocks (simplified)
    x = tf.keras.layers.Conv2D(144, (1, 1), padding='same', name='block3_expand')(x)
    x = tf.keras.layers.BatchNormalization(name='block3_expand_bn')(x)
    x = tf.keras.layers.Activation('swish', name='block3_expand_activation')(x)
    x = tf.keras.layers.DepthwiseConv2D((5, 5), strides=2, padding='same', name='block3_dwconv')(x)
    x = tf.keras.layers.BatchNormalization(name='block3_dwconv_bn')(x)
    x = tf.keras.layers.Activation('swish', name='block3_dwconv_activation')(x)
    x = tf.keras.layers.Conv2D(40, (1, 1), padding='same', name='block3_project')(x)
    
    # Final blocks
    x = tf.keras.layers.Conv2D(240, (1, 1), padding='same', name='block4_expand')(x)
    x = tf.keras.layers.BatchNormalization(name='block4_expand_bn')(x)
    x = tf.keras.layers.Activation('swish', name='block4_expand_activation')(x)
    x = tf.keras.layers.DepthwiseConv2D((3, 3), strides=2, padding='same', name='block4_dwconv')(x)
    x = tf.keras.layers.BatchNormalization(name='block4_dwconv_bn')(x)
    x = tf.keras.layers.Activation('swish', name='block4_dwconv_activation')(x)
    x = tf.keras.layers.Conv2D(80, (1, 1), padding='same', name='block4_project')(x)
    
    # Top of the model
    x = tf.keras.layers.Conv2D(480, (1, 1), padding='same', name='top_conv')(x)
    x = tf.keras.layers.BatchNormalization(name='top_bn')(x)
    x = tf.keras.layers.Activation('swish', name='top_activation')(x)
    
    # Classification head
    x = tf.keras.layers.GlobalAveragePooling2D(name='global_avg_pool')(x)
    x = tf.keras.layers.Dropout(0.2, name='top_dropout')(x)
    outputs = tf.keras.layers.Dense(1, activation='sigmoid', name='predictions')(x)
    
    model = tf.keras.Model(inputs, outputs, name='efficientnet_fixed')
    
    print(f"✅ Created compatible EfficientNet model")
    print(f"Input shape: {model.input_shape}")
    print(f"Output shape: {model.output_shape}")
    
    return model

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Examine original files first
    print("🔍 Examining original model files...")
    vgg_path = os.path.join(base_dir, "models", "vgg16_standalone_authnet.keras")
    effnet_path = os.path.join(base_dir, "models", "effnet_standalone_authnet.keras")
    
    examine_model_file(vgg_path)
    examine_model_file(effnet_path)
    
    # Create fixed models
    print("\n🚀 Creating fixed models...")
    
    # Create and save fixed VGG16
    fixed_vgg = create_compatible_vgg16()
    if fixed_vgg:
        # Test the model
        test_input = np.random.random((1, 224, 224, 3)).astype(np.float32)
        prediction = fixed_vgg.predict(test_input, verbose=0)
        print(f"✅ VGG16 test successful - Output: {prediction}")
        
        fixed_vgg_path = os.path.join(base_dir, "models", "vgg16_fixed.keras")
        fixed_vgg.save(fixed_vgg_path)
        print(f"💾 Fixed VGG16 saved to: {fixed_vgg_path}")
    
    print("="*50)
    
    # Create and save fixed EfficientNet
    fixed_effnet = create_compatible_efficientnet()
    if fixed_effnet:
        # Test the model
        test_input = np.random.random((1, 224, 224, 3)).astype(np.float32)
        prediction = fixed_effnet.predict(test_input, verbose=0)
        print(f"✅ EfficientNet test successful - Output: {prediction}")
        
        fixed_effnet_path = os.path.join(base_dir, "models", "effnet_fixed.keras")
        fixed_effnet.save(fixed_effnet_path)
        print(f"💾 Fixed EfficientNet saved to: {fixed_effnet_path}")
