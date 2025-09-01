# Test connection between backend and model server

import requests
import sys
import json
from config import MODEL_CONFIG

def test_model_server_connection(url=None):
    """Test connection to the model server"""
    if url is None:
        url = MODEL_CONFIG["remote"]["server_url"]
        if not url:
            print("Error: No model server URL configured in config.py")
            print("Please update the 'server_url' in the 'remote' section of config.py")
            return False
    
    # Add /health if not already in the URL
    if not url.endswith("/health"):
        url = url.rstrip("/") + "/health"
    
    print(f"Testing connection to model server at: {url}")
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            print("✅ Connection successful!")
            print(f"Status: {data.get('status', 'unknown')}")
            print(f"Loaded models: {', '.join(data.get('loaded_models', []))}")
            return True
        else:
            print(f"❌ Connection failed with status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.RequestException as e:
        print(f"❌ Connection error: {str(e)}")
        return False

def update_config(url):
    """Update the config.py file with the provided URL"""
    try:
        # Read the current config
        with open("config.py", "r") as f:
            config_content = f.read()
        
        # Find the server_url line and replace it
        import re
        new_config = re.sub(
            r'"server_url":\s*"[^"]*"',
            f'"server_url": "{url}"',
            config_content
        )
        
        # Write the updated config
        with open("config.py", "w") as f:
            f.write(new_config)
        
        print(f"✅ Updated config.py with model server URL: {url}")
        return True
    except Exception as e:
        print(f"❌ Error updating config.py: {str(e)}")
        return False

def main():
    """Main function"""
    if len(sys.argv) > 1:
        # URL provided as command line argument
        url = sys.argv[1]
        if test_model_server_connection(url):
            # Ask if user wants to update config
            response = input("Do you want to update config.py with this URL? (y/n): ")
            if response.lower() in ["y", "yes"]:
                update_config(url)
    else:
        # Use URL from config
        test_model_server_connection()

if __name__ == "__main__":
    main()