import { Badge } from "@/components/ui/badge";
import { Zap, Clock, Sparkles } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ModelPerformanceIndicatorProps {
  modelUsed?: string;
  responseTimeMs?: number;
  showDetails?: boolean;
}

export const ModelPerformanceIndicator = ({ 
  modelUsed, 
  responseTimeMs,
  showDetails = true 
}: ModelPerformanceIndicatorProps) => {
  if (!modelUsed && !responseTimeMs) return null;

  const getModelInfo = (model: string) => {
    if (model.includes('flash-lite')) {
      return { 
        name: 'Flash Lite', 
        color: 'bg-info text-info-foreground', 
        icon: Zap,
        description: 'Fastest model for simple queries'
      };
    }
    if (model.includes('flash')) {
      return { 
        name: 'Flash', 
        color: 'bg-primary text-primary-foreground', 
        icon: Zap,
        description: 'Balanced model for most queries'
      };
    }
    if (model.includes('pro')) {
      return { 
        name: 'Pro', 
        color: 'bg-gradient-primary text-primary-foreground', 
        icon: Sparkles,
        description: 'Most powerful model for complex reasoning'
      };
    }
    if (model.includes('gpt-5')) {
      return { 
        name: 'GPT-5', 
        color: 'bg-success text-success-foreground', 
        icon: Sparkles,
        description: 'Premium model for advanced tasks'
      };
    }
    return { 
      name: 'AI', 
      color: 'bg-muted text-muted-foreground', 
      icon: Sparkles,
      description: 'AI model'
    };
  };

  const getSpeedBadge = (timeMs: number) => {
    if (timeMs < 1000) return { text: 'Instant', color: 'bg-success text-success-foreground' };
    if (timeMs < 3000) return { text: 'Fast', color: 'bg-info text-info-foreground' };
    if (timeMs < 5000) return { text: 'Normal', color: 'bg-warning text-warning-foreground' };
    return { text: 'Slow', color: 'bg-destructive text-destructive-foreground' };
  };

  const modelInfo = modelUsed ? getModelInfo(modelUsed) : null;
  const speedInfo = responseTimeMs ? getSpeedBadge(responseTimeMs) : null;
  const ModelIcon = modelInfo?.icon || Sparkles;

  if (!showDetails) {
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        {modelInfo && (
          <Badge variant="outline" className="text-xs">
            <ModelIcon className="h-3 w-3 mr-1" />
            {modelInfo.name}
          </Badge>
        )}
        {responseTimeMs && (
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {(responseTimeMs / 1000).toFixed(1)}s
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {modelInfo && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge className={modelInfo.color}>
                <ModelIcon className="h-3 w-3 mr-1" />
                {modelInfo.name}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">{modelInfo.description}</p>
              {modelUsed && (
                <p className="text-xs text-muted-foreground mt-1">Model: {modelUsed}</p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {speedInfo && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline" className={speedInfo.color}>
                <Clock className="h-3 w-3 mr-1" />
                {speedInfo.text} ({(responseTimeMs / 1000).toFixed(1)}s)
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">Response time: {responseTimeMs}ms</p>
              <p className="text-xs text-muted-foreground mt-1">
                Smart routing optimizes cost and speed
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};