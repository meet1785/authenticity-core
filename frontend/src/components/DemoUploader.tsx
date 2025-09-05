import { useState, useCallback, useRef, useEffect } from "react";
import { Upload, Link2, Image, Loader2, X, FileImage, Brain, History as HistoryIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { HeatmapViewer } from "./HeatmapViewer";
import { MultiModelHeatmap } from "./MultiModelHeatmap";
import { DetectionHistory } from "./DetectionHistory";
import { DetectionResult, HistoryItem } from "@/types/detection";
import { detectDeepfake } from "@/lib/detection";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export function DemoUploader() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedModels, setSelectedModels] = useState<string[]>(['CNN', 'EfficientNet', 'VGG16']);
  const [activeTab, setActiveTab] = useState("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Set default Gemini API key if not set
  useEffect(() => {
    if (!localStorage.getItem('gemini_api_key')) {
      localStorage.setItem('gemini_api_key', 'AIzaSyC4xAN7n2EalbUwGZ-1Ah1Zq0xAg1xxKNE');
    }
  }, []);

  // Save result to history
  const saveToHistory = useCallback(async (detectionResult: DetectionResult, imageData: string | File) => {
    try {
      let imageBase64 = '';
      let filename = '';

      if (typeof imageData === 'string') {
        // URL - fetch and convert to base64
        const response = await fetch(imageData);
        const blob = await response.blob();
        imageBase64 = await blobToBase64(blob);
        filename = 'URL Image';
      } else {
        // File - convert to base64
        imageBase64 = await blobToBase64(imageData);
        filename = imageData.name;
      }

      const historyItem: HistoryItem = {
        id: Date.now().toString(),
        result: detectionResult,
        imageData: imageBase64,
        filename,
        analysisDate: new Date().toISOString(),
      };

      const existingHistory = JSON.parse(localStorage.getItem('detection_history') || '[]');
      const updatedHistory = [historyItem, ...existingHistory].slice(0, 50); // Keep last 50 items
      localStorage.setItem('detection_history', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Failed to save to history:', error);
    }
  }, []);

  // Convert blob to base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Handle viewing history item
  const handleViewHistoryItem = useCallback((item: HistoryItem) => {
    setResult(item.result);
    setUploadedImage(item.imageData);
    setActiveTab("results");
    toast({
      title: "History Loaded",
      description: "Previous analysis result has been loaded.",
    });
  }, [toast]);

  const processImage = useCallback(async (imageSource: string | File) => {
    setIsProcessing(true);
    if (typeof imageSource === 'string') {
      setUploadedImage(imageSource);
    } else {
      setUploadedImage(URL.createObjectURL(imageSource));
      setUploadedFile(imageSource);
    }
    
    try {
      const detectionResult = await detectDeepfake(imageSource, {
        models: selectedModels
      });
      setResult(detectionResult);
      
      // Save to history
      await saveToHistory(detectionResult, imageSource);
      
      toast({
        title: "Analysis Complete",
        description: `Image classified as ${detectionResult.prediction} with ${detectionResult.ensembleConfidence}% ensemble confidence`,
        variant: detectionResult.isDeepfake ? "destructive" : "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process image. Please check your API configuration.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [toast, selectedModels]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid File",
          description: "Please upload an image file.",
          variant: "destructive",
        });
        return;
      }
      
      // Process file directly for multipart form data
      processImage(file);
    }
  }, [processImage, toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      // Process file directly for multipart form data
      processImage(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please drop an image file.",
        variant: "destructive",
      });
    }
  }, [processImage, toast]);

  const handleUrlSubmit = useCallback(() => {
    if (!imageUrl.trim()) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid image URL.",
        variant: "destructive",
      });
      return;
    }
    processImage(imageUrl);
  }, [imageUrl, processImage, toast]);

  const resetDemo = () => {
    setUploadedImage(null);
    setResult(null);
    setImageUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {!uploadedImage ? (
        <Card className="glass-effect border-border/50 p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted">
              <TabsTrigger value="upload">Upload Image</TabsTrigger>
              <TabsTrigger value="url">Image URL</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="mt-6 space-y-4">
              {/* Model Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Select Models to Run
                </Label>
                <div className="flex flex-wrap gap-4">
                  {['CNN', 'EfficientNet', 'VGG16'].map((model) => (
                    <div key={model} className="flex items-center space-x-2">
                      <Checkbox
                        id={model}
                        checked={selectedModels.includes(model)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedModels([...selectedModels, model]);
                          } else {
                            setSelectedModels(selectedModels.filter(m => m !== model));
                          }
                        }}
                        disabled={isProcessing}
                      />
                      <Label
                        htmlFor={model}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {model}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* API Settings */}
              <div className="space-y-3 border-t pt-4">
                <Label className="text-sm font-medium">API Configuration</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="api-url" className="text-xs text-muted-foreground">
                      Backend API URL
                    </Label>
                    <Input
                      id="api-url"
                      type="url"
                      placeholder="http://localhost:8000"
                      defaultValue={localStorage.getItem('api_base_url') || ''}
                      onChange={(e) => localStorage.setItem('api_base_url', e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gemini-key" className="text-xs text-muted-foreground">
                      Gemini API Key (Optional)
                    </Label>
                    <Input
                      id="gemini-key"
                      type="password"
                      placeholder="Enter your Gemini API key"
                      defaultValue={localStorage.getItem('gemini_api_key') || ''}
                      onChange={(e) => localStorage.setItem('gemini_api_key', e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Configure your API endpoints. Gemini key enables enhanced AI-powered analysis.
                </p>
              </div>
              
              <div className="flex flex-col items-center justify-center">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    "relative w-full h-64 border-2 border-dashed rounded-lg transition-all",
                    isDragging
                      ? "border-primary bg-primary/10 scale-105"
                      : "border-border/50 hover:border-primary/50"
                  )}
                >
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center justify-center w-full h-full"
                  >
                    {isDragging ? (
                      <>
                        <FileImage className="h-12 w-12 text-primary mb-4 animate-pulse" />
                        <p className="text-primary font-medium">Drop your image here</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors mb-4" />
                        <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isProcessing}
                    />
                  </label>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="url" className="mt-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-full flex items-center space-x-2">
                  <Input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    disabled={isProcessing}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleUrlSubmit}
                    disabled={isProcessing || !imageUrl}
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Link2 className="h-4 w-4" />
                    )}
                    Analyze
                  </Button>
                </div>
                <div className="flex items-center justify-center w-full h-48 border-2 border-dashed border-border/50 rounded-lg">
                  <Image className="h-12 w-12 text-muted-foreground" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <DetectionHistory onViewResult={handleViewHistoryItem} />
            </TabsContent>
          </Tabs>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Processing Indicator */}
          {isProcessing && (
            <Card className="glass-effect border-border/50 p-8">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <p className="text-lg font-medium">Analyzing image...</p>
                <p className="text-sm text-muted-foreground">
                  Running ensemble AI models for deepfake detection
                </p>
              </div>
            </Card>
          )}

          {/* Results */}
          {result && !isProcessing && (
            <>
              <Card className="glass-effect border-border/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Detection Results</h3>
                  <Button variant="outline" onClick={resetDemo}>
                    New Analysis
                  </Button>
                </div>
                
                {/* Multi-Model Heatmap Visualization */}
                <MultiModelHeatmap
                  originalImage={uploadedImage}
                  cnnHeatmap={result.cnnHeatmap}
                  efficientNetHeatmap={result.efficientNetHeatmap}
                  vgg16Heatmap={result.vgg16Heatmap}
                  ensembleHeatmap={result.heatmapUrl}
                  modelHeatmaps={result.modelPredictions
                    .filter(m => m.heatmapUrl)
                    .map(m => ({ name: m.name, url: m.heatmapUrl! }))}
                />
              </Card>

              <Card className={`glass-effect border-2 ${
                result.isDeepfake ? 'border-destructive' : 'border-primary'
              } p-6`}>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">
                    <span className={result.isDeepfake ? 'text-destructive' : 'gradient-text'}>
                      {result.prediction}
                    </span>
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Ensemble Confidence: {result.ensembleConfidence}%
                  </p>
                  
                  {/* Reasoning Section */}
                  <div className="bg-muted/50 rounded-lg p-4 text-left">
                    <h4 className="font-semibold mb-3 text-center">Analysis Reasoning</h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p>
                          <strong>Ensemble Decision:</strong> The image has been analyzed by multiple AI models 
                          (CNN, EfficientNet, VGG16) working together to provide a comprehensive assessment.
                        </p>
                        <p>
                          <strong>Confidence Level:</strong> {result.ensembleConfidence}% confidence in the 
                          {result.prediction.toLowerCase()} classification, based on consensus across all models.
                        </p>
                        <p>
                          <strong>Method:</strong> Multiple deep learning architectures were employed to detect 
                          potential manipulation patterns, artifacts, or inconsistencies that may indicate 
                          synthetic generation.
                        </p>
                        <p>
                          <strong>Recommendation:</strong> {result.isDeepfake 
                            ? "This image shows characteristics consistent with AI-generated or manipulated content. Further verification recommended."
                            : "This image appears authentic based on current analysis. No significant manipulation indicators detected."
                          }
                        </p>
                      </div>
                      
                      {/* Gemini Enhanced Analysis */}
                      {result.geminiAnalysis && (
                        <div className="border-t pt-3 mt-3">
                          <h5 className="font-medium mb-2 text-primary">🤖 AI-Powered Detailed Analysis</h5>
                          <div className="text-xs text-muted-foreground whitespace-pre-line">
                            {result.geminiAnalysis}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
}