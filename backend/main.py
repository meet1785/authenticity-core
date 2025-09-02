from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
try:
    # TensorFlow is optional for development. If unavailable we fall back to stubs so the API can run.
    from tensorflow.keras.models import load_model
    from tensorflow.keras.preprocessing import image
    import tensorflow as tf
    TF_AVAILABLE = True
except Exception:
    load_model = None
    image = None
    tf = None
    TF_AVAILABLE = False
import numpy as np
from PIL import Image
import io
import requests
import os
import cv2
import base64
from io import BytesIO
from config import MODEL_CONFIG, SERVER_CONFIG, PREPROCESSING_CONFIG
from utilities import generate_gradcam_cnn, generate_gradcam_effnet, generate_gradcam_vgg16, toImageArray

app = FastAPI()

# Apply CORS settings from config
app.add_middleware(
    CORSMiddleware,
    **SERVER_CONFIG["cors"]
)

# Check if we should use remote models
use_remote_models = bool(MODEL_CONFIG["remote"]["server_url"])

# Initialize models dictionary
models = {}

# Provide simple stub model to allow the API to operate in environments without TF installed.
class _StubModel:
    def predict(self, x):
        # return a deterministic 2-class softmax-like vector
        return np.array([[0.8, 0.2]])

# Model wrapper to handle input shape conversion
class _ModelWrapper:
    def __init__(self, model, expects_grayscale=False):
        self.model = model
        self.expects_grayscale = expects_grayscale
    
    def predict(self, x):
        if self.expects_grayscale and x.shape[-1] == 3:
            # Convert RGB to grayscale for models that expect single channel
            # Using standard grayscale conversion weights
            x_gray = np.dot(x[..., :3], [0.2989, 0.5870, 0.1140])
            x_gray = np.expand_dims(x_gray, axis=-1)
            return self.model.predict(x_gray)
        return self.model.predict(x)

# Function to safely load models with better error handling
def safe_load_model(model_path, model_name):
    """
    Safely load a model with comprehensive error handling
    """
    try:
        print(f"🔄 Attempting to load {model_name} model...")
        
        # First check if file exists and is readable
        if not os.path.exists(model_path):
            print(f"❌ Model file not found: {model_path}")
            return None
            
        # Check file size
        file_size = os.path.getsize(model_path)
        if file_size == 0:
            print(f"❌ Model file is empty: {model_path}")
            return None
        print(f"� Model file size: {file_size / (1024*1024):.1f} MB")
        
        # Try to load the model
        model = load_model(model_path, compile=False)
        print(f"✅ {model_name} model loaded successfully")
        return model
        
    except Exception as e:
        error_msg = str(e)
        if "input shape" in error_msg.lower():
            print(f"⚠️ {model_name} has input shape incompatibility: {error_msg}")
            print(f"🔄 This model expects different input format than provided")
        elif "layer" in error_msg.lower():
            print(f"⚠️ {model_name} has layer compatibility issues: {error_msg}")
        else:
            print(f"❌ {model_name} failed to load: {error_msg}")
        
        print(f"💡 Using stub model for {model_name} to maintain API functionality")
        return None

# Load local models if not using remote models
if not use_remote_models:
    if not TF_AVAILABLE:
        print("⚠️ TensorFlow not available - using stub models for development.")
        models = {"cnn": _StubModel(), "effnet": _StubModel(), "vgg": _StubModel()}
    else:
        print("🔄 Starting model loading process...")
        try:
            print("Loading local models...")
            print(f"Current working directory: {os.getcwd()}")
            
            # Get absolute paths to model files
            base_dir = os.path.dirname(os.path.abspath(__file__))
            cnn_path = os.path.join(base_dir, MODEL_CONFIG["local"]["cnn"])
            vgg_path = os.path.join(base_dir, MODEL_CONFIG["local"]["vgg"])
            effnet_path = os.path.join(base_dir, MODEL_CONFIG["local"]["effnet"])
            
            print(f"CNN path: {cnn_path}")
            print(f"VGG path: {vgg_path}")
            print(f"EffNet path: {effnet_path}")
            
            # Load CNN model
            if os.path.exists(cnn_path):
                cnn_model = safe_load_model(cnn_path, "CNN")
                if cnn_model is not None:
                    models["cnn"] = _ModelWrapper(cnn_model, expects_grayscale=False)
                else:
                    models["cnn"] = _StubModel()
            else:
                print(f"❌ CNN model file not found: {cnn_path}")
                models["cnn"] = _StubModel()
                
            # Load VGG model
            if os.path.exists(vgg_path):
                vgg_model = safe_load_model(vgg_path, "VGG")
                if vgg_model is not None:
                    models["vgg"] = _ModelWrapper(vgg_model, expects_grayscale=False)
                else:
                    models["vgg"] = _StubModel()
            else:
                print(f"❌ VGG model file not found: {vgg_path}")
                models["vgg"] = _StubModel()
            
            # Load EffNet model (optional)
            if os.path.exists(effnet_path):
                effnet_model = safe_load_model(effnet_path, "EffNet")
                if effnet_model is not None:
                    models["effnet"] = _ModelWrapper(effnet_model, expects_grayscale=False)
                else:
                    models["effnet"] = _StubModel()
            else:
                print(f"⚠️ EffNet model file not found: {effnet_path}")
                models["effnet"] = _StubModel()
            
            if not models:
                print("⚠️ No local models loaded — consider using a remote model server or placing model files in the backend/models directory")
                print("⚠️ No local models loaded — consider using a remote model server or placing model files in the backend/models directory")

            print(f"✅ Loaded {len(models)} models successfully")
            print(f"Available models: {list(models.keys())}")
            print("🚀 Model loading complete")
        except Exception as e:
            print(f"❌ Error loading local models: {e}")
            # Continue without models - they might be loaded later or we'll use remote
else:
    print("🌐 Using remote models, skipping local model loading...")

# Preprocess uploaded image
def preprocess_image(file, target_size=None):
    if target_size is None:
        target_size = PREPROCESSING_CONFIG["image_size"]
    
    img = Image.open(io.BytesIO(file)).convert("RGB")
    img = img.resize(target_size)

    # If keras.preprocessing.image is available use it, otherwise fallback to numpy array
    if image is not None:
        img_array = image.img_to_array(img)
    else:
        img_array = np.array(img, dtype=np.float32)

    img_array = np.expand_dims(img_array, axis=0)
    
    if PREPROCESSING_CONFIG["normalize"]:
        img_array /= PREPROCESSING_CONFIG["normalization_factor"]
        
    return img_array

@app.post("/predict/{model_name}")
async def predict(model_name: str, file: UploadFile = File(...), threshold: float = 0.5):
    # Accept both 'vgg' and 'vgg16' for compatibility
    valid_models = ["cnn", "effnet", "vgg", "vgg16"]
    if model_name not in valid_models:
        raise HTTPException(status_code=400, detail="Invalid model name. Use cnn, effnet, vgg, or vgg16")
    
    # Validate threshold
    if not 0.1 <= threshold <= 0.9:
        raise HTTPException(status_code=400, detail="Threshold must be between 0.1 and 0.9")
    
    # Normalize vgg16 to vgg for internal processing
    internal_model_name = "vgg" if model_name == "vgg16" else model_name
    
    contents = await file.read()
    
    # If using remote models, forward the request
    if use_remote_models:
        try:
            remote_url = f"{MODEL_CONFIG['remote']['server_url']}{MODEL_CONFIG['remote']['endpoints'][internal_model_name]}"
            
            # Prepare headers with API key if provided
            headers = {}
            if MODEL_CONFIG['remote']['api_key']:
                headers['Authorization'] = f"Bearer {MODEL_CONFIG['remote']['api_key']}"
            
            # Create a new file-like object from the contents
            files = {'file': (file.filename, contents, file.content_type)}
            
            # Forward the request to the remote model server
            response = requests.post(
                remote_url,
                files=files,
                headers=headers,
                timeout=MODEL_CONFIG['remote']['timeout']
            )
            
            # Check if the request was successful
            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Remote model server error: {response.text}"
                )
                
        except requests.RequestException as e:
            raise HTTPException(
                status_code=503,
                detail=f"Error connecting to remote model server: {str(e)}"
            )
    
    # If not using remote models, use local models
    if internal_model_name not in models:
        raise HTTPException(
            status_code=503,
            detail=f"Model {internal_model_name} is not loaded and no remote server is configured"
        )
    
    # Process with local model
    try:
        img_array = preprocess_image(contents)
        prediction = models[internal_model_name].predict(img_array)
        
        # Handle both single output (sigmoid) and dual output (softmax) models
        prediction_flat = prediction.flatten()
        
        if len(prediction_flat) == 1:
            # Single output sigmoid model (like original CNN)
            sigmoid_prob = float(prediction_flat[0])
            probabilities = [1.0 - sigmoid_prob, sigmoid_prob]  # [real_prob, fake_prob]
            predicted_class = 1 if sigmoid_prob > threshold else 0  # Use custom threshold
            fake_confidence = sigmoid_prob
        else:
            # Dual output softmax model (like VGG, EffNet binary)
            probabilities = prediction.tolist()[0]
            predicted_class = int(np.argmax(prediction, axis=1)[0])
            fake_confidence = probabilities[1] if len(probabilities) > 1 else 0.5
        
        print(f"🔍 Model {internal_model_name} predictions (threshold: {threshold}):")
        print(f"   Raw prediction shape: {prediction.shape}")
        print(f"   Raw prediction: {prediction.flatten()}")
        print(f"   Final probabilities: {probabilities}")
        print(f"   Predicted class: {predicted_class}")
        print(f"   Threshold used: {threshold} ({'High sensitivity' if threshold < 0.4 else 'Low sensitivity' if threshold > 0.6 else 'Medium sensitivity'})")
        
        # Generate heatmap using utilities  
        heatmap_data = None
        try:
            print(f"🔍 Checking if heatmap generation is possible for {internal_model_name}")
            print(f"   Model type: {type(models[internal_model_name])}")
            print(f"   Is StubModel: {isinstance(models[internal_model_name], _StubModel)}")
            
            # Only generate heatmaps for models that loaded successfully (not stubs)
            if not isinstance(models[internal_model_name], _StubModel):
                print(f"✅ Proceeding with heatmap generation for {internal_model_name}")
                # Convert file contents to image array for grad-cam
                img_for_gradcam = toImageArray(io.BytesIO(contents))
                print(f"   Image shape: {img_for_gradcam.shape}")
                
                if internal_model_name == "cnn":
                    # Use the improved GradCAM function with the loaded model
                    actual_model = models[internal_model_name].model if hasattr(models[internal_model_name], 'model') else models[internal_model_name]
                    print(f"   Using model: {type(actual_model)}")
                    heatmap_data = generate_improved_gradcam(
                        actual_model, 
                        img_for_gradcam, 
                        model_type="cnn"
                    )
                    print(f"   Heatmap result: {'generated' if heatmap_data else 'None'}")
                elif internal_model_name == "vgg":
                    # Use GradCAM for VGG16
                    actual_model = models[internal_model_name].model if hasattr(models[internal_model_name], 'model') else models[internal_model_name]
                    print(f"   Using VGG model: {type(actual_model)}")
                    heatmap_data = generate_improved_gradcam(
                        actual_model, 
                        img_for_gradcam, 
                        model_type="vgg"
                    )
                    print(f"   VGG Heatmap result: {'generated' if heatmap_data else 'None'}")
                elif internal_model_name == "effnet":
                    # Use GradCAM for EfficientNet
                    actual_model = models[internal_model_name].model if hasattr(models[internal_model_name], 'model') else models[internal_model_name]
                    print(f"   Using EffNet model: {type(actual_model)}")
                    heatmap_data = generate_improved_gradcam(
                        actual_model, 
                        img_for_gradcam, 
                        model_type="effnet"
                    )
                    print(f"   EffNet Heatmap result: {'generated' if heatmap_data else 'None'}")
                else:
                    print(f"Info: Unknown model type {internal_model_name}")
            else:
                print(f"Info: Skipping heatmap generation for {internal_model_name} (using stub model)")
        except Exception as e:
            print(f"Warning: Could not generate heatmap for {internal_model_name}: {e}")
            import traceback
            traceback.print_exc()
        
        return {
            "model": model_name,  # Return original model name for API consistency
            "predicted_class": predicted_class,
            "probabilities": probabilities,
            "probability": fake_confidence,  # Fake probability
            "threshold": threshold,
            "sensitivity": "High" if threshold < 0.4 else ("Low" if threshold > 0.6 else "Medium"),
            "interpretation": f"{'FAKE' if predicted_class == 1 else 'REAL'} ({fake_confidence:.1%} fake confidence)",
            "heatmap": heatmap_data
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing with local model: {str(e)}"
        )

# Improved GradCAM function that works with pre-loaded models
def generate_improved_gradcam(actual_model, img_array, model_type="cnn", target_size=(224, 224), intensity=0.4):
    """
    Generate GradCAM heatmap using already-loaded model
    """
    try:
        if not TF_AVAILABLE:
            return None
            
        # Preprocess image for the model
        img_resized = cv2.resize(img_array, target_size)
        x = np.expand_dims(img_resized, axis=0)
        
        # Normalize the input (0-1 range)
        x = x.astype(np.float32) / 255.0
        
        # Try to find the last convolutional layer based on model type
        conv_layer_name = None
        conv_layers = []
        
        # Get the actual Keras model from wrapper
        keras_model = actual_model.model if hasattr(actual_model, 'model') else actual_model
        
        # Model-specific layer name mapping
        if model_type == "cnn":
            # For CNN, use conv2d layers
            for layer in keras_model.layers:
                if 'conv2d' in layer.name.lower():
                    conv_layers.append(layer.name)
        elif model_type == "vgg":
            # For VGG, look for block conv layers, prefer block5
            for layer in keras_model.layers:
                if 'conv' in layer.name.lower():
                    conv_layers.append(layer.name)
        elif model_type == "effnet":
            # For EfficientNet, look for expansion or top conv layers
            for layer in keras_model.layers:
                if 'conv' in layer.name.lower():
                    conv_layers.append(layer.name)
        else:
            # Generic approach
            for layer in keras_model.layers:
                if any(layer_type in layer.__class__.__name__.lower() for layer_type in ['conv2d', 'conv', 'convolution']):
                    conv_layers.append(layer.name)
                
        if conv_layers:
            # Use the last conv layer for all models
            conv_layer_name = conv_layers[-1]
            print(f"🎯 Using conv layer: {conv_layer_name} for {model_type}")
            print(f"   Available conv layers: {conv_layers}")
        else:
            print(f"Warning: No convolutional layer found for {model_type}")
            return None
        
        # Build gradient model using the Keras model
        try:
            grad_model = tf.keras.models.Model(
                [keras_model.inputs],
                [keras_model.get_layer(conv_layer_name).output, keras_model.output]
            )
        except Exception as grad_error:
            print(f"Error building gradient model: {grad_error}")
            return None
        
        # Forward and backward pass
        with tf.GradientTape() as tape:
            conv_outputs, predictions = grad_model(x)
            
            # Handle predictions - ensure it's a tensor
            if isinstance(predictions, list):
                predictions = tf.convert_to_tensor(predictions)
            
            # Get the class with highest probability (convert to scalar)
            class_idx = tf.argmax(predictions[0])
            class_idx_scalar = int(class_idx.numpy())  # Convert to Python int
            loss = predictions[:, class_idx_scalar]

        # Compute gradients
        grads = tape.gradient(loss, conv_outputs)
        
        if grads is None:
            print(f"Warning: No gradients computed for {model_type}")
            return None
            
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

        # Generate heatmap
        conv_outputs = conv_outputs[0]
        heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
        heatmap = tf.squeeze(heatmap)
        
        # Normalize heatmap
        heatmap = tf.maximum(heatmap, 0)
        heatmap_max = tf.math.reduce_max(heatmap)
        if heatmap_max > 0:
            heatmap = heatmap / heatmap_max
        else:
            print(f"Warning: Zero max in heatmap for {model_type}")
            return None

        # Resize heatmap to match original image size
        heatmap_resized = cv2.resize(heatmap.numpy(), (img_array.shape[1], img_array.shape[0]))
        
        # Convert to color map
        heatmap_colored = np.uint8(255 * heatmap_resized)
        heatmap_colored = cv2.applyColorMap(heatmap_colored, cv2.COLORMAP_JET)

        # Create overlay with better blending
        # Ensure img_array is in the right format
        if img_array.max() <= 1.0:
            img_array = (img_array * 255).astype(np.uint8)
        
        superimposed_img = cv2.addWeighted(img_array, 1-intensity, heatmap_colored, intensity, 0)

        # Convert to Base64 string
        pil_img = Image.fromarray(superimposed_img)
        buffer = BytesIO()
        pil_img.save(buffer, format="JPEG", quality=90)
        gradcam_b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

        print(f"✅ Generated heatmap for {model_type} (size: {len(gradcam_b64)} chars)")
        return gradcam_b64
        
    except Exception as e:
        print(f"Error generating GradCAM for {model_type}: {e}")
        import traceback
        traceback.print_exc()
        return None

@app.get("/")
def root():
    return {"message": "Backend is running. Use /predict/cnn, /predict/effnet, /predict/vgg, or /predict/vgg16"}

@app.get("/health")
def health_check():
    loaded_models = list(models.keys())
    return {
        "status": "ok",
        "loaded_models": loaded_models,
        "available_models": ["cnn", "effnet", "vgg", "vgg16"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)