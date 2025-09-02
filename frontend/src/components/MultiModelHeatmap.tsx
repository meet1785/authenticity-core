import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Eye, Layers } from "lucide-react";

interface MultiModelHeatmapProps {
  originalImage: string;
  cnnHeatmap?: string;
  efficientNetHeatmap?: string;
  vgg16Heatmap?: string;
  ensembleHeatmap?: string;
  modelHeatmaps?: { name: string; url: string }[];
}

export function MultiModelHeatmap({
  originalImage,
  cnnHeatmap,
  efficientNetHeatmap,
  vgg16Heatmap,
  ensembleHeatmap,
  modelHeatmaps = [],
}: MultiModelHeatmapProps) {
  const [opacity, setOpacity] = useState(75);

  const HeatmapOverlay = ({ heatmapUrl }: { heatmapUrl?: string }) => {
    if (!heatmapUrl) {
      return (
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-red-500/30 via-yellow-500/20 to-transparent mix-blend-multiply" />
      );
    }
    
    return (
      <div
        className="absolute inset-0 rounded-lg mix-blend-overlay"
        style={{
          backgroundImage: `url(${heatmapUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: opacity / 100,
          filter: 'contrast(1.8) brightness(1.4) saturate(1.3)',
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
        {/* CNN */}
        <Card className="overflow-hidden">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="h-4 w-4 text-primary" />
              <h4 className="font-semibold">CNN</h4>
              <Badge variant="outline" className="ml-auto">Custom</Badge>
            </div>
            <div className="relative aspect-square">
              <img
                src={originalImage}
                alt="CNN Analysis"
                className="w-full h-full object-cover rounded-lg"
              />
              <HeatmapOverlay heatmapUrl={cnnHeatmap} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Custom convolutional neural network
            </p>
          </div>
        </Card>

        {/* EfficientNet */}
        <Card className="overflow-hidden">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="h-4 w-4 text-accent" />
              <h4 className="font-semibold">EfficientNet</h4>
              <Badge variant="outline" className="ml-auto">Efficient</Badge>
            </div>
            <div className="relative aspect-square">
              <img
                src={originalImage}
                alt="EfficientNet Analysis"
                className="w-full h-full object-cover rounded-lg"
              />
              <HeatmapOverlay heatmapUrl={efficientNetHeatmap} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Efficient deep learning architecture
            </p>
          </div>
        </Card>

        {/* VGG16 */}
        <Card className="overflow-hidden">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="h-4 w-4 text-secondary" />
              <h4 className="font-semibold">VGG16</h4>
              <Badge variant="outline" className="ml-auto">Deep CNN</Badge>
            </div>
            <div className="relative aspect-square">
              <img
                src={originalImage}
                alt="VGG16 Analysis"
                className="w-full h-full object-cover rounded-lg"
              />
              <HeatmapOverlay heatmapUrl={vgg16Heatmap} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              VGG16 deep convolutional network
            </p>
          </div>
        </Card>
      </div>

      {/* Ensemble Result */}
      <Card className="overflow-hidden border-primary/50">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="h-4 w-4 text-primary" />
            <h4 className="font-semibold text-lg">Ensemble Result</h4>
            <Badge className="ml-auto">Combined Analysis</Badge>
          </div>
          <div className="relative aspect-video">
            <img
              src={originalImage}
              alt="Ensemble Analysis"
              className="w-full h-full object-contain rounded-lg"
            />
            <HeatmapOverlay heatmapUrl={ensembleHeatmap} />
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Consensus from CNN, EfficientNet, and VGG16 models
          </p>
        </div>
      </Card>

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