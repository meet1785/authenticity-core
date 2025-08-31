import { useState, useEffect } from "react";
import { Settings, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateAPIConfig, testAPIConnection } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConfigPanel({ isOpen, onClose }: ConfigPanelProps) {
  const { toast } = useToast();
  const [apiUrl, setApiUrl] = useState(localStorage.getItem('api_base_url') || '');
  const [apiKey, setApiKey] = useState(localStorage.getItem('api_key') || '');
  const [apiType, setApiType] = useState<'fastapi' | 'custom'>('fastapi');
  const [confidenceThreshold, setConfidenceThreshold] = useState([70]);
  const [enableHeatmap, setEnableHeatmap] = useState(true);
  const [batchMode, setBatchMode] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'connected' | 'error'>('idle');
  const [selectedModels, setSelectedModels] = useState(['CNN', 'EfficientNet', 'ViT']);

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
                  <Label htmlFor="api-type">API Type</Label>
                  <Select value={apiType} onValueChange={(value: 'fastapi' | 'custom') => setApiType(value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fastapi">FastAPI (Recommended)</SelectItem>
                      <SelectItem value="custom">Custom Endpoint</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="api-url">
                    {apiType === 'fastapi' ? 'FastAPI Base URL' : 'API Endpoint'}
                  </Label>
                  <Input
                    id="api-url"
                    type="url"
                    placeholder={apiType === 'fastapi' ? "http://localhost:8000" : "https://api.example.com/detect"}
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {apiType === 'fastapi' 
                      ? 'Your FastAPI server URL (e.g., http://localhost:8000 or https://your-api.com)'
                      : 'Custom API endpoint for detection'}
                  </p>
                </div>

                <div>
                  <Label htmlFor="api-key">API Key (Optional)</Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="your-api-key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Authentication key if required by your API
                  </p>
                </div>

                <div className="p-4 glass-effect rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {connectionStatus === 'idle' && <div className="status-indicator bg-muted" />}
                      {connectionStatus === 'testing' && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
                      {connectionStatus === 'connected' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {connectionStatus === 'error' && <AlertCircle className="h-4 w-4 text-destructive" />}
                      <span className="text-sm font-medium">Connection Status</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        if (!apiUrl) {
                          toast({
                            title: "Missing URL",
                            description: "Please enter an API URL first",
                            variant: "destructive",
                          });
                          return;
                        }
                        setConnectionStatus('testing');
                        updateAPIConfig(apiUrl, apiKey);
                        const connected = await testAPIConnection();
                        setConnectionStatus(connected ? 'connected' : 'error');
                        toast({
                          title: connected ? "Connected" : "Connection Failed",
                          description: connected 
                            ? "Successfully connected to API" 
                            : "Could not connect to API. Please check the URL and try again.",
                          variant: connected ? "default" : "destructive",
                        });
                      }}
                      disabled={connectionStatus === 'testing'}
                    >
                      Test Connection
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {connectionStatus === 'idle' && 'Click "Test Connection" to verify API'}
                    {connectionStatus === 'testing' && 'Testing connection...'}
                    {connectionStatus === 'connected' && 'API is reachable and ready'}
                    {connectionStatus === 'error' && 'Failed to connect. Check URL and network'}
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
                    {["CNN", "EfficientNet", "VGG16"].map((model) => (
                      <label key={model} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedModels.includes(model)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedModels([...selectedModels, model]);
                            } else {
                              setSelectedModels(selectedModels.filter(m => m !== model));
                            }
                          }}
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
            <Button 
              className="flex-1 bg-gradient-primary"
              onClick={() => {
                updateAPIConfig(apiUrl, apiKey);
                localStorage.setItem('confidence_threshold', String(confidenceThreshold[0]));
                localStorage.setItem('enable_heatmap', String(enableHeatmap));
                localStorage.setItem('selected_models', JSON.stringify(selectedModels));
                toast({
                  title: "Configuration Saved",
                  description: "Your settings have been saved successfully",
                });
                onClose();
              }}
            >
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