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
        color: 'text-green-500 border-green-200 bg-green-50',
        badge: 'success' as const,
        title: '🎯 High Success Probability',
        message: `${probability}% predicted success. This formula has excellent indicators.`,
        tips: ['Formula has strong historical success', 'Consider making this a template']
      };
    } else if (probability >= 70) {
      return {
        icon: TrendingUp,
        color: 'text-blue-500 border-blue-200 bg-blue-50',
        badge: 'default' as const,
        title: '👍 Good Success Probability',
        message: `${probability}% predicted success. Solid formula with minor optimization potential.`,
        tips: ['Add more specific timing if possible', 'Include product ratios for repeatability']
      };
    } else if (probability >= 50) {
      return {
        icon: Target,
        color: 'text-yellow-500 border-yellow-200 bg-yellow-50',
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
        color: 'text-red-500 border-red-200 bg-red-50',
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
      <Icon className="h-4 w-4" />
      <AlertDescription className="space-y-2">
        <div>
          <div className="font-semibold">{config.title}</div>
          <div className="text-sm text-muted-foreground">{config.message}</div>
        </div>
        
        {config.tips.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs font-semibold text-muted-foreground">Recommendations:</div>
            <ul className="text-xs text-muted-foreground space-y-1">
              {config.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-1">
                  <span className="mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {similarFormulasCount > 0 && (
          <div className="text-xs text-muted-foreground border-t pt-2">
            Based on {similarFormulasCount} similar formulas in your history
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};