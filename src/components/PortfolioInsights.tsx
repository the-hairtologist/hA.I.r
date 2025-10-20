import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, TrendingUp, Target, Lightbulb, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/lib/logging/productionLogger";
import { userJourney } from "@/lib/logging/userJourneyTracker";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PortfolioInsightsProps {
  stylistId: string;
}

export const PortfolioInsights = ({ stylistId }: PortfolioInsightsProps) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [photosAnalyzed, setPhotosAnalyzed] = useState(0);

  const analyzePortfolio = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-portfolio', {
        body: { stylistId }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        if (data.suggestions) {
          setAnalysis(`**Getting Started:**\n\n${data.suggestions.map((s: string) => `• ${s}`).join('\n')}`);
        }
        return;
      }

      setAnalysis(data.analysis);
      setPhotosAnalyzed(data.photosAnalyzed);
      userJourney.trackAction('Portfolio analysis completed', { photosAnalyzed: data.photosAnalyzed });
      toast.success('Portfolio analysis complete!');
    } catch (error: any) {
      logger.error('Error analyzing portfolio', error, { component: 'PortfolioInsights', stylistId });
      userJourney.trackError(error, { operation: 'analyzePortfolio', stylistId });
      toast.error('Failed to analyze portfolio');
    } finally {
      setLoading(false);
    }
  };

  const formatAnalysis = (text: string) => {
    // Simple markdown-like formatting
    return text.split('\n').map((line, idx) => {
      // Headers
      if (line.match(/^#+\s/)) {
        const level = line.match(/^#+/)?.[0].length || 2;
        const text = line.replace(/^#+\s/, '');
        const sizes = ['text-2xl', 'text-xl', 'text-lg'];
        return (
          <h3 key={idx} className={`${sizes[level - 2] || 'text-base'} font-bold mt-4 mb-2 first:mt-0`}>
            {text}
          </h3>
        );
      }
      
      // Bold text
      if (line.match(/^\*\*(.*?)\*\*/)) {
        const text = line.replace(/^\*\*(.*?)\*\*/, '$1');
        return (
          <p key={idx} className="font-semibold mt-3 mb-1">
            {text}
          </p>
        );
      }
      
      // Bullet points
      if (line.match(/^[-•]\s/)) {
        const text = line.replace(/^[-•]\s/, '');
        return (
          <li key={idx} className="ml-4 mb-1 text-muted-foreground">
            {text}
          </li>
        );
      }
      
      // Regular paragraphs
      if (line.trim()) {
        return (
          <p key={idx} className="mb-2 text-muted-foreground">
            {line}
          </p>
        );
      }
      
      return null;
    });
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Portfolio Insights
            </CardTitle>
            <CardDescription>
              Get expert analysis of your portfolio with actionable insights
            </CardDescription>
          </div>
          <Button
            onClick={analyzePortfolio}
            disabled={loading}
            className="shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Analyze Portfolio
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      {analysis && (
        <CardContent>
          <Alert className="mb-4 border-primary/20 bg-primary/5">
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              {photosAnalyzed > 0 
                ? `Analyzed ${photosAnalyzed} photos from your portfolio using Gemini 2.5 Pro`
                : 'Portfolio recommendations based on your current setup'}
            </AlertDescription>
          </Alert>

          <div className="prose prose-sm max-w-none">
            <div className="space-y-2">
              {formatAnalysis(analysis)}
            </div>
          </div>

          {photosAnalyzed > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t">
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Growth Tips</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Style Focus</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Lightbulb className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Marketing Ideas</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Award className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Showcase Pieces</span>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
