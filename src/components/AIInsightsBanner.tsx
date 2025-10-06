/**
 * AI Insights Banner - Shows contextual AI insights on any page
 */

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { aiOrchestrator } from '@/lib/ai/AIOrchestrator';
import { useAuth } from '@/hooks/useAuth';

interface AIInsightsBannerProps {
  context?: string; // e.g., 'appointments', 'clients', 'dashboard'
}

export const AIInsightsBanner = ({ context }: AIInsightsBannerProps) => {
  const [insights, setInsights] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadInsights();
    const interval = setInterval(loadInsights, 120000); // Refresh every 2 minutes
    return () => clearInterval(interval);
  }, [user, context]);

  const loadInsights = async () => {
    if (!user) return;
    
    const suggestions = await aiOrchestrator.getSmartSuggestions(user.id);
    
    // Filter insights based on context if provided
    const filteredInsights = context
      ? suggestions.filter(s => s.toLowerCase().includes(context))
      : suggestions;
    
    setInsights(filteredInsights.slice(0, 2)); // Show top 2
  };

  if (dismissed || insights.length === 0) return null;

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 mb-6">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <div className="p-2 rounded-full bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">AI Insights</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDismissed(true)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ul className="space-y-1.5">
              {insights.map((insight, index) => (
                <li key={index} className="text-sm text-foreground/80 flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
