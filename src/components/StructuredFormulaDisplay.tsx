import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, CheckCircle2, Save, Copy, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface FormulaStep {
  product?: string;
  brand?: string;
  shade?: string;
  amount?: string;
  ratio?: string;
  developer?: string;
  mix?: string;
  processing_minutes?: number;
}

interface StructuredFormula {
  ready?: boolean;
  missing_inputs?: string[];
  formula?: {
    base?: FormulaStep[];
    lighten?: FormulaStep[];
    tone?: FormulaStep[];
  };
  application_steps?: string[];
  aftercare?: string[];
  cautions?: string[];
  estimated_time_minutes?: number;
  disclaimer?: string;
}

interface StructuredFormulaDisplayProps {
  data: StructuredFormula | string;
  onSave?: (formula: string) => void;
}

export const StructuredFormulaDisplay = ({ data, onSave }: StructuredFormulaDisplayProps) => {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Try to parse if it's a string
  let formula: StructuredFormula;
  if (typeof data === 'string') {
    try {
      formula = JSON.parse(data);
    } catch (e) {
      // Not JSON, return null to let parent handle as regular text
      return null;
    }
  } else {
    formula = data;
  }

  // Only render if it looks like a structured formula
  if (!formula || (!formula.formula && !formula.application_steps)) {
    return null;
  }

  const toggleStep = (index: number) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const copyFormula = () => {
    const text = JSON.stringify(formula, null, 2);
    navigator.clipboard.writeText(text);
    toast.success("Formula copied to clipboard");
  };

  const renderFormulaSection = (title: string, items?: FormulaStep[]) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="space-y-2">
        <h4 className="font-semibold text-sm text-foreground/90">{title}</h4>
        {items.map((item, idx) => (
          <Card key={idx} className="bg-muted/30 border-muted">
            <CardContent className="p-3 space-y-1 text-sm">
              {item.product && <div className="font-medium">{item.product}</div>}
              {item.brand && item.shade && (
                <div className="text-muted-foreground">
                  {item.brand} {item.shade}
                </div>
              )}
              {item.amount && <div>Amount: <span className="font-mono">{item.amount}</span></div>}
              {item.ratio && <div>Ratio: <span className="font-mono">{item.ratio}</span></div>}
              {item.developer && <div>Developer: {item.developer}</div>}
              {item.mix && <div>Mix: {item.mix}</div>}
              {item.processing_minutes && (
                <div className="flex items-center gap-2 text-foreground/80">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>{item.processing_minutes} minutes</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Card className="my-4 border-primary/20 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <CardTitle className="text-lg">Professional Formula</CardTitle>
            </div>
            <Badge variant="outline" className="w-fit text-xs border-primary/30 bg-primary/5">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
              AI-Generated • Verify with Professional
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={copyFormula}
              className="h-8"
            >
              <Copy className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
              Copy
            </Button>
            {onSave && (
              <Button
                size="sm"
                onClick={() => onSave(JSON.stringify(formula, null, 2))}
                className="h-8"
              >
                <Save className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
                Save
              </Button>
            )}
          </div>
        </div>
        {formula.estimated_time_minutes && (
          <Badge variant="secondary" className="w-fit mt-2">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
            Est. {formula.estimated_time_minutes} min
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Ready Status */}
        {formula.ready === false && formula.missing_inputs && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-1">Missing Required Information:</div>
              <ul className="list-disc list-inside text-sm">
                {formula.missing_inputs.map((input, idx) => (
                  <li key={idx}>{input}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Cautions */}
        {formula.cautions && formula.cautions.length > 0 && (
          <Alert className="border-warning/50 bg-warning/5">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <AlertDescription>
              <div className="font-semibold mb-2 text-warning">⚠️ Important Cautions:</div>
              <ul className="space-y-1">
                {formula.cautions.map((caution, idx) => (
                  <li key={idx} className="text-sm text-foreground/80 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{caution}</span>
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Formula Components */}
        {formula.formula && (
          <div className="space-y-4">
            {renderFormulaSection("Base/Color", formula.formula.base)}
            {renderFormulaSection("Lightening", formula.formula.lighten)}
            {renderFormulaSection("Toning", formula.formula.tone)}
          </div>
        )}

        {/* Application Steps */}
        {formula.application_steps && formula.application_steps.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-foreground/90">Application Steps</h4>
            <div className="space-y-2">
              {formula.application_steps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={completedSteps.has(idx)}
                    onCheckedChange={() => toggleStep(idx)}
                    className="mt-0.5"
                  />
                  <span
                    className={`text-sm flex-1 ${
                      completedSteps.has(idx) ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {idx + 1}. {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aftercare */}
        {formula.aftercare && formula.aftercare.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-foreground/90">Aftercare</h4>
            <ul className="space-y-1">
              {formula.aftercare.map((tip, idx) => (
                <li key={idx} className="text-sm text-foreground/80 flex items-start">
                  <span className="mr-2">✓</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Disclaimer */}
        {formula.disclaimer && (
          <Alert className="border-muted-foreground/20 bg-muted/20">
            <AlertDescription className="text-xs text-muted-foreground italic">
              {formula.disclaimer}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
