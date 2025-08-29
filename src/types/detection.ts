export interface ModelPrediction {
  name: string;
  realConfidence: number;
  fakeConfidence: number;
}

export interface DetectionResult {
  prediction: "Real" | "Fake";
  isDeepfake: boolean;
  ensembleConfidence: number;
  modelPredictions: ModelPrediction[];
  heatmapUrl?: string;
  timestamp: string;
}