import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, TrendingUp, Users, Calendar, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface RetentionScore {
  id: string;
  client_id: string;
  retention_score: number;
  risk_level: string;
  days_since_last_visit: number;
  predicted_next_visit: string;
  churn_probability: number;
  recommended_actions: any;
  client?: {
    full_name: string;
    email: string;
    phone: string;
  };
}

export function RetentionDashboard({ stylistId }: { stylistId: string }) {
  const [scores, setScores] = useState<RetentionScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    atRisk: 0,
    healthy: 0,
    avgScore: 0,
  });

  useEffect(() => {
    loadRetentionScores();
  }, [stylistId]);

  const loadRetentionScores = async () => {
    try {
      const { data, error } = await supabase
        .from("client_retention_scores")
        .select(`
          *,
          client:client_profiles(full_name, email, phone)
        `)
        .eq("stylist_id", stylistId)
        .order("retention_score", { ascending: true })
        .limit(20);

      if (error) throw error;

      setScores(data || []);

      // Calculate stats
      const atRisk = data?.filter(s => s.risk_level === "high" || s.risk_level === "critical").length || 0;
      const healthy = data?.filter(s => s.risk_level === "low").length || 0;
      const avgScore = data?.length ? Math.round(data.reduce((acc, s) => acc + s.retention_score, 0) / data.length) : 0;

      setStats({ atRisk, healthy, avgScore });
    } catch (error) {
      console.error("Error loading retention scores:", error);
      toast.error("Failed to load retention data");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "default";
      default: return "outline";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return <div>Loading retention insights...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              At Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.atRisk}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Clients needing attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Healthy Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.healthy}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Strong retention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Avg Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getScoreColor(stats.avgScore)}`}>
              {stats.avgScore}/100
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Overall retention health
            </p>
          </CardContent>
        </Card>
      </div>

      {/* At-Risk Clients */}
      <Card>
        <CardHeader>
          <CardTitle>Client Retention Scores</CardTitle>
          <CardDescription>
            AI-powered insights to help you keep clients engaged
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scores.map((score) => (
              <div
                key={score.id}
                className="flex items-center justify-between p-4 border-2 border-border rounded-lg hover:border-primary transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold">{score.client?.full_name}</h4>
                    <Badge variant={getRiskColor(score.risk_level)}>
                      {score.risk_level} risk
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                        {score.days_since_last_visit} days since visit
                      </span>
                      <span className={`font-semibold ${getScoreColor(score.retention_score)}`}>
                        Score: {score.retention_score}/100
                      </span>
                    </div>
                    
                    <Progress value={score.retention_score} className="h-2" />
                    
                    {score.recommended_actions && Array.isArray(score.recommended_actions) && score.recommended_actions.length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium">Recommended: </span>
                        <span className="text-muted-foreground">
                          {score.recommended_actions[0]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.info("Message composer coming soon!")}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => toast.info("Booking flow coming soon!")}
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {scores.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No retention data yet. Scores will appear after client appointments.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
