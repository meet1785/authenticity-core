import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Eye, Layers } from "lucide-react";

interface MultiModelHeatmapProps {
  originalImage: string;
  xceptNetHeatmap?: string;
  supConHeatmap?: string;
  ensembleHeatmap?: string;
  modelHeatmaps?: { name: string; url: string }[];
}

export function MultiModelHeatmap({
  originalImage,
  xceptNetHeatmap,
  supConHeatmap,
  ensembleHeatmap,
  modelHeatmaps = [],
}: MultiModelHeatmapProps) {
  const [opacity, setOpacity] = useState(60);

  const HeatmapOverlay = ({ heatmapUrl }: { heatmapUrl?: string }) => {
    if (!heatmapUrl) {
      return (
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/20 via-accent/20 to-transparent mix-blend-hard-light" />
      );
    }
    
    return (
      <div
        className="absolute inset-0 rounded-lg mix-blend-hard-light"
        style={{
          backgroundImage: `url(${heatmapUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: opacity / 100,
        }}
      />
    );
  };

  return (
    <div className="space-y-6">
      {/* Opacity Control */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Heatmap Intensity:</label>
        <input
          type="range"
          min="0"
          max="100"
          value={opacity}
          onChange={(e) => setOpacity(Number(e.target.value))}
          className="flex-1"
        />
        <span className="text-sm text-muted-foreground w-12">{opacity}%</span>
      </div>

      {/* Main Model Comparisons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* XceptNet */}
        <Card className="overflow-hidden">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="h-4 w-4 text-primary" />
              <h4 className="font-semibold">XceptNet</h4>
              <Badge variant="outline" className="ml-auto">Advanced</Badge>
            </div>
            <div className="relative aspect-square">
              <img
                src={originalImage}
                alt="XceptNet Analysis"
                className="w-full h-full object-cover rounded-lg"
              />
              <HeatmapOverlay heatmapUrl={xceptNetHeatmap} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Deep feature extraction model
            </p>
          </div>
        </Card>

        {/* SupCon */}
        <Card className="overflow-hidden">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="h-4 w-4 text-accent" />
              <h4 className="font-semibold">SupCon</h4>
              <Badge variant="outline" className="ml-auto">Contrastive</Badge>
            </div>
            <div className="relative aspect-square">
              <img
                src={originalImage}
                alt="SupCon Analysis"
                className="w-full h-full object-cover rounded-lg"
              />
              <HeatmapOverlay heatmapUrl={supConHeatmap} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Supervised contrastive learning
            </p>
          </div>
        </Card>

        {/* Ensemble */}
        <Card className="overflow-hidden border-primary/50">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="h-4 w-4 text-primary" />
              <h4 className="font-semibold">Ensemble</h4>
              <Badge className="ml-auto">Combined</Badge>
            </div>
            <div className="relative aspect-square">
              <img
                src={originalImage}
                alt="Ensemble Analysis"
                className="w-full h-full object-cover rounded-lg"
              />
              <HeatmapOverlay heatmapUrl={ensembleHeatmap} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Consensus from all models
            </p>
          </div>
        </Card>
      </div>

      {/* Additional Model Heatmaps if available */}
      {modelHeatmaps.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-3">Individual Model Analysis</h4>
          <Tabs defaultValue={modelHeatmaps[0]?.name} className="w-full">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              {modelHeatmaps.map((model) => (
                <TabsTrigger key={model.name} value={model.name}>
                  {model.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {modelHeatmaps.map((model) => (
              <TabsContent key={model.name} value={model.name}>
                <div className="relative aspect-video max-w-2xl mx-auto">
                  <img
                    src={originalImage}
                    alt={`${model.name} Analysis`}
                    className="w-full h-full object-contain rounded-lg border border-border"
                  />
                  <HeatmapOverlay heatmapUrl={model.url} />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}

      {/* Interpretation Guide */}
      <Card className="p-4 bg-muted/50">
        <h4 className="text-sm font-semibold mb-2">Heatmap Interpretation</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground">
          <div>
            <span className="inline-block w-3 h-3 bg-red-500 rounded-sm mr-2" />
            <span>High attention areas - strongest detection signals</span>
          </div>
          <div>
            <span className="inline-block w-3 h-3 bg-yellow-500 rounded-sm mr-2" />
            <span>Medium attention - moderate importance</span>
          </div>
          <div>
            <span className="inline-block w-3 h-3 bg-blue-500 rounded-sm mr-2" />
            <span>Low attention - minimal contribution</span>
          </div>
        </div>
      </Card>
    </div>
  );
}