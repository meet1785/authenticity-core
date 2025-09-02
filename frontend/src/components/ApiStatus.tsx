import { Shield, Activity, Database, Cpu } from "lucide-react";
import { useEffect, useState } from "react";
import { testAPIConnection } from "@/lib/api";

export function ApiStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      const startTime = Date.now();
      try {
        const connected = await testAPIConnection();
        const endTime = Date.now();
        setIsConnected(connected);
        setLatency(endTime - startTime);
      } catch (error) {
        setIsConnected(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="glass-panel rounded-lg p-3 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className={`status-indicator ${isConnected ? 'text-primary' : 'text-muted-foreground'}`} />
          <span className="text-xs font-medium">
            {isConnected ? 'API Connected' : 'Demo Mode'}
          </span>
        </div>
        
        {latency && (
          <div className="flex items-center gap-1">
            <Activity className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{latency}ms</span>
          </div>
        )}
        
        {isConnected && (
          <div className="flex items-center gap-1">
            <Cpu className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">GPU</span>
          </div>
        )}
      </div>
    </div>
  );
}