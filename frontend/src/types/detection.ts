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
}