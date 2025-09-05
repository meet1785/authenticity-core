export interface ModelPrediction {
  name: string;
  realConfidence: number;
  fakeConfidence: number;
  heatmapUrl?: string; // Individual model heatmap
}

export interface DetectionResult {
  prediction: "Real" | "Fake";
  isDeepfake: boolean;
  ensembleConfidence: number;
  modelPredictions: ModelPrediction[];
  heatmapUrl?: string; // Ensemble heatmap
  cnnHeatmap?: string;
  efficientNetHeatmap?: string;
  vgg16Heatmap?: string;
  timestamp: string;
  imageUrl?: string;
  geminiAnalysis?: string; // Enhanced reasoning from Gemini
}

export interface HistoryItem {
  id: string;
  result: DetectionResult;
  imageData: string; // Base64 encoded image
  filename?: string;
  analysisDate: string;
}