print("Starting test")
from original_model_loader import load_original_model_with_fallback
print("Imported function")
result = load_original_model_with_fallback('models/effnet_standalone_authnet.keras', 'models/effnet_standalone_authnet.keras', 'EffNet')
print("Function called")
print('Success' if result else 'Failed')
if result:
    print(f'Input shape: {result.input_shape}')
