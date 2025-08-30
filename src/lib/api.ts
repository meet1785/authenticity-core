import axios from 'axios';
import { DetectionResult } from '@/types/detection';

// FastAPI backend configuration
const API_BASE_URL = localStorage.getItem('api_base_url') || '';
const API_KEY = localStorage.getItem('api_key') || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(API_KEY && { 'X-API-Key': API_KEY })
  },
  timeout: 30000, // 30 seconds for model inference
});

export interface FastAPIDetectionRequest {
  image?: string; // Base64 encoded image
  image_url?: string; // Image URL
  models?: string[]; // Models to use for detection
  return_heatmaps?: boolean;
}

export interface FastAPIDetectionResponse {
  prediction: 'real' | 'fake';
  confidence: number;
  model_predictions: {
    model_name: string;
    prediction: string;
    confidence: number;
    heatmap?: string; // Base64 encoded heatmap
  }[];
  xceptnet_heatmap?: string;
  supcon_heatmap?: string;
  ensemble_heatmap?: string;
  processing_time: number;
}

export async function detectDeepfakeAPI(
  imageData: string | File,
  config?: { models?: string[]; returnHeatmaps?: boolean }
): Promise<DetectionResult> {
  try {
    const formData = new FormData();
    
    if (imageData instanceof File) {
      formData.append('file', imageData);
    } else {
      // Handle base64 or URL
      const request: FastAPIDetectionRequest = {
        image_url: imageData.startsWith('http') ? imageData : undefined,
        image: !imageData.startsWith('http') ? imageData : undefined,
        models: config?.models,
        return_heatmaps: config?.returnHeatmaps ?? true,
      };
      
      const response = await api.post<FastAPIDetectionResponse>('/detect', request);
      return mapFastAPIResponse(response.data, imageData);
    }
    
    // For file upload
    if (config?.models) {
      formData.append('models', JSON.stringify(config.models));
    }
    if (config?.returnHeatmaps !== undefined) {
      formData.append('return_heatmaps', String(config.returnHeatmaps));
    }
    
    const response = await api.post<FastAPIDetectionResponse>('/detect/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    return mapFastAPIResponse(response.data, URL.createObjectURL(imageData as File));
  } catch (error) {
    console.error('API Detection Error:', error);
    throw error;
  }
}

function mapFastAPIResponse(
  response: FastAPIDetectionResponse,
  imageUrl: string
): DetectionResult {
  return {
    prediction: response.prediction === 'fake' ? 'Fake' : 'Real',
    isDeepfake: response.prediction === 'fake',
    ensembleConfidence: Math.round(response.confidence * 100),
    modelPredictions: response.model_predictions.map(pred => ({
      name: pred.model_name,
      realConfidence: pred.prediction === 'real' ? Math.round(pred.confidence * 100) : Math.round((1 - pred.confidence) * 100),
      fakeConfidence: pred.prediction === 'fake' ? Math.round(pred.confidence * 100) : Math.round((1 - pred.confidence) * 100),
      heatmapUrl: pred.heatmap ? `data:image/png;base64,${pred.heatmap}` : undefined,
    })),
    heatmapUrl: response.ensemble_heatmap ? `data:image/png;base64,${response.ensemble_heatmap}` : undefined,
    xceptNetHeatmap: response.xceptnet_heatmap ? `data:image/png;base64,${response.xceptnet_heatmap}` : undefined,
    supConHeatmap: response.supcon_heatmap ? `data:image/png;base64,${response.supcon_heatmap}` : undefined,
    timestamp: new Date().toISOString(),
    imageUrl,
  };
}

export function updateAPIConfig(baseUrl: string, apiKey?: string) {
  localStorage.setItem('api_base_url', baseUrl);
  if (apiKey) {
    localStorage.setItem('api_key', apiKey);
  }
  
  // Update axios instance
  api.defaults.baseURL = baseUrl;
  if (apiKey) {
    api.defaults.headers['X-API-Key'] = apiKey;
  }
}

export async function testAPIConnection(): Promise<boolean> {
  try {
    const response = await api.get('/health');
    return response.status === 200;
  } catch {
    return false;
  }
}