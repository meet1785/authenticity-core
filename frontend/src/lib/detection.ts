import { DetectionResult } from "@/types/detection";
import { detectDeepfakeAPI } from "@/lib/api";

// Detection function - tries ensemble first
export async function detectDeepfake(
  imageData: string | File, 
  config?: { models?: string[] }
): Promise<DetectionResult> {
  const apiUrl = localStorage.getItem('api_base_url') || 'http://localhost:8000';
  try {
    console.log('Attempting ensemble API call to:', apiUrl);
    return await detectDeepfakeAPI(imageData, {
      models: config?.models || ['CNN', 'EfficientNet', 'VGG16'],
      returnHeatmaps: true,
      useEnsembleFirst: true
    });
  } catch (error) {
    console.error('API call failed:', error);
    throw new Error(`Failed to connect to API at ${apiUrl}. Ensure backend is running. Error: ${error}`);
  }
}