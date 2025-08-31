# Distributed Setup Guide for AuthNet

This guide explains how to set up AuthNet in a distributed configuration where:

1. Your friend runs the model server with the AI models
2. You run the backend API server and frontend

## Overview

The distributed setup consists of three components:

1. **Model Server**: Runs the AI models and provides prediction endpoints
2. **Backend API**: Connects to the model server and provides API endpoints for the frontend
3. **Frontend**: User interface that connects to the backend API

## Setup Instructions

### For Your Friend (Model Server)

1. **Clone or copy the repository**
   - Ensure they have the `model_server.py` file and the `models` directory with the Keras models

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the model server**
   ```bash
   python model_server.py
   ```
   - The server will run on port 8001 by default
   - They can change the port by setting the PORT environment variable

4. **Find their IP address**
   - On Windows: Open Command Prompt and type `ipconfig`
   - On macOS/Linux: Open Terminal and type `ifconfig` or `ip addr`
   - Look for the IPv4 address (e.g., 192.168.1.100)

5. **Share the model server URL with you**
   - The URL will be `http://<their-ip-address>:8001`
   - Example: `http://192.168.1.100:8001`

### For You (Backend API and Frontend)

1. **Configure the backend to use the remote model server**
   - Open `config.py`
   - Update the `server_url` in the remote section with your friend's model server URL:
     ```python
     "server_url": "http://192.168.1.100:8001",  # Replace with your friend's IP
     ```

2. **Run the backend API server**
   ```bash
   uvicorn main:app --reload
   ```
   - The server will run on port 8000 by default

3. **Configure the frontend**
   - Update the API base URL in the frontend to point to your backend
   - The default is `http://localhost:8000`

4. **Run the frontend**
   ```bash
   cd path/to/authenticity-core
   npm install
   npm run dev
   ```

## Network Configuration

### Local Network Setup

If you and your friend are on the same local network:

1. Make sure both computers are connected to the same network
2. Your friend may need to configure their firewall to allow incoming connections on port 8001
3. Use the local IP address for the connection

### Remote Setup (Different Networks)

If you and your friend are on different networks:

1. **Option 1: Use a tunneling service like ngrok**
   - Your friend installs ngrok: https://ngrok.com/download
   - They run: `ngrok http 8001`
   - They share the ngrok URL with you (e.g., `https://abc123.ngrok.io`)
   - You update the `server_url` in `config.py` with this URL

2. **Option 2: Port forwarding**
   - Your friend configures their router to forward port 8001 to their computer
   - They share their public IP address with you
   - You update the `server_url` in `config.py` with `http://<their-public-ip>:8001`
   - Note: This requires router access and may have security implications

3. **Option 3: Cloud deployment**
   - Your friend deploys the model server to a cloud service
   - They share the cloud URL with you
   - You update the `server_url` in `config.py` with this URL

## Testing the Connection

1. Start the model server on your friend's computer
2. Start the backend API on your computer
3. Open a web browser and navigate to `http://localhost:8000/health`
4. You should see a response indicating the backend is running
5. Start the frontend and check if the API status shows "Connected"

## Troubleshooting

### Model Server Issues

- **Models not loading**: Check that the model files exist in the correct location
- **Port already in use**: Change the port using the PORT environment variable
- **Network access denied**: Check firewall settings

### Backend API Issues

- **Cannot connect to model server**: Verify the URL in `config.py` and check network connectivity
- **CORS errors**: Ensure the model server has CORS properly configured
- **Timeout errors**: Increase the timeout value in `config.py`

### Frontend Issues

- **API not connected**: Check that the backend API is running and accessible
- **Incorrect API URL**: Update the API URL in the frontend configuration

## Security Considerations

- The current setup does not include authentication between the backend and model server
- For production use, consider adding API key authentication
- Restrict CORS settings to only allow requests from trusted origins
- Use HTTPS for all connections in production environments

## Advanced Configuration

### Load Balancing

If your friend has multiple computers with models:

1. Set up model servers on each computer
2. Use a load balancer to distribute requests
3. Update the `server_url` in `config.py` to point to the load balancer

### High Availability

For critical applications:

1. Set up redundant model servers
2. Configure the backend to fall back to alternative servers if the primary is unavailable
3. Consider using a service discovery mechanism