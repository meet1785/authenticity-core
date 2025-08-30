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
  xceptNetHeatmap?: string;
  supConHeatmap?: string;
  timestamp: string;
  imageUrl?: string;
}