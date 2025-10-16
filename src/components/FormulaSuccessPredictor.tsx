import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, AlertTriangle, Sparkles, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormulaSuccessPredictorProps {
  formulaText: string;
  clientHairType?: string;
  clientAllergies?: string;
  previousSuccessRate?: number;
  similarFormulasCount?: number;
}

export const FormulaSuccessPredictor = ({
  formulaText,
  clientHairType,
  clientAllergies,
  previousSuccessRate,
  similarFormulasCount = 0
}: FormulaSuccessPredictorProps) => {
  const calculateSuccessProbability = () => {
    let score = 50; // Base score

    // Factor 1: Previous success with this client (highest weight)
    if (previousSuccessRate !== undefined) {
      score += previousSuccessRate * 0.4;
    }

    // Factor 2: Similar formula history
    if (similarFormulasCount > 10) {
      score += 15;
    } else if (similarFormulasCount > 5) {
      score += 10;
    } else if (similarFormulasCount > 0) {
      score += 5;
    }

    // Factor 3: Formula completeness
    const hasDetailed = formulaText.length > 100;
    const hasTiming = /\d+\s*(min|minutes|hour|hr)/i.test(formulaText);
    const hasRatios = /\d+:\d+/.test(formulaText) || /\d+\s*oz/.test(formulaText);
    
    if (hasDetailed && hasTiming && hasRatios) {
      score += 15;
    } else if (hasDetailed && (hasTiming || hasRatios)) {
      score += 10;
    }

    // Factor 4: Hair type match
    if (clientHairType && formulaText.toLowerCase().includes(clientHairType.toLowerCase())) {
      score += 5;
    }

    // Factor 5: Allergy awareness (penalize if allergies exist but not mentioned)
    if (clientAllergies && clientAllergies.trim().length > 0) {
      const allergyMentioned = clientAllergies.toLowerCase().split(',').some(allergy => 
        formulaText.toLowerCase().includes(allergy.trim().toLowerCase())
      );
      if (!allergyMentioned) {
        score -= 20; // Significant penalty for not addressing allergies
      } else {
        score += 10; // Bonus for addressing allergies
      }
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const probability = calculateSuccessProbability();

  const getPredictionConfig = () => {
    if (probability >= 85) {
      return {
        icon: Sparkles,
        color: 'text-success border-success/30 bg-success/10',
        badge: 'success' as const,
        title: '🎯 High Success Probability',
        message: `${probability}% predicted success. This formula has excellent indicators.`,
        tips: ['Formula has strong historical success', 'Consider making this a template']
      };
    } else if (probability >= 70) {
      return {
        icon: TrendingUp,
        color: 'text-info border-info/30 bg-info/10',
        badge: 'default' as const,
        title: '👍 Good Success Probability',
        message: `${probability}% predicted success. Solid formula with minor optimization potential.`,
        tips: ['Add more specific timing if possible', 'Include product ratios for repeatability']
      };
    } else if (probability >= 50) {
      return {
        icon: Target,
        color: 'text-warning border-warning/30 bg-warning/10',
        badge: 'secondary' as const,
        title: '⚠️ Moderate Success Probability',
        message: `${probability}% predicted success. Consider enhancing this formula.`,
        tips: [
          'Add more detailed instructions',
          'Include processing time',
          'Verify product ratios',
          clientAllergies && 'Double-check allergy considerations'
        ].filter(Boolean) as string[]
      };
    } else {
      return {
        icon: AlertTriangle,
        color: 'text-destructive border-destructive/30 bg-destructive/10',
        badge: 'destructive' as const,
        title: '🚨 Low Success Probability',
        message: `${probability}% predicted success. This formula needs significant improvement.`,
        tips: [
          'Add comprehensive details',
          'Include all timing and measurements',
          clientAllergies && '⚠️ Address client allergies',
          'Consider consulting similar successful formulas',
          'Add step-by-step instructions'
        ].filter(Boolean) as string[]
      };
    }
  };

  const config = getPredictionConfig();
  const Icon = config.icon;

  return (
    <Alert className={cn("border-l-4", config.color)}>
      <Icon className="h-5 w-5" />
      <AlertDescription className="space-y-3">
        <div>
          <div className="font-semibold text-base">{config.title}</div>
          <div className="text-sm text-muted-foreground mt-1">{config.message}</div>
        </div>
        
        {config.tips.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border/50">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Recommendations:</div>
            <ul className="text-sm text-muted-foreground space-y-2">
              {config.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1 text-primary">•</span>
                  <span className="flex-1">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {similarFormulasCount > 0 && (
          <div className="text-xs text-muted-foreground border-t border-border/50 pt-2 mt-2">
            📊 Based on {similarFormulasCount} similar formulas in your history
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};