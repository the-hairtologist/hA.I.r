/**
 * Rate Limit Warning Component
 * Shows warning when approaching AI rate limits
 */

import { useRateLimitWarning, formatResetTime, getRateLimitColor } from '@/hooks/useRateLimitWarning';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function RateLimitWarning() {
  const { warning } = useRateLimitWarning();
  
  if (!warning || warning.level === 'safe') {
    return null;
  }
  
  const isExceeded = warning.level === 'exceeded';
  const isCritical = warning.level === 'critical';
  
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom duration-300">
      <Alert className={`${isExceeded || isCritical ? 'bg-destructive/10 border-destructive' : 'bg-warning/10 border-warning'}`}>
        <AlertTriangle className={`h-4 w-4 ${getRateLimitColor(warning.level)}`} />
        <AlertDescription>
          <div className="space-y-2">
            <p className={getRateLimitColor(warning.level)}>
              {warning.message}
            </p>
            
            <div className="space-y-1">
              <Progress value={warning.percentage} className="h-2" />
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {warning.callsRemaining} request{warning.callsRemaining !== 1 ? 's' : ''} left
                </span>
                {warning.resetIn > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Resets in {formatResetTime(warning.resetIn)}
                  </span>
                )}
              </div>
            </div>
            
            {isExceeded && (
              <p className="text-xs text-muted-foreground mt-2">
                Please wait a moment before making more AI requests.
              </p>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
