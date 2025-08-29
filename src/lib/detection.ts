import { DetectionResult, ModelPrediction } from "@/types/detection";

// Mock detection function for demo purposes
export async function detectDeepfake(imageUrl: string): Promise<DetectionResult> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Generate mock predictions with realistic variations
  const efficientNetConfidence = 75 + Math.random() * 24; // 75-99%
  const vgg16Confidence = 70 + Math.random() * 29; // 70-99%
  const customCnnConfidence = 80 + Math.random() * 19; // 80-99%

  // Randomly determine if fake (30% chance for demo)
  const isFake = Math.random() < 0.3;

  const modelPredictions: ModelPrediction[] = [
    {
      name: "EfficientNetB0",
      realConfidence: isFake ? 100 - efficientNetConfidence : efficientNetConfidence,
      fakeConfidence: isFake ? efficientNetConfidence : 100 - efficientNetConfidence,
    },
    {
      name: "VGG16",
      realConfidence: isFake ? 100 - vgg16Confidence : vgg16Confidence,
      fakeConfidence: isFake ? vgg16Confidence : 100 - vgg16Confidence,
    },
    {
      name: "Custom CNN",
      realConfidence: isFake ? 100 - customCnnConfidence : customCnnConfidence,
      fakeConfidence: isFake ? customCnnConfidence : 100 - customCnnConfidence,
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
  };
}