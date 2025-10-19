import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, AlertCircle, ThumbsUp, Copy } from 'lucide-react';
import { useFormulaRecommendations } from '@/hooks/useFormulaRecommendations';
import { useToast } from '@/hooks/use-toast';

interface FormulaSuggestionsProps {
  clientId: string;
  stylistId: string;
  onUseRecommendation?: (recommendation: any) => void;
}

export const FormulaSuggestions = ({ 
  clientId, 
  stylistId,
  onUseRecommendation 
}: FormulaSuggestionsProps) => {
  const [existingInsights, setExistingInsights] = useState<any[]>([]);
  const { 
    generateRecommendations, 
    fetchInsights,
    dismissInsight,
    isGenerating, 
    recommendations 
  } = useFormulaRecommendations();
  const { toast } = useToast();

  useEffect(() => {
    loadExistingInsights();
  }, [clientId, stylistId]);

  const loadExistingInsights = async () => {
    const insights = await fetchInsights(stylistId, clientId);
    setExistingInsights(insights.filter(i => i.insight_type === 'formula_recommendation'));
  };

  const handleGenerate = async () => {
    try {
      await generateRecommendations(clientId, stylistId);
      await loadExistingInsights();
    } catch (error) {
      // Error already handled by hook
    }
  };

  const handleDismiss = async (insightId: string) => {
    await dismissInsight(insightId);
    await loadExistingInsights();
  };

  const handleCopyFormula = (formula: string) => {
    navigator.clipboard.writeText(formula);
    toast({
      title: "Copied",
      description: "Formula copied to clipboard",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Formula Recommendations
            </CardTitle>
            <CardDescription>
              Smart suggestions based on client history
            </CardDescription>
          </div>
          
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            size="sm"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate New
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Show existing insights first */}
        {existingInsights.length > 0 && !recommendations && (
          <div className="space-y-3">
            {existingInsights.map((insight) => (
              <div key={insight.id} className="bg-primary/5 rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Generated {new Date(insight.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleDismiss(insight.id)}
                    variant="ghost"
                    size="sm"
                  >
                    Dismiss
                  </Button>
                </div>

                {insight.action_items?.map((rec: any, idx: number) => (
                  <div key={idx} className="border rounded-lg p-3 bg-background">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h5 className="font-medium">{rec.title || 'Recommendation'}</h5>
                        {rec.priority && (
                          <Badge variant={getPriorityColor(rec.priority)} className="mt-1">
                            {rec.priority}
                          </Badge>
                        )}
                      </div>
                      {rec.formula && (
                        <Button
                          onClick={() => handleCopyFormula(rec.formula)}
                          variant="ghost"
                          size="sm"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {rec.formula && (
                      <div className="bg-secondary/50 rounded p-2 mb-2 font-mono text-xs whitespace-pre-wrap">
                        {rec.formula}
                      </div>
                    )}

                    {rec.reasoning && (
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Why:</strong> {rec.reasoning}
                      </p>
                    )}

                    {rec.expectedResult && (
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Expected Result:</strong> {rec.expectedResult}
                      </p>
                    )}

                    {rec.concerns && rec.concerns.length > 0 && (
                      <div className="flex items-start gap-2 text-sm text-orange-600 dark:text-orange-400">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong>Concerns:</strong>
                          <ul className="list-disc list-inside">
                            {rec.concerns.map((concern: string, i: number) => (
                              <li key={i}>{concern}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {onUseRecommendation && (
                      <Button
                        onClick={() => onUseRecommendation(rec)}
                        variant="outline"
                        size="sm"
                        className="mt-2"
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Use This Formula
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Show new recommendations */}
        {recommendations && (
          <div className="bg-primary/5 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Fresh Recommendations
            </h4>

            {recommendations.insights && recommendations.insights.length > 0 && (
              <div className="bg-secondary/50 rounded p-3 mb-3">
                <p className="text-sm font-medium mb-2">Key Insights:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {recommendations.insights.map((insight: string, i: number) => (
                    <li key={i}>• {insight}</li>
                  ))}
                </ul>
              </div>
            )}

            {recommendations.recommendations?.map((rec: any, idx: number) => (
              <div key={idx} className="border rounded-lg p-3 bg-background">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h5 className="font-medium">{rec.title}</h5>
                    {rec.priority && (
                      <Badge variant={getPriorityColor(rec.priority)} className="mt-1">
                        {rec.priority}
                      </Badge>
                    )}
                  </div>
                  {rec.formula && (
                    <Button
                      onClick={() => handleCopyFormula(rec.formula)}
                      variant="ghost"
                      size="sm"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {rec.formula && (
                  <div className="bg-secondary/50 rounded p-2 mb-2 font-mono text-xs whitespace-pre-wrap">
                    {rec.formula}
                  </div>
                )}

                {rec.reasoning && (
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Why:</strong> {rec.reasoning}
                  </p>
                )}

                <div className="flex gap-4 text-xs text-muted-foreground">
                  {rec.processingTime && (
                    <span>⏱️ {rec.processingTime}</span>
                  )}
                  {rec.developVolume && (
                    <span>💧 {rec.developVolume}</span>
                  )}
                </div>

                {rec.concerns && rec.concerns.length > 0 && (
                  <div className="flex items-start gap-2 text-sm text-orange-600 dark:text-orange-400 mt-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Concerns:</strong>
                      <ul className="list-disc list-inside">
                        {rec.concerns.map((concern: string, i: number) => (
                          <li key={i}>{concern}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {onUseRecommendation && (
                  <Button
                    onClick={() => onUseRecommendation(rec)}
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Use This Formula
                  </Button>
                )}
              </div>
            ))}

            {recommendations.notes && (
              <div className="text-sm text-muted-foreground italic mt-3 p-3 bg-secondary/30 rounded">
                <strong>Professional Note:</strong> {recommendations.notes}
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!recommendations && existingInsights.length === 0 && !isGenerating && (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">
              No recommendations yet. Generate AI-powered formula suggestions based on client history.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
