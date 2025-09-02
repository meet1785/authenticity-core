import numpy as np
try:
    import tensorflow as tf
    TF_AVAILABLE = True
except Exception:
    tf = None
    TF_AVAILABLE = False
import cv2
import base64
from io import BytesIO
from PIL import Image
import matplotlib.pyplot as plt



def generate_gradcam_vgg16(img_array, target_size=(224, 224), intensity=0.4):
    import os
    # If TensorFlow is not available, return None to indicate heatmap generation isn't possible
    if not TF_AVAILABLE:
        return {'gradcam_vgg16': None}
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, "models", "vgg16_standalone_authnet.keras")
    model = tf.keras.models.load_model(model_path)
    
    # Resize + preprocess for VGG16
    img_resized = cv2.resize(img_array, target_size)
    x = np.expand_dims(img_resized, axis=0)

    # Build grad model
    grad_model = tf.keras.models.Model(
        [model.inputs],
        [model.get_layer('top_conv').output, model.output]
    )

    # Forward + backward pass
    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(x)
        class_idx = tf.argmax(predictions[0])
        loss = predictions[:, class_idx]

    grads = tape.gradient(loss, conv_outputs)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    # Generate heatmap
    conv_outputs = conv_outputs[0]
    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)
    heatmap = tf.maximum(heatmap, 0) / tf.math.reduce_max(heatmap)

    # Resize heatmap to match original image
    heatmap = cv2.resize(heatmap.numpy(), (img_array.shape[1], img_array.shape[0]))
    heatmap = np.uint8(255 * heatmap)
    heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)

    # Overlay
    superimposed_img = heatmap * intensity + img_array
    superimposed_img = np.clip(superimposed_img, 0, 255).astype(np.uint8)

    # Convert to Base64 string
    pil_img = Image.fromarray(superimposed_img)
    buffer = BytesIO()
    pil_img.save(buffer, format="JPEG")
    gradcam_vgg16 = base64.b64encode(buffer.getvalue()).decode("utf-8")

    return {'gradcam_vgg16': gradcam_vgg16}



def generate_gradcam_cnn(img_array, target_size=(224, 224), intensity=0.4):
    import os
    if not TF_AVAILABLE:
        return {'gradcam_cnn': None}
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, "models", "cnn_standalone.keras")
    model = tf.keras.models.load_model(model_path)
    
    # Resize + preprocess for VGG16
    img_resized = cv2.resize(img_array, target_size)
    x = np.expand_dims(img_resized, axis=0)

    # Build grad model
    grad_model = tf.keras.models.Model(
        [model.inputs],
        [model.get_layer('conv2d_47').output, model.output]
    )

    # Forward + backward pass
    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(x)
        class_idx = tf.argmax(predictions[0])
        loss = predictions[:, class_idx]

    grads = tape.gradient(loss, conv_outputs)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    # Generate heatmap
    conv_outputs = conv_outputs[0]
    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)
    heatmap = tf.maximum(heatmap, 0) / tf.math.reduce_max(heatmap)

    # Resize heatmap to match original image
    heatmap = cv2.resize(heatmap.numpy(), (img_array.shape[1], img_array.shape[0]))
    heatmap = np.uint8(255 * heatmap)
    heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)

    # Overlay
    superimposed_img = heatmap * intensity + img_array
    superimposed_img = np.clip(superimposed_img, 0, 255).astype(np.uint8)

    # Convert to Base64 string
    pil_img = Image.fromarray(superimposed_img)
    buffer = BytesIO()
    pil_img.save(buffer, format="JPEG")
    gradcam_cnn = base64.b64encode(buffer.getvalue()).decode("utf-8")

    return {'gradcam_cnn':gradcam_cnn}




def generate_gradcam_effnet(img_array, target_size=(224, 224), intensity=0.4):
    import os
    if not TF_AVAILABLE:
        return {'effnet_gradcam': None}
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, "models", "effnet_standalone_authnet.keras")
    model = tf.keras.models.load_model(model_path)
    
    # Resize + preprocess for VGG16
    img_resized = cv2.resize(img_array, target_size)
    x = np.expand_dims(img_resized, axis=0)

    # Build grad model
    grad_model = tf.keras.models.Model(
        [model.inputs],
        [model.get_layer('top_conv').output, model.output]
    )

    # Forward + backward pass
    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(x)
        class_idx = tf.argmax(predictions[0])
        loss = predictions[:, class_idx]

    grads = tape.gradient(loss, conv_outputs)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    # Generate heatmap
    conv_outputs = conv_outputs[0]
    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)
    heatmap = tf.maximum(heatmap, 0) / tf.math.reduce_max(heatmap)

    # Resize heatmap to match original image
    heatmap = cv2.resize(heatmap.numpy(), (img_array.shape[1], img_array.shape[0]))
    heatmap = np.uint8(255 * heatmap)
    heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)

    # Overlay
    superimposed_img = heatmap * intensity + img_array
    superimposed_img = np.clip(superimposed_img, 0, 255).astype(np.uint8)

    # Convert to Base64 string
    pil_img = Image.fromarray(superimposed_img)
    buffer = BytesIO()
    pil_img.save(buffer, format="JPEG")
    gradcam_effnet = base64.b64encode(buffer.getvalue()).decode("utf-8")

    return {'effnet_gradcam': gradcam_effnet}


import numpy as np
from scipy import stats



def majority_pipeline(img_array, IMAGE_SIZE = (224, 224)):
    import os
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    vgg16_path = os.path.join(base_dir, "models", "vgg16_standalone_authnet.keras")
    cnn_path = os.path.join(base_dir, "models", "cnn_standalone.keras")
    effnet_path = os.path.join(base_dir, "models", "effnet_standalone_authnet.keras")
    
    if not TF_AVAILABLE:
        raise RuntimeError("TensorFlow is required for majority_pipeline")
    vgg16 = tf.keras.models.load_model(vgg16_path)
    cnn = tf.keras.models.load_model(cnn_path)
    effnet = tf.keras.models.load_model(effnet_path)
    
    img = tf.expand_dims(img_array, axis=0)

    classes = ['real', 'fake']

    pred_effnet = float(effnet.predict(img, verbose=0)[0][0])
    pred_effnet_label = int(pred_effnet > 0.5)  # 0, 1
    pred_effnet_class = classes[pred_effnet_label]

    pred_cnn = float(cnn.predict(img, verbose=0)[0][0])
    pred_cnn_label = int(float(pred_cnn> 0.5))
    pred_cnn_class = classes[pred_cnn_label]

    pred_vgg16 = float(vgg16.predict(img, verbose=0)[0][0])
    pred_vgg16_label = int(float(pred_vgg16 > 0.5))
    pred_vgg16_class = classes[pred_vgg16_label]

    prediction = np.array([pred_effnet, pred_cnn, pred_vgg16])
    pred_labels = (prediction > 0.5).astype(int)

    majority_label = int(stats.mode(pred_labels).mode) # 0, 1
    majority_class = classes[majority_label]

    result = {
    'effnet' : {
        'fake_confidence' : pred_effnet,
        'class': pred_effnet_class
    },
    'cnn' : {
        'fake_confidence' : pred_cnn,
        'class': pred_cnn_class
    },
    'vgg16' : {
        'fake_confidence' : pred_vgg16,
        'class' : pred_vgg16_class
    },
    'majority_vote' : majority_class
    }

    return result

def toImageArray(uploaded_file):
    img = Image.open(uploaded_file).convert("RGB")
    img_array = np.array(img)
    return img_array