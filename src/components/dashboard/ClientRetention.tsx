import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, Repeat } from "lucide-react";

interface ClientRetentionProps {
  stylistId: string;
}

export function ClientRetention({ stylistId }: ClientRetentionProps) {
  const [stats, setStats] = useState({
    totalClients: 0,
    returningClients: 0,
    retentionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRetentionStats();
  }, [stylistId]);

  const loadRetentionStats = async () => {
    try {
      const { data: appointments } = await supabase
        .from("appointments")
        .select("client_id")
        .eq("stylist_id", stylistId)
        .eq("status", "completed");

      if (appointments && appointments.length > 0) {
        const clientCounts = new Map<string, number>();
        appointments.forEach(apt => {
          const count = clientCounts.get(apt.client_id) || 0;
          clientCounts.set(apt.client_id, count + 1);
        });

        const totalClients = clientCounts.size;
        const returningClients = Array.from(clientCounts.values()).filter(count => count > 1).length;
        const retentionRate = totalClients > 0 ? Math.round((returningClients / totalClients) * 100) : 0;

        setStats({ totalClients, returningClients, retentionRate });
      }
    } catch (error) {
      console.error("Error loading retention stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="brutal-border brutal-shadow-lg hover:brutal-shadow-xl transition-shadow bg-gradient-to-br from-card to-secondary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-display">
          <div className="p-2 rounded-lg bg-gradient-pink-rose">
            <Repeat className="h-5 w-5 text-white" />
          </div>
          <span>Client Retention</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <div className="h-24 bg-muted/50 rounded-lg animate-pulse" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-display font-bold text-secondary">
                {stats.retentionRate}%
              </div>
              <p className="text-sm text-muted-foreground font-medium mt-1">
                Retention Rate
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/30 brutal-border text-center">
                <Users className="h-5 w-5 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-display font-bold">
                  {stats.totalClients}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total Clients
                </p>
              </div>

              <div className="p-3 rounded-lg bg-muted/30 brutal-border text-center">
                <Repeat className="h-5 w-5 mx-auto mb-2 text-secondary" />
                <div className="text-2xl font-display font-bold">
                  {stats.returningClients}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Returning
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
