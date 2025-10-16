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
    
    const { data, error } = await supabase
      .from('stylist_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (error) {
      console.error('Error loading stylist ID:', error);
      toast.error('Failed to load stylist profile');
      return;
    }
    
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
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-info" />
              <div className="text-xl sm:text-2xl font-bold">{riskScores.length}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Total Clients</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingDown className="h-8 w-8 mx-auto mb-2 text-warning" />
              <div className="text-xl sm:text-2xl font-bold">{atRiskCount}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">At Risk</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-destructive" />
              <div className="text-xl sm:text-2xl font-bold">{criticalCount}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Critical</div>
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
            <p className="text-xs sm:text-sm whitespace-pre-line">{insights}</p>
          </CardContent>
        </Card>
      )}

      {/* At-Risk Clients */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle>At-Risk Clients</CardTitle>
              <CardDescription>AI-detected churn risk</CardDescription>
            </div>
            <Button onClick={sendRetentionMessages} disabled={loading || atRiskCount === 0} size="sm" className="w-full sm:w-auto">
              <Mail className="h-4 w-4 mr-2" />
              <span className="text-xs sm:text-sm">Send Messages</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {riskScores.filter(s => s.riskLevel !== 'low').length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 text-success" />
              <p>All clients showing healthy engagement! 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {riskScores
                .filter(s => s.riskLevel !== 'low')
                .slice(0, 10)
                .map((score, idx) => (
                   <Card key={idx}>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-2">
                          <Badge
                            variant={
                              score.riskLevel === 'critical'
                                ? 'destructive'
                                : score.riskLevel === 'high'
                                ? 'default'
                                : 'secondary'
                            }
                            className="text-xs"
                          >
                            {score.riskLevel}
                          </Badge>
                          <span className="text-xs text-muted-foreground text-right">
                            {score.appointmentGap} days since last visit
                          </span>
                        </div>
                        
                        <div className="text-xs sm:text-sm space-y-1">
                          <div className="font-medium text-muted-foreground mb-1">Reasons:</div>
                          {score.reasons.map((reason: string, i: number) => (
                            <div key={i} className="text-muted-foreground pl-2">
                              • {reason}
                            </div>
                          ))}
                        </div>
                        
                        <div className="text-xs sm:text-sm space-y-1">
                          <div className="font-medium text-primary mb-1">Recommendations:</div>
                          {score.recommendations.slice(0, 3).map((rec: string, i: number) => (
                            <div key={i} className="text-muted-foreground pl-2">
                              {rec}
                            </div>
                          ))}
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
