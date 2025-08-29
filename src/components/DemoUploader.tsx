import { useState, useCallback, useRef } from "react";
import { Upload, Link2, Image, Loader2, X, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { HeatmapViewer } from "./HeatmapViewer";
import { DetectionResult } from "@/types/detection";
import { detectDeepfake } from "@/lib/detection";
import { cn } from "@/lib/utils";

export function DemoUploader() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const processImage = useCallback(async (imageSource: string) => {
    setIsProcessing(true);
    setUploadedImage(imageSource);
    
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const detectionResult = await detectDeepfake(imageSource);
      setResult(detectionResult);
      
      toast({
        title: "Analysis Complete",
        description: `Image classified as ${detectionResult.prediction}`,
        variant: detectionResult.isDeepfake ? "destructive" : "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

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
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        processImage(imageData);
      };
      reader.readAsDataURL(file);
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
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        processImage(imageData);
      };
      reader.readAsDataURL(file);
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
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted">
              <TabsTrigger value="upload">Upload Image</TabsTrigger>
              <TabsTrigger value="url">Image URL</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="mt-6">
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Uploaded Image */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      Analyzed Image
                    </h4>
                    <img
                      src={uploadedImage}
                      alt="Uploaded"
                      className="w-full rounded-lg border border-border"
                    />
                  </div>
                  
                  {/* Heatmap */}
                  <HeatmapViewer
                    imageUrl={uploadedImage}
                    heatmapUrl={result.heatmapUrl}
                  />
                </div>
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
                  <p className="text-muted-foreground">
                    Confidence: {result.ensembleConfidence}%
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {result.modelPredictions.map((model) => (
                    <div
                      key={model.name}
                      className="glass-effect rounded-lg p-4"
                    >
                      <h4 className="font-medium mb-2">{model.name}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Real</span>
                          <span>{model.realConfidence}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${model.realConfidence}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Fake</span>
                          <span>{model.fakeConfidence}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-destructive h-2 rounded-full transition-all"
                            style={{ width: `${model.fakeConfidence}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
}