import { Shield, Activity, Database, Cpu } from "lucide-react";

export function ApiStatus() {
  const isConnected = false; // Will be dynamic when API is integrated

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="glass-panel rounded-lg p-3 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className={`status-indicator ${isConnected ? 'text-primary' : 'text-muted-foreground'}`} />
          <span className="text-xs font-medium">
            {isConnected ? 'API Connected' : 'Demo Mode'}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <Activity className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">45ms</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Cpu className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">GPU</span>
        </div>
      </div>
    </div>
  );
}