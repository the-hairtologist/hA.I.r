import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Mail, Phone, Calendar } from "lucide-react";

export function LeadScoring() {
  const leads = [
    {
      name: "Sample Lead 1",
      email: "lead1@example.com",
      score: 85,
      tier: "Hot",
      lastContact: "2 days ago",
      nextAction: "Follow-up call"
    },
    {
      name: "Sample Lead 2",
      email: "lead2@example.com",
      score: 65,
      tier: "Warm",
      lastContact: "1 week ago",
      nextAction: "Send pricing info"
    },
    {
      name: "Sample Lead 3",
      email: "lead3@example.com",
      score: 35,
      tier: "Cold",
      lastContact: "2 weeks ago",
      nextAction: "Re-engagement email"
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-success";
    if (score >= 40) return "text-warning";
    return "text-muted-foreground";
  };

  const getTierBadge = (tier: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      Hot: "destructive",
      Warm: "default",
      Cold: "secondary"
    };
    return variants[tier] || "secondary";
  };

  return (
    <Card className="brutal-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Lead Scoring
        </CardTitle>
        <CardDescription>
          Prioritize potential clients based on engagement and interest level
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No leads yet. Start by inviting potential clients!</p>
            </div>
          ) : (
            leads.map((lead, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border-2 border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold truncate">{lead.name}</h3>
                    <Badge variant={getTierBadge(lead.tier)}>{lead.tier}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    {lead.email}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Last contact: {lead.lastContact}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      Next: {lead.nextAction}
                    </span>
                  </div>
                </div>
                <div className="sm:w-32 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Score</span>
                    <span className={`text-lg font-bold ${getScoreColor(lead.score)}`}>
                      {lead.score}
                    </span>
                  </div>
                  <Progress value={lead.score} className="h-2" />
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
