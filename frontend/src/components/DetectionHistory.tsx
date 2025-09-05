import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, Trash2, Eye, Download, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { HistoryItem } from "@/types/detection";
import { useToast } from "@/hooks/use-toast";

interface DetectionHistoryProps {
  onViewResult: (item: HistoryItem) => void;
}

export function DetectionHistory({ onViewResult }: DetectionHistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    try {
      const saved = localStorage.getItem('detection_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        setHistory(parsed);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const saveHistory = (newHistory: HistoryItem[]) => {
    try {
      localStorage.setItem('detection_history', JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (error) {
      console.error('Failed to save history:', error);
      toast({
        title: "Storage Error",
        description: "Failed to save analysis to history.",
        variant: "destructive",
      });
    }
  };

  const clearHistory = () => {
    localStorage.removeItem('detection_history');
    setHistory([]);
    toast({
      title: "History Cleared",
      description: "All analysis history has been removed.",
    });
  };

  const deleteItem = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    saveHistory(newHistory);
    toast({
      title: "Item Deleted",
      description: "Analysis removed from history.",
    });
  };

  const exportHistory = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `authenticity-analysis-history-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast({
      title: "History Exported",
      description: "Analysis history has been downloaded.",
    });
  };

  if (history.length === 0) {
    return (
      <Card className="glass-effect border-border/50 p-8">
        <div className="text-center">
          <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Analysis History</h3>
          <p className="text-muted-foreground">
            Your previous image analyses will appear here.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-effect border-border/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <History className="h-5 w-5" />
          Analysis History
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportHistory}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={clearHistory}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {history.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <img
                src={item.imageData}
                alt="Analyzed image"
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={item.result.isDeepfake ? "destructive" : "default"}>
                    {item.result.prediction}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {item.result.ensembleConfidence}% confidence
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(item.analysisDate).toLocaleString()}
                </p>
                {item.filename && (
                  <p className="text-xs text-muted-foreground">
                    {item.filename}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewResult(item)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteItem(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}