import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeatmapViewerProps {
  imageUrl: string;
  heatmapUrl?: string;
}

export function HeatmapViewer({ imageUrl, heatmapUrl }: HeatmapViewerProps) {
  const [showHeatmap, setShowHeatmap] = useState(true);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-muted-foreground">
          Grad-CAM Heatmap
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowHeatmap(!showHeatmap)}
        >
          {showHeatmap ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Hide
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Show
            </>
          )}
        </Button>
      </div>
      
      <div className="relative">
        <img
          src={imageUrl}
          alt="Original"
          className="w-full rounded-lg border border-border"
        />
        {showHeatmap && heatmapUrl && (
          <div
            className="absolute inset-0 rounded-lg opacity-60 mix-blend-hard-light"
            style={{
              backgroundImage: `url(${heatmapUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        )}
        {showHeatmap && !heatmapUrl && (
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-red-500/30 via-yellow-500/30 to-transparent mix-blend-hard-light" />
        )}
      </div>
      
      <p className="text-xs text-muted-foreground mt-2">
        Areas highlighted in red indicate regions the AI focused on for detection
      </p>
    </div>
  );
}