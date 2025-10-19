/**
 * AI Formula Analyzer Component
 * Analyzes formulas for success patterns and provides insights
 */

import { useState } from 'react';
import { useFormulaAnalyzer } from '@/hooks/useFormulaAnalyzer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AIFormulaAnalyzerProps {
  formulas: Array<{
    id: string;
    formula_name: string;
    color_line: string;
    steps: any[];
    notes?: string;
  }>;
  onAnalysisComplete?: (analysis: any) => void;
}

export const AIFormulaAnalyzer = ({ formulas, onAnalysisComplete }: AIFormulaAnalyzerProps) => {
  const { analyzing, analysis, analyzeFormulas } = useFormulaAnalyzer();
  const [showResults, setShowResults] = useState(false);

  const handleAnalyze = async () => {
    const result = await analyzeFormulas(formulas);
    if (result) {
      setShowResults(true);
      onAnalysisComplete?.(result);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Formula Analysis
          </CardTitle>
          <CardDescription>
            Get AI-powered insights on formula performance, patterns, and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleAnalyze}
            disabled={analyzing || formulas.length === 0}
            className="w-full"
          >
            {analyzing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
                Analyzing {formulas.length} formulas...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                Analyze {formulas.length} Formula{formulas.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>

          {formulas.length === 0 && (
            <Alert>
              <AlertDescription>
                No formulas available to analyze. Add some formulas first.
              </AlertDescription>
            </Alert>
          )}

          {showResults && analysis && (
            <div className="space-y-4 pt-4 border-t">
              {Object.entries(analysis).map(([formulaId, data]: [string, any]) => {
                const formula = formulas.find(f => f.id === formulaId);
                
                return (
                  <Card key={formulaId}>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>{formula?.formula_name || 'Unknown Formula'}</span>
                        <Badge variant={getScoreBadge(data.success_score)}>
                          Score: {data.success_score}%
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Strengths */}
                      {data.insights?.strengths && data.insights.strengths.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                            Strengths
                          </h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {data.insights.strengths.map((strength: string, idx: number) => (
                              <li key={idx}>{strength}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Weaknesses */}
                      {data.insights?.weaknesses && data.insights.weaknesses.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                            Areas for Improvement
                          </h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {data.insights.weaknesses.map((weakness: string, idx: number) => (
                              <li key={idx}>{weakness}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Recommendations */}
                      {data.recommendations && data.recommendations.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                            <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                            Recommendations
                          </h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {data.recommendations.map((rec: string, idx: number) => (
                              <li key={idx}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Pattern Analysis */}
                      {data.pattern_analysis && (
                        <div className="pt-2 border-t">
                          <h4 className="font-semibold text-sm mb-2">Pattern Analysis</h4>
                          <p className="text-sm text-muted-foreground">{data.pattern_analysis}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
