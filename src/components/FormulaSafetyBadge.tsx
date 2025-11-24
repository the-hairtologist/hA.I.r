import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface SafetyValidation {
  isSafe: boolean;
  warnings: string[];
  blockers: string[];
}

interface FormulaSafetyBadgeProps {
  validation: SafetyValidation | null;
  isLoading?: boolean;
}

export const FormulaSafetyBadge = ({
  validation,
  isLoading,
}: FormulaSafetyBadgeProps) => {
  if (isLoading) {
    return (
      <Badge variant="outline" className="animate-pulse">
        <AlertCircle className="h-3 w-3 mr-1" />
        Validating...
      </Badge>
    );
  }

  if (!validation) {
    return null;
  }

  const { isSafe, warnings, blockers } = validation;

  // Blocked (Unsafe)
  if (!isSafe || blockers.length > 0) {
    return (
      <div className="space-y-2">
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Unsafe - Blocked
        </Badge>
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-2">Critical Safety Issues:</div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {blockers.map(blocker => (
                <li key={blocker}>{blocker}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs font-semibold">
              Do NOT proceed with this formula. Adjust parameters and
              regenerate.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Warnings (Safe but caution needed)
  if (warnings.length > 0) {
    return (
      <div className="space-y-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge className="flex items-center gap-1 bg-warning hover:bg-warning/90 text-warning-foreground">
                <AlertCircle className="h-3 w-3" />
                Safe with Cautions
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <div className="text-sm">
                <p className="font-semibold mb-1">⚠️ Please Note:</p>
                <ul className="list-disc list-inside space-y-1">
                  {warnings.map(warning => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Alert className="border-warning bg-warning/10">
          <AlertCircle className="h-4 w-4 text-warning" />
          <AlertDescription className="text-warning-foreground">
            <div className="font-semibold mb-1">Cautions:</div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {warnings.map(warning => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Fully Safe
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge className="flex items-center gap-1 bg-success hover:bg-success/90 text-success-foreground">
            <CheckCircle className="h-3 w-3" />
            Safe
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">Formula passes all safety checks ✓</p>
          <p className="text-xs text-muted-foreground mt-1">
            Remember to perform a strand test
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
