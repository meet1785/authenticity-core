import { Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DetectionResult } from "@/types/detection";

interface DetectionHistoryProps {
  history: DetectionResult[];
}

export function DetectionHistory({ history }: DetectionHistoryProps) {
  if (history.length === 0) {
    return (
      <Card className="glass-effect border-border/50 p-8 text-center">
        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Detection History</h3>
        <p className="text-sm text-muted-foreground">
          Your detection results will appear here
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Recent Detections</h3>
      <div className="space-y-3">
        {history.map((item, index) => (
          <Card
            key={index}
            className="glass-effect border-border/50 p-4 hover:border-primary/50 transition-colors hover-lift"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {item.isDeepfake ? (
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-primary" />
                )}
                <div>
                  <div className="font-medium">
                    {item.prediction}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Confidence: {item.ensembleConfidence}%
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(item.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}