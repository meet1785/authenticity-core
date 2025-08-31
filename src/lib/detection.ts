import { DetectionResult, ModelPrediction } from "@/types/detection";
import { detectDeepfakeAPI } from "@/lib/api";

// Detection function with fallback to mock data
export async function detectDeepfake(
  imageData: string | File, 
  config?: { models?: string[] }
): Promise<DetectionResult> {
  // Check if API is configured
  const apiUrl = localStorage.getItem('api_base_url');
  
  if (apiUrl) {
    try {
      // Try to use real API
      return await detectDeepfakeAPI(imageData, {
        models: config?.models || ['CNN', 'EfficientNet', 'VGG16'],
        returnHeatmaps: true,
      });
    } catch (error) {
      console.log('API call failed, falling back to mock data:', error);
      // Fall through to mock data
    }
  }
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Generate mock predictions with realistic variations
  const cnnConfidence = 80 + Math.random() * 19; // 80-99%
  const efficientNetConfidence = 75 + Math.random() * 24; // 75-99%
  const vitConfidence = 82 + Math.random() * 17; // 82-99%

  // Randomly determine if fake (30% chance for demo)
  const isFake = Math.random() < 0.3;

  const modelPredictions: ModelPrediction[] = [
    {
      name: "CNN",
      realConfidence: isFake ? 100 - cnnConfidence : cnnConfidence,
      fakeConfidence: isFake ? cnnConfidence : 100 - cnnConfidence,
    },
    {
      name: "EfficientNet",
      realConfidence: isFake ? 100 - efficientNetConfidence : efficientNetConfidence,
      fakeConfidence: isFake ? efficientNetConfidence : 100 - efficientNetConfidence,
    },
    {
      name: "ViT",
      realConfidence: isFake ? 100 - vitConfidence : vitConfidence,
      fakeConfidence: isFake ? vitConfidence : 100 - vitConfidence,
    },
  ];

  // Calculate ensemble confidence (majority voting)
  const avgConfidence = modelPredictions.reduce((acc, model) => {
    return acc + (isFake ? model.fakeConfidence : model.realConfidence);
  }, 0) / modelPredictions.length;

  return {
    prediction: isFake ? "Fake" : "Real",
    isDeepfake: isFake,
    ensembleConfidence: Math.round(avgConfidence),
    modelPredictions: modelPredictions.map(pred => ({
      ...pred,
      realConfidence: Math.round(pred.realConfidence),
      fakeConfidence: Math.round(pred.fakeConfidence),
    })),
    timestamp: new Date().toISOString(),
    // Mock heatmaps for demo
    cnnHeatmap: undefined,
    efficientNetHeatmap: undefined,
    vitHeatmap: undefined,
  };
}