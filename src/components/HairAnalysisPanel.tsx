import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, TrendingUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface HairAnalysis {
  current_level: number;
  level_confidence: number;
  undertones: string[];
  damage_indicators: {
    porosity: string;
    elasticity: string;
    split_ends: boolean;
    breakage?: boolean;
  };
  previous_color_detected: boolean;
  recommended_approach: string;
  cautions: string[];
  professional_notes?: string;
  confidence_scores?: {
    overall: number;
    level: number;
    undertones: number;
    damage: number;
  };
}

interface HairAnalysisPanelProps {
  analysis: HairAnalysis;
}

export const HairAnalysisPanel = ({ analysis }: HairAnalysisPanelProps) => {
  const getPorosityColor = (porosity: string) => {
    if (porosity === 'high') return 'bg-red-500';
    if (porosity === 'low') return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getElasticityColor = (elasticity: string) => {
    if (elasticity === 'compromised') return 'bg-red-500';
    if (elasticity === 'fair') return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getLevelColor = (level: number) => {
    if (level <= 3) return 'bg-gradient-to-r from-gray-900 to-gray-700';
    if (level <= 6) return 'bg-gradient-to-r from-amber-900 to-amber-700';
    return 'bg-gradient-to-r from-yellow-400 to-yellow-200';
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Hair Analysis Results
          <Badge variant="outline" className="ml-auto">
            {Math.round((analysis.confidence_scores?.overall || analysis.level_confidence) * 100)}% Confidence
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hair Level Visualization */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Current Hair Level</span>
            <Badge className={getLevelColor(analysis.current_level)}>
              Level {analysis.current_level}
            </Badge>
          </div>
          <div className="relative h-8 bg-gradient-to-r from-gray-900 via-amber-700 to-yellow-200 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 h-full w-1 bg-white shadow-lg"
              style={{ left: `${(analysis.current_level / 10) * 100}%` }}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold bg-background px-2 py-1 rounded shadow-md">
                {analysis.current_level}
              </div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>1 (Black)</span>
            <span>10 (Lightest Blonde)</span>
          </div>
        </div>

        {/* Undertones */}
        <div>
          <span className="text-sm font-medium block mb-2">Detected Undertones</span>
          <div className="flex flex-wrap gap-2">
            {analysis.undertones.map((tone, i) => (
              <Badge key={i} variant="secondary" className="capitalize">
                {tone}
              </Badge>
            ))}
          </div>
        </div>

        {/* Damage Indicators */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-xs text-muted-foreground">Porosity</span>
            <div className="flex items-center gap-2 mt-1">
              <div className={`h-2 w-2 rounded-full ${getPorosityColor(analysis.damage_indicators.porosity)}`} />
              <span className="text-sm font-medium capitalize">{analysis.damage_indicators.porosity}</span>
            </div>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Elasticity</span>
            <div className="flex items-center gap-2 mt-1">
              <div className={`h-2 w-2 rounded-full ${getElasticityColor(analysis.damage_indicators.elasticity)}`} />
              <span className="text-sm font-medium capitalize">{analysis.damage_indicators.elasticity}</span>
            </div>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Split Ends</span>
            <div className="flex items-center gap-2 mt-1">
              {analysis.damage_indicators.split_ends ? (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              <span className="text-sm">{analysis.damage_indicators.split_ends ? 'Detected' : 'None'}</span>
            </div>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Previous Color</span>
            <div className="flex items-center gap-2 mt-1">
              {analysis.previous_color_detected ? (
                <AlertCircle className="h-4 w-4 text-blue-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              <span className="text-sm">{analysis.previous_color_detected ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        {/* Recommended Approach */}
        <div>
          <span className="text-sm font-medium block mb-2">Recommended Approach</span>
          <Badge 
            variant={analysis.recommended_approach === 'correction_needed' ? 'destructive' : 'default'}
            className="capitalize"
          >
            {analysis.recommended_approach.replace(/_/g, ' ')}
          </Badge>
        </div>

        {/* Cautions */}
        {analysis.cautions && analysis.cautions.length > 0 && (
          <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-900 dark:text-yellow-100">
              <div className="font-semibold mb-1">Important Cautions:</div>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {analysis.cautions.map((caution, i) => (
                  <li key={i}>{caution}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Professional Notes */}
        {analysis.professional_notes && (
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
            <span className="font-semibold block mb-1">Professional Notes:</span>
            {analysis.professional_notes}
          </div>
        )}

        {/* Confidence Scores */}
        {analysis.confidence_scores && (
          <div className="space-y-2 pt-2 border-t">
            <span className="text-xs font-medium text-muted-foreground">Analysis Confidence</span>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span>Level Detection</span>
                <span>{Math.round(analysis.confidence_scores.level * 100)}%</span>
              </div>
              <Progress value={analysis.confidence_scores.level * 100} className="h-1" />
              
              <div className="flex justify-between text-xs">
                <span>Undertone Analysis</span>
                <span>{Math.round(analysis.confidence_scores.undertones * 100)}%</span>
              </div>
              <Progress value={analysis.confidence_scores.undertones * 100} className="h-1" />
              
              <div className="flex justify-between text-xs">
                <span>Damage Assessment</span>
                <span>{Math.round(analysis.confidence_scores.damage * 100)}%</span>
              </div>
              <Progress value={analysis.confidence_scores.damage * 100} className="h-1" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};