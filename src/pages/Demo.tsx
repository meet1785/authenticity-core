import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DemoUploader } from "@/components/DemoUploader";
import { ConfigPanel } from "@/components/ConfigPanel";
import { DetectionHistory } from "@/components/DetectionHistory";
import { ApiStatus } from "@/components/ApiStatus";
import { Info, Shield, Zap, Settings, History } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DetectionResult } from "@/types/detection";

export default function Demo() {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [detectionHistory, setDetectionHistory] = useState<DetectionResult[]>([]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* API Status Indicator */}
      <ApiStatus />
      
      {/* Configuration Panel */}
      <ConfigPanel isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 relative">
        <div className="absolute inset-0 mesh-gradient opacity-10" />
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-accent/20 rounded-full blur-[120px] animate-pulse-glow" />
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-panel rounded-full mb-6 animate-shimmer">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Live Detection Demo</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-space font-bold mb-6">
              <span className="gradient-text animate-gradient">Test Our AI</span>
              <br />
              <span className="text-foreground">Detection Engine</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Upload an image or provide a URL to experience our deepfake detection in action
            </p>
            
            {/* Config Button */}
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setIsConfigOpen(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configure API
            </Button>
          </div>

          {/* Info Alert */}
          <div className="max-w-6xl mx-auto mb-12">
            <Alert className="glass-panel border-primary/50">
              <Info className="h-4 w-4" />
              <AlertDescription>
                This demo uses mock data for demonstration purposes. Click "Configure API" to connect your own deployment. 
                No images are stored or retained during the demo.
              </AlertDescription>
            </Alert>
          </div>

          {/* Main Demo Area with History */}
          <div className="max-w-6xl mx-auto">
            <Tabs defaultValue="detection" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50 max-w-sm mx-auto mb-8">
                <TabsTrigger value="detection">
                  <Shield className="h-4 w-4 mr-2" />
                  Detection
                </TabsTrigger>
                <TabsTrigger value="history">
                  <History className="h-4 w-4 mr-2" />
                  History
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="detection">
                <DemoUploader />
              </TabsContent>
              
              <TabsContent value="history">
                <DetectionHistory history={detectionHistory} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-space font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our detection pipeline processes images through multiple stages
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Connection Line */}
              <div className="absolute left-8 top-12 bottom-12 w-0.5 bg-gradient-to-b from-primary via-primary to-transparent hidden md:block" />
              
              <div className="space-y-8">
                <div className="flex gap-6 items-start">
                  <div className="relative hidden md:block">
                    <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                      1
                    </div>
                  </div>
                  <div className="flex-1 glass-effect rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-2">Image Preprocessing</h3>
                    <p className="text-muted-foreground">
                      Input images are normalized, resized, and enhanced for optimal model performance
                    </p>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="relative hidden md:block">
                    <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                      2
                    </div>
                  </div>
                  <div className="flex-1 glass-effect rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-2">Ensemble Analysis</h3>
                    <p className="text-muted-foreground">
                      Three specialized AI models analyze the image independently for maximum accuracy
                    </p>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="relative hidden md:block">
                    <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                      3
                    </div>
                  </div>
                  <div className="flex-1 glass-effect rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-2">Consensus Decision</h3>
                    <p className="text-muted-foreground">
                      Results are combined using weighted voting to produce the final classification
                    </p>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="relative hidden md:block">
                    <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                      4
                    </div>
                  </div>
                  <div className="flex-1 glass-effect rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-2">Explainable Results</h3>
                    <p className="text-muted-foreground">
                      Grad-CAM heatmaps highlight the regions that influenced the detection decision
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Notice */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="gradient-border rounded-2xl max-w-4xl mx-auto">
            <div className="bg-card rounded-[calc(1rem-1px)] p-8 text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-4">Your Privacy is Protected</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Demo images are processed in real-time and immediately discarded. 
                We maintain a strict zero-retention policy for all uploaded content. 
                No data is stored, shared, or used for training.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}