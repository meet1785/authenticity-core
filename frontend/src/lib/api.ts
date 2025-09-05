import axios from 'axios';
import { DetectionResult } from '@/types/detection';

// FastAPI backend configuration (fallback to local dev URL if not set yet)
const API_BASE_URL = localStorage.getItem('api_base_url') || '';
const API_KEY = localStorage.getItem('api_key') || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    ...(API_KEY && { 'X-API-Key': API_KEY })
  },
  timeout: 30000, // 30 seconds for model inference
});

// Gemini API configuration
const GEMINI_API_KEY = localStorage.getItem('gemini_api_key') || 'AIzaSyC4xAN7n2EalbUwGZ-1Ah1Zq0xAg1xxKNE';
const GEMINI_MODELS = [
  'gemini-1.5-flash', // Test with known working model first
  'gemini-2.5-flash', // Latest and fastest
  'gemini-2.5-pro',   // Latest pro version
  'gemini-2.0-flash', // Previous generation
  'gemini-1.5-pro'    // Final fallback
];

// Rate limiting for Gemini API
let lastGeminiCall = 0;
const GEMINI_RATE_LIMIT_MS = 5000; // 5 seconds between calls

function getGeminiUrl(model: string) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

export interface ModelPredictionResponse {
  model: string;
  predicted_class: number; // 0 for real, 1+ for fake
  probabilities: number[]; // [real_prob, fake_prob, ...]
  heatmap?: string; // Base64 encoded heatmap if available
  probability?: number; // fake probability convenience
  stub?: boolean;
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

// NEW: Ensemble endpoint usage
export async function detectWithEnsemble(
  imageFile: File,
  options?: { threshold?: number; includeHeatmaps?: boolean }
): Promise<DetectionResult> {
  const formData = new FormData();
  formData.append('file', imageFile);
  if (options?.threshold) formData.append('threshold', String(options.threshold));
  if (options?.includeHeatmaps === false) formData.append('include_heatmaps', 'false');

  const response = await api.post<any>(`/predict/ensemble`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  const data = response.data;
  const models = data.models as ModelPredictionResponse[];

  const detection: DetectionResult = {
    prediction: data.ensemble.majority_label === 'fake' ? 'Fake' : 'Real',
    isDeepfake: data.ensemble.majority_class === 1,
    ensembleConfidence: Math.round((data.ensemble.ensemble_confidence || 0.5) * 100),
    modelPredictions: models.filter(m => m.probabilities).map(m => ({
      name: m.model.toUpperCase().replace('EFFNET', 'EfficientNet').replace('VGG', 'VGG16'),
      realConfidence: Math.round(((m.probabilities[0] ?? (1 - (m.probability ?? 0.5))) * 100)),
      fakeConfidence: Math.round(((m.probabilities[1] ?? (m.probability ?? 0.5)) * 100)),
      heatmapUrl: m.heatmap ? `data:image/jpeg;base64,${m.heatmap}` : undefined,
    })),
    heatmapUrl: models.find(m => m.heatmap)?.heatmap ? `data:image/jpeg;base64,${models.find(m => m.heatmap)!.heatmap}` : undefined,
    cnnHeatmap: models.find(m => m.model === 'cnn')?.heatmap ? `data:image/jpeg;base64,${models.find(m => m.model === 'cnn')!.heatmap}` : undefined,
    efficientNetHeatmap: models.find(m => m.model === 'effnet')?.heatmap ? `data:image/jpeg;base64,${models.find(m => m.model === 'effnet')!.heatmap}` : undefined,
    vgg16Heatmap: models.find(m => m.model === 'vgg')?.heatmap ? `data:image/jpeg;base64,${models.find(m => m.model === 'vgg')!.heatmap}` : undefined,
    timestamp: new Date().toISOString(),
    imageUrl: URL.createObjectURL(imageFile),
  };

  return detection;
}

export async function detectDeepfakeAPI(
  imageData: string | File,
  config?: { models?: string[]; returnHeatmaps?: boolean; useEnsembleFirst?: boolean }
): Promise<DetectionResult> {
  try {
    let file: File;
    if (imageData instanceof File) {
      file = imageData;
    } else {
      const response = await fetch(imageData);
      const blob = await response.blob();
      file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
    }

    // Try ensemble endpoint first if requested
    if (config?.useEnsembleFirst !== false) {
      try {
        return await detectWithEnsemble(file, { includeHeatmaps: config?.returnHeatmaps !== false });
      } catch (e) {
        console.warn('Ensemble endpoint failed, falling back to individual models:', e);
      }
    }

    const modelsToUse = config?.models?.map(m => 
      m.toLowerCase().replace('efficientnet', 'effnet')
    ) as ModelType[] || ['cnn', 'effnet', 'vgg'];

    const predictions = await Promise.all(
      modelsToUse.map(model => detectWithModel(file, model))
    );

    const fakeVotes = predictions.filter(p => p.predicted_class > 0).length;
    const isDeepfake = fakeVotes > predictions.length / 2;
    const avgFakeProb = predictions.reduce((acc, p) => {
      const fakeProb = p.probabilities[1] || 0;
      return acc + fakeProb;
    }, 0) / predictions.length;

    return {
      prediction: isDeepfake ? 'Fake' : 'Real',
      isDeepfake,
      ensembleConfidence: Math.round(avgFakeProb * 100),
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
      vgg16Heatmap: predictions.find(p => p.model === 'vgg')?.heatmap ? 
        `data:image/png;base64,${predictions.find(p => p.model === 'vgg')!.heatmap}` : undefined,
      timestamp: new Date().toISOString(),
      imageUrl: imageData instanceof File ? URL.createObjectURL(imageData) : imageData,
    };
  } catch (error) {
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

// Gemini AI analysis for enhanced reasoning
export async function analyzeWithGemini(
  imageData: string,
  prediction: string,
  confidence: number
): Promise<string> {
  if (!GEMINI_API_KEY) {
    return "Gemini API key not configured. Enhanced analysis unavailable.";
  }

  // Rate limiting check
  const now = Date.now();
  const timeSinceLastCall = now - lastGeminiCall;
  if (timeSinceLastCall < GEMINI_RATE_LIMIT_MS) {
    const waitTime = GEMINI_RATE_LIMIT_MS - timeSinceLastCall;
    console.log(`Rate limiting Gemini API call. Waiting ${waitTime}ms...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  lastGeminiCall = Date.now();

  // Try each model in order
  for (const model of GEMINI_MODELS) {
    const maxRetries = 2;
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const prompt = `Analyze this image for potential deepfake characteristics. The AI model has classified it as: ${prediction} with ${confidence}% confidence.

Please provide a brief analysis of visual indicators that support or contradict this classification.`;

        // Debug: Check image data format
        const imageBase64 = imageData.split(',')[1];
        console.log('Image data length:', imageBase64?.length);
        console.log('Image data starts with:', imageBase64?.substring(0, 50));

        const response = await axios.post(
          `${getGeminiUrl(model)}?key=${GEMINI_API_KEY}`,
          {
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inline_data: {
                      mime_type: "image/jpeg",
                      data: imageBase64
                    }
                  }
                ]
              }
            ]
          },
          {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 30000 // 30 second timeout
          }
        );

        if (response.data.candidates && response.data.candidates[0]) {
          return response.data.candidates[0].content.parts[0].text;
        }

        return "Unable to generate enhanced analysis.";
      } catch (error: any) {
        lastError = error;
        console.error(`Gemini API error (${model}, attempt ${attempt}/${maxRetries}):`, error);

        // Check if it's a rate limit error (429)
        if (error.response?.status === 429) {
          if (attempt < maxRetries) {
            // Exponential backoff: wait 2^attempt seconds
            const waitTime = Math.pow(2, attempt) * 1000;
            console.log(`Rate limited. Retrying in ${waitTime/1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          } else {
            // Try next model instead of giving up
            break;
          }
        }

        // Check for other API errors
        if (error.response?.status === 400) {
          console.log(`Model ${model} returned 400 error, trying next model...`);
          break; // Try next model
        }

        if (error.response?.status === 403) {
          console.log(`Model ${model} access denied, trying next model...`);
          break; // Try next model
        }

        // For other errors, retry if we have attempts left
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
          continue;
        }

        // Try next model
        break;
      }
    }
  }

  // If all models and retries failed
  return "Failed to generate enhanced analysis with all available Gemini models. Please check your API key and try again later.";
}