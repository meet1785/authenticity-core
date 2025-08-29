import { useState } from "react";
import { Settings, Sliders, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

interface ConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConfigPanel({ isOpen, onClose }: ConfigPanelProps) {
  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [confidenceThreshold, setConfidenceThreshold] = useState([70]);
  const [enableHeatmap, setEnableHeatmap] = useState(true);
  const [batchMode, setBatchMode] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <Card className="relative glass-panel max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border/50 bg-card/90 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Detection Configuration</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          <Tabs defaultValue="api" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50">
              <TabsTrigger value="api">API Settings</TabsTrigger>
              <TabsTrigger value="detection">Detection</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="api" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="api-url">API Endpoint</Label>
                  <Input
                    id="api-url"
                    type="url"
                    placeholder="https://api.authenticitynet.ai/v1"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Connect to your custom deployment or use our cloud API
                  </p>
                </div>

                <div>
                  <Label htmlFor="api-key">API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="ak_live_..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Your authentication key for API access
                  </p>
                </div>

                <div className="p-4 glass-effect rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="status-indicator text-primary" />
                    <span className="text-sm font-medium">Connection Status</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {apiUrl ? "Ready to connect" : "Not configured"}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="detection" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Confidence Threshold</Label>
                    <span className="text-sm text-muted-foreground">
                      {confidenceThreshold[0]}%
                    </span>
                  </div>
                  <Slider
                    value={confidenceThreshold}
                    onValueChange={setConfidenceThreshold}
                    min={50}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Minimum confidence level for positive detection
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 glass-effect rounded-lg">
                  <div>
                    <Label htmlFor="heatmap">Enable Grad-CAM Heatmap</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Visualize AI decision regions
                    </p>
                  </div>
                  <Switch
                    id="heatmap"
                    checked={enableHeatmap}
                    onCheckedChange={setEnableHeatmap}
                  />
                </div>

                <div className="flex items-center justify-between p-4 glass-effect rounded-lg">
                  <div>
                    <Label htmlFor="batch">Batch Processing Mode</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Process multiple images simultaneously
                    </p>
                  </div>
                  <Switch
                    id="batch"
                    checked={batchMode}
                    onCheckedChange={setBatchMode}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="p-4 glass-effect rounded-lg">
                  <h3 className="font-medium mb-3">Model Selection</h3>
                  <div className="space-y-3">
                    {["EfficientNetB0", "VGG16", "Custom CNN"].map((model) => (
                      <label key={model} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-border"
                        />
                        <span className="text-sm">{model}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="p-4 glass-effect rounded-lg">
                  <h3 className="font-medium mb-3">Processing Options</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-border"
                      />
                      <span className="text-sm">GPU Acceleration</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-border"
                      />
                      <span className="text-sm">Image Preprocessing</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-border"
                      />
                      <span className="text-sm">Cache Results</span>
                    </label>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-3 mt-8">
            <Button className="flex-1 bg-gradient-primary">
              Save Configuration
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}