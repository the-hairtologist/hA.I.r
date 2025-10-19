/**
 * AI Insights Widget
 * Proactive insights and recommendations
 */

import { useEffect, useState } from 'react';
import { Sparkles, X, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface Insight {
  id: string;
  insight_type: string;
  message: string;
  action_url: string | null;
  priority: number;
  dismissed: boolean;
  created_at: string;
}

export function AIInsightsWidget() {
  const queryClient = useQueryClient();

  const { data: insights, isLoading } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('dismissed', false)
        .order('priority', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as Insight[];
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  const dismissMutation = useMutation({
    mutationFn: async (insightId: string) => {
      const { error } = await supabase
        .from('ai_insights')
        .update({ dismissed: true })
        .eq('id', insightId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
    },
    onError: () => {
      toast.error('Failed to dismiss insight');
    }
  });

  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-insights', {
        body: { type: 'daily_summary' }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
      toast.success('New insights generated');
    },
    onError: (error: any) => {
      if (error.message?.includes('rate limit')) {
        toast.error('Too many requests. Please try again later.');
      } else {
        toast.error('Failed to generate insights');
      }
    }
  });

  // Auto-generate insights on mount if none exist
  useEffect(() => {
    if (!isLoading && (!insights || insights.length === 0)) {
      generateInsightsMutation.mutate();
    }
  }, [isLoading, insights]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading insights...</div>
        </CardContent>
      </Card>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-3">
            No insights available yet.
          </div>
          <Button
            onClick={() => generateInsightsMutation.mutate()}
            disabled={generateInsightsMutation.isPending}
            size="sm"
            variant="outline"
          >
            Generate Insights
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Insights
          </CardTitle>
          <Button
            onClick={() => generateInsightsMutation.mutate()}
            disabled={generateInsightsMutation.isPending}
            size="sm"
            variant="ghost"
          >
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {insights.map((insight) => (
            <li
              key={insight.id}
              className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg group hover:bg-muted transition-colors"
            >
              <div className="flex-1">
                <p className="text-sm">{insight.message}</p>
                {insight.action_url && (
                  <Link
                    to={insight.action_url}
                    className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                  >
                    Take action
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
              <Button
                onClick={() => dismissMutation.mutate(insight.id)}
                size="sm"
                variant="ghost"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
