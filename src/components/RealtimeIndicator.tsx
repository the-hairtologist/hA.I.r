import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RealtimeIndicatorProps {
  isConnected: boolean;
  className?: string;
}

export function RealtimeIndicator({ isConnected, className }: RealtimeIndicatorProps) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        setPulse(true);
        setTimeout(() => setPulse(false), 1000);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <div 
          className={cn(
            "w-2 h-2 rounded-full transition-colors duration-300",
            isConnected ? "bg-green-500" : "bg-gray-400"
          )}
        />
        {isConnected && pulse && (
          <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-500 animate-ping" />
        )}
      </div>
      <Activity className={cn(
        "h-4 w-4 transition-colors duration-300",
        isConnected ? "text-green-500" : "text-gray-400"
      )} />
      <span className="text-xs text-muted-foreground">
        {isConnected ? "Live" : "Connecting..."}
      </span>
    </div>
  );
}
