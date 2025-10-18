import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Activity, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface PerformanceMetrics {
  fps: number;
  memory: number;
  loadTime: number;
}

export const PerformanceOverlay = () => {
  const [show, setShow] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memory: 0,
    loadTime: 0,
  });

  useEffect(() => {
    // Show only in development
    const isDev = import.meta.env.DEV;
    if (!isDev) return;

    // Toggle with Ctrl+Shift+P
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "P") {
        setShow((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  useEffect(() => {
    if (!show) return;

    let frameCount = 0;
    let lastTime = performance.now();

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        const memory = (performance as any).memory 
          ? Math.round((performance as any).memory.usedJSHeapSize / 1048576)
          : 0;
        
        setMetrics({
          fps,
          memory,
          loadTime: Math.round(performance.timing?.loadEventEnd - performance.timing?.navigationStart) || 0,
        });

        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(measureFPS);
    };

    const animationId = requestAnimationFrame(measureFPS);
    return () => cancelAnimationFrame(animationId);
  }, [show]);

  if (!show) return null;

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return "text-success";
    if (fps >= 30) return "text-warning";
    return "text-destructive";
  };

  return (
    <Card className={cn(
      "fixed top-20 right-4 z-40 w-64",
      "border-2 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]",
      "bg-background/95 backdrop-blur-sm"
    )}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary animate-pulse" />
            <h3 className="font-semibold text-sm">Performance</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShow(false)}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">FPS:</span>
            <span className={cn("font-bold", getFPSColor(metrics.fps))}>
              {metrics.fps}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Memory:</span>
            <span className="font-bold">{metrics.memory} MB</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Load:</span>
            <span className="font-bold">{metrics.loadTime} ms</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t">
          <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>Press Ctrl+Shift+P to toggle</span>
        </div>
      </CardContent>
    </Card>
  );
};
