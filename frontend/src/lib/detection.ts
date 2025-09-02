import { DetectionResult } from "@/types/detection";
import { detectDeepfakeAPI } from "@/lib/api";

// Detection function - always use real API
export async function detectDeepfake(
  imageData: string | File, 
  config?: { models?: string[] }
): Promise<DetectionResult> {
  // Always try to use real API first
  const apiUrl = localStorage.getItem('api_base_url') || 'http://localhost:8000';
  
  try {
    console.log('Attempting API call to:', apiUrl);
    // Try to use real API
    return await detectDeepfakeAPI(imageData, {
      models: config?.models || ['CNN', 'EfficientNet', 'VGG16'],
      returnHeatmaps: true,
    });
  } catch (error) {
    console.error('API call failed:', error);
    // Re-throw the error instead of falling back to mock data
    throw new Error(`Failed to connect to API at ${apiUrl}. Please check if the backend is running and the API URL is correct. Error: ${error}`);
  }
}