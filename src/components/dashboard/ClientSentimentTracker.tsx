import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Smile, Meh, Frown, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface ClientSentimentTrackerProps {
  stylistId: string;
}

interface SentimentData {
  positive: number;
  neutral: number;
  negative: number;
  trend: 'up' | 'down' | 'stable';
}

export function ClientSentimentTracker({
  stylistId,
}: ClientSentimentTrackerProps) {
  const [sentiment, setSentiment] = useState<SentimentData>({
    positive: 0,
    neutral: 0,
    negative: 0,
    trend: 'stable',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSentiment();
  }, [stylistId]);

  const loadSentiment = async () => {
    try {
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('stylist_id', stylistId);

      if (reviews && reviews.length > 0) {
        const positive = reviews.filter(r => r.rating >= 4).length;
        const neutral = reviews.filter(r => r.rating === 3).length;
        const negative = reviews.filter(r => r.rating <= 2).length;

        const positivePercent = (positive / reviews.length) * 100;
        const trend =
          positivePercent >= 70
            ? 'up'
            : positivePercent <= 40
              ? 'down'
              : 'stable';

        setSentiment({ positive, neutral, negative, trend });
      }
    } catch (error) {
      logger.error(
        'Error loading sentiment',
        'ClientSentimentTracker',
        error as Error
      );
      toast.error('Failed to load client feedback data');
    } finally {
      setLoading(false);
    }
  };

  const total = sentiment.positive + sentiment.neutral + sentiment.negative;
  const positivePercent =
    total > 0 ? Math.round((sentiment.positive / total) * 100) : 0;

  return (
    <Card className="brutal-border brutal-shadow-lg hover:brutal-shadow-xl transition-shadow bg-gradient-to-br from-card to-accent/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between gap-2 text-base sm:text-lg font-pixel">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-purple-pink">
              <Smile className="h-5 w-5 text-on-surface-primary" />
            </div>
            <span>Client Sentiment</span>
          </div>
          {sentiment.trend === 'up' && (
            <TrendingUp className="h-5 w-5 text-success" />
          )}
          {sentiment.trend === 'down' && (
            <TrendingDown className="h-5 w-5 text-destructive" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <div className="h-20 bg-muted/50 rounded-lg animate-pulse" />
          </div>
        ) : total === 0 ? (
          <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">
            No reviews yet. Keep up the great work!
          </p>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-display font-bold text-primary">
                {positivePercent}%
              </div>
              <p className="text-xs sm:text-sm font-sans text-muted-foreground font-medium mt-1">
                Positive Reviews
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Smile className="h-4 w-4 text-success shrink-0" />
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-success to-success/70 transition-all"
                    style={{
                      width: `${total > 0 ? (sentiment.positive / total) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="text-xs sm:text-sm font-bold w-8 text-right">
                  {sentiment.positive}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Meh className="h-4 w-4 text-warning shrink-0" />
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-warning to-warning/70 transition-all"
                    style={{
                      width: `${total > 0 ? (sentiment.neutral / total) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="text-xs sm:text-sm font-bold w-8 text-right">
                  {sentiment.neutral}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Frown className="h-4 w-4 text-destructive shrink-0" />
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-destructive to-destructive/70 transition-all"
                    style={{
                      width: `${total > 0 ? (sentiment.negative / total) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="text-xs sm:text-sm font-bold w-8 text-right">
                  {sentiment.negative}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
