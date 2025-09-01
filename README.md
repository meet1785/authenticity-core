# AuthNet - AI Image Authenticity Verification System

An AI-powered system for detecting image authenticity using deep learning models (CNN, EfficientNet, VGG16).

## 🚀 Features

- **Multi-Model Detection**: Uses three different deep learning models for robust analysis
- **React Frontend**: Modern, responsive web interface
- **FastAPI Backend**: High-performance Python API
- **Distributed Deployment**: Support for running models on separate servers
- **Real-time Analysis**: Instant results with confidence scores

## 📁 Project Structure

```
AuthNet/
├── backend/                    # FastAPI server
│   ├── main.py                # Main API server
│   ├── model_server.py       # Model hosting server
│   ├── config.py              # Configuration settings
│   ├── requirements.txt       # Python dependencies
│   ├── models/                # AI model files (see below)
│   └── *.bat                  # Windows startup scripts
├── frontend/                   # React application
│   └── authenticity-core/     # Vite React app
├── SETUP_GUIDE.md            # Complete setup instructions
└── FRONTEND_CONNECTION.md    # Frontend-backend integration guide
```

## 🛠️ Quick Setup

### Prerequisites
- Python 3.8+ with pip
- Node.js 16+ with npm
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/meetshah1708/authenticity-core.git
cd authenticity-core
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
```

### 3. Frontend Setup
```bash
cd ../frontend/authenticity-core
npm install
npm run dev
```

### 4. Download AI Models

The AI model files are too large for GitHub and need to be downloaded separately:

**Option 1: Download from Google Drive**
- [CNN Model](https://drive.google.com/file/d/your-cnn-model-link)
- [EfficientNet Model](https://drive.google.com/file/d/your-effnet-model-link)
- [VGG16 Model](https://drive.google.com/file/d/your-vgg-model-link)

**Option 2: Train Your Own Models**
See the training scripts in the `backend/` directory.

Place the downloaded `.keras` files in the `backend/models/` directory.

### 5. Run the Application

**Local Setup (All-in-One):**
```bash
# Start backend with local models
python main.py

# In another terminal, start frontend
cd frontend/authenticity-core
npm run dev
```

**Distributed Setup:**
```bash
# Start model server (on your friend's machine)
python model_server.py

# Start backend (on your machine)
python main.py

# Start frontend (on your machine)
cd frontend/authenticity-core
npm run dev
```

## 🌐 Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📋 API Endpoints

- `POST /predict/cnn` - CNN model prediction
- `POST /predict/effnet` - EfficientNet prediction
- `POST /predict/vgg` - VGG16 prediction
- `GET /health` - Health check

## 🔧 Configuration

Edit `backend/config.py` to:
- Set model server URLs for distributed setup
- Configure CORS settings
- Adjust preprocessing parameters

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

[Add your license information here]

## 📞 Support

For questions or issues:
- Check the [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed instructions
- Review [FRONTEND_CONNECTION.md](FRONTEND_CONNECTION.md) for integration details
- Open an issue on GitHub

---

**Note**: This repository contains the source code only. AI model files must be downloaded separately due to size limitations.
