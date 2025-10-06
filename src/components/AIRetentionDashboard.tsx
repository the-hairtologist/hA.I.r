/**
 * AI Client Retention Dashboard
 * Shows AI-powered client retention insights
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Users, TrendingDown, Sparkles, Mail } from 'lucide-react';
import { clientRetentionAI } from '@/lib/ai/ClientRetentionAI';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const AIRetentionDashboard = () => {
  const { user } = useAuth();
  const [riskScores, setRiskScores] = useState<any[]>([]);
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [stylistId, setStylistId] = useState<string | null>(null);

  useEffect(() => {
    loadStylistId();
  }, [user]);

  useEffect(() => {
    if (stylistId) {
      loadRetentionData();
    }
  }, [stylistId]);

  const loadStylistId = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('stylist_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (data) {
      setStylistId(data.id);
    }
  };

  const loadRetentionData = async () => {
    if (!stylistId) return;
    
    setLoading(true);
    try {
      const scores = await clientRetentionAI.analyzeClientRetention(stylistId);
      setRiskScores(scores);

      if (scores.length > 0) {
        const aiInsights = await clientRetentionAI.getAIRetentionInsights(scores);
        setInsights(aiInsights);
      }
    } catch (error) {
      console.error('Failed to load retention data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendRetentionMessages = async () => {
    if (!stylistId) return;

    setLoading(true);
    toast.info('Sending retention messages...');

    try {
      const sent = await clientRetentionAI.sendRetentionMessages(stylistId, riskScores);
      toast.success(`Sent ${sent} retention messages!`);
      await loadRetentionData();
    } catch (error) {
      toast.error('Failed to send messages');
    } finally {
      setLoading(false);
    }
  };

  const atRiskCount = riskScores.filter(s => s.riskLevel !== 'low').length;
  const criticalCount = riskScores.filter(s => s.riskLevel === 'critical').length;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{riskScores.length}</div>
              <div className="text-sm text-muted-foreground">Total Clients</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingDown className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold">{atRiskCount}</div>
              <div className="text-sm text-muted-foreground">At Risk</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold">{criticalCount}</div>
              <div className="text-sm text-muted-foreground">Critical</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      {insights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Retention Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-line">{insights}</p>
          </CardContent>
        </Card>
      )}

      {/* At-Risk Clients */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>At-Risk Clients</CardTitle>
              <CardDescription>AI-detected churn risk</CardDescription>
            </div>
            <Button onClick={sendRetentionMessages} disabled={loading || atRiskCount === 0}>
              <Mail className="h-4 w-4 mr-2" />
              Send Retention Messages
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {riskScores.filter(s => s.riskLevel !== 'low').length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>All clients showing healthy engagement! 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {riskScores
                .filter(s => s.riskLevel !== 'low')
                .slice(0, 10)
                .map((score, idx) => (
                  <Card key={idx}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant={
                                score.riskLevel === 'critical'
                                  ? 'destructive'
                                  : score.riskLevel === 'high'
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {score.riskLevel}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {score.appointmentGap} days since last visit
                            </span>
                          </div>
                          <div className="text-sm space-y-1">
                            {score.reasons.map((reason: string, i: number) => (
                              <div key={i} className="text-muted-foreground">
                                • {reason}
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 text-sm font-medium text-primary">
                            Recommendations:
                          </div>
                          <div className="text-sm space-y-1 mt-1">
                            {score.recommendations.slice(0, 3).map((rec: string, i: number) => (
                              <div key={i} className="text-muted-foreground">
                                {rec}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
