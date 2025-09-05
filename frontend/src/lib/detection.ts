import { DetectionResult } from "@/types/detection";
import { detectDeepfakeAPI, analyzeWithGemini } from "@/lib/api";

// Helper functions for image conversion
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Detection function - tries ensemble first
export async function detectDeepfake(
  imageData: string | File, 
  config?: { models?: string[] }
): Promise<DetectionResult> {
  const apiUrl = localStorage.getItem('api_base_url') || 'http://localhost:8000';
  try {
    console.log('Attempting ensemble API call to:', apiUrl);
    let result = await detectDeepfakeAPI(imageData, {
      models: config?.models || ['CNN', 'EfficientNet', 'VGG16'],
      returnHeatmaps: true,
      useEnsembleFirst: true
    });

    // Get enhanced analysis from Gemini
    try {
      let imageForGemini: string;
      
      if (imageData instanceof File) {
        // Convert File to base64
        imageForGemini = await fileToBase64(imageData);
      } else if (typeof imageData === 'string' && imageData.startsWith('data:')) {
        // Already a data URL
        imageForGemini = imageData;
      } else {
        // Try to fetch URL and convert to base64
        const response = await fetch(imageData);
        const blob = await response.blob();
        imageForGemini = await blobToBase64(blob);
      }
      
      const geminiAnalysis = await analyzeWithGemini(imageForGemini, result.prediction, result.ensembleConfidence);
      result.geminiAnalysis = geminiAnalysis;
    } catch (geminiError) {
      console.warn('Gemini analysis failed:', geminiError);
      result.geminiAnalysis = "🤖 AI analysis temporarily unavailable due to rate limits. The basic detection results are still accurate.";
    }

    return result;
  } catch (error) {
    console.error('API call failed:', error);
    throw new Error(`Failed to connect to API at ${apiUrl}. Ensure backend is running. Error: ${error}`);
  }
}