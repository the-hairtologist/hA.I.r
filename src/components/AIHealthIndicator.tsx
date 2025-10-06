/**
 * AI Health Indicator - Shows AI system status in app header
 */

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Brain, Activity, TrendingUp } from 'lucide-react';
import { aiOrchestrator } from '@/lib/ai/AIOrchestrator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const AIHealthIndicator = () => {
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    const updateStatus = () => {
      setStatus(aiOrchestrator.getStatus());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (!status?.running) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors">
          <Brain className="h-4 w-4 text-primary animate-pulse" />
          <Badge variant="secondary" className="text-xs">
            AI Active
          </Badge>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              AI Systems Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-500" />
                <span className="text-sm">Client Retention AI</span>
              </div>
              <Badge variant="default" className="text-xs">Active</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Smart Cache AI</span>
              </div>
              <Badge variant="default" className="text-xs">Active</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-500" />
                <span className="text-sm">Behavior Learning</span>
              </div>
              <Badge variant="default" className="text-xs">Active</Badge>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                All AI systems running smoothly. Auto-optimizing your experience in real-time.
              </p>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};
