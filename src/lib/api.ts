import axios from 'axios';
import { DetectionResult } from '@/types/detection';

// FastAPI backend configuration
const API_BASE_URL = localStorage.getItem('api_base_url') || '';
const API_KEY = localStorage.getItem('api_key') || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    ...(API_KEY && { 'X-API-Key': API_KEY })
  },
  timeout: 30000, // 30 seconds for model inference
});

export interface ModelPredictionResponse {
  model: string;
  predicted_class: number; // 0 for real, 1+ for fake
  probabilities: number[]; // [real_prob, fake_prob, ...]
  heatmap?: string; // Base64 encoded heatmap if available
}

export type ModelType = 'cnn' | 'effnet' | 'vgg';

export async function detectWithModel(
  imageFile: File,
  model: ModelType
): Promise<ModelPredictionResponse> {
  const formData = new FormData();
  formData.append('file', imageFile);
  
  const response = await api.post<ModelPredictionResponse>(
    `/predict/${model}`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' }
    }
  );
  
  return response.data;
}

export async function detectDeepfakeAPI(
  imageData: string | File,
  config?: { models?: string[]; returnHeatmaps?: boolean }
): Promise<DetectionResult> {
  try {
    // Convert to File if needed
    let file: File;
    if (imageData instanceof File) {
      file = imageData;
    } else {
      // Convert base64 or URL to File
      const response = await fetch(imageData);
      const blob = await response.blob();
      file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
    }
    
    // Get selected models or use defaults
    const modelsToUse = config?.models?.map(m => 
      m.toLowerCase().replace('efficientnet', 'effnet')
    ) as ModelType[] || ['cnn', 'effnet', 'vgg'];
    
    // Run predictions in parallel
    const predictions = await Promise.all(
      modelsToUse.map(model => detectWithModel(file, model))
    );
    
    // Aggregate results
    const isDeepfake = predictions.every(p => p.predicted_class > 0);
    const avgConfidence = predictions.reduce((acc, p) => {
      const fakeProb = p.probabilities[1] || 0;
      return acc + (p.predicted_class > 0 ? fakeProb : (1 - fakeProb));
    }, 0) / predictions.length;
    
    return {
      prediction: isDeepfake ? 'Fake' : 'Real',
      isDeepfake,
      ensembleConfidence: Math.round(avgConfidence * 100),
      modelPredictions: predictions.map(pred => {
        const realProb = pred.probabilities[0] || 0;
        const fakeProb = pred.probabilities[1] || 0;
        
        return {
          name: pred.model.toUpperCase().replace('EFFNET', 'EfficientNet').replace('VGG', 'VGG16'),
          realConfidence: Math.round(realProb * 100),
          fakeConfidence: Math.round(fakeProb * 100),
          heatmapUrl: pred.heatmap ? `data:image/png;base64,${pred.heatmap}` : undefined,
        };
      }),
      heatmapUrl: predictions.find(p => p.heatmap)?.heatmap ? 
        `data:image/png;base64,${predictions.find(p => p.heatmap)!.heatmap}` : undefined,
      cnnHeatmap: predictions.find(p => p.model === 'cnn')?.heatmap ? 
        `data:image/png;base64,${predictions.find(p => p.model === 'cnn')!.heatmap}` : undefined,
      efficientNetHeatmap: predictions.find(p => p.model === 'effnet')?.heatmap ? 
        `data:image/png;base64,${predictions.find(p => p.model === 'effnet')!.heatmap}` : undefined,
      vitHeatmap: predictions.find(p => p.model === 'vgg')?.heatmap ? 
        `data:image/png;base64,${predictions.find(p => p.model === 'vgg')!.heatmap}` : undefined,
      timestamp: new Date().toISOString(),
      imageUrl: imageData instanceof File ? URL.createObjectURL(imageData) : imageData,
    };
  } catch (error) {
    console.error('API Detection Error:', error);
    throw error;
  }
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