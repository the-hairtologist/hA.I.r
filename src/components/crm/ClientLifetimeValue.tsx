import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Calendar, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function ClientLifetimeValue() {
  const topClients = [
    {
      name: "Sample Client A",
      totalSpent: 2400,
      visits: 12,
      avgPerVisit: 200,
      memberSince: "Jan 2024",
      tier: "Platinum"
    },
    {
      name: "Sample Client B",
      totalSpent: 1800,
      visits: 9,
      avgPerVisit: 200,
      memberSince: "Mar 2024",
      tier: "Gold"
    },
    {
      name: "Sample Client C",
      totalSpent: 1200,
      visits: 8,
      avgPerVisit: 150,
      memberSince: "Apr 2024",
      tier: "Silver"
    },
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Platinum": return "text-purple-500";
      case "Gold": return "text-amber-500";
      case "Silver": return "text-gray-400";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="brutal-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Client Lifetime Value
          </CardTitle>
          <CardDescription>
            Track and optimize revenue from your most valuable clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <div className="p-4 rounded-lg bg-muted">
              <div className="text-sm text-muted-foreground mb-1">Average LTV</div>
              <div className="text-2xl font-bold">$0</div>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <div className="text-sm text-muted-foreground mb-1">Top 10% LTV</div>
              <div className="text-2xl font-bold">$0</div>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <div className="text-sm text-muted-foreground mb-1">Avg Visits/Client</div>
              <div className="text-2xl font-bold">0</div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              Top Value Clients
            </h3>
            {topClients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No client data yet. Start tracking to see insights!</p>
              </div>
            ) : (
              topClients.map((client, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border-2 border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl font-bold text-muted-foreground">#{idx + 1}</span>
                      <h3 className="font-semibold">{client.name}</h3>
                      <Badge variant="outline" className={getTierColor(client.tier)}>
                        {client.tier}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Since {client.memberSince}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {client.visits} visits
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        ${client.avgPerVisit}/visit
                      </span>
                      <span className="font-semibold text-success">
                        Total: ${client.totalSpent}
                      </span>
                    </div>
                  </div>
                  <div className="sm:w-32">
                    <Progress value={(client.totalSpent / 3000) * 100} className="h-2" />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
