import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, Repeat } from "lucide-react";
import { toast } from "sonner";

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
      toast.error("Failed to load retention data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="brutal-border brutal-shadow-lg hover:brutal-shadow-xl transition-shadow bg-gradient-to-br from-card to-secondary/5">
      <CardHeader className="p-4 sm:p-5 md:p-6 pb-3 sm:pb-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-pixel">
          <div className="p-2 rounded-lg bg-gradient-pink-rose">
            <Repeat className="h-5 w-5 text-on-surface-primary" />
          </div>
          <span>Client Retention</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 md:p-6">
        {loading ? (
          <div className="space-y-3 sm:space-y-4">
            <div className="h-24 bg-muted/50 rounded-lg animate-pulse" />
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-display font-bold text-secondary">
                {stats.retentionRate}%
              </div>
              <p className="text-xs sm:text-sm font-sans text-muted-foreground font-medium mt-1">
                Retention Rate
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 rounded-lg bg-muted/30 brutal-border text-center min-h-[100px] flex flex-col items-center justify-center">
                <Users className="h-5 w-5 mx-auto mb-2 text-primary" />
                <div className="text-xl sm:text-2xl font-display font-bold">
                  {stats.totalClients}
                </div>
                <p className="text-[11px] sm:text-xs font-sans text-muted-foreground mt-1">
                  Total Clients
                </p>
              </div>

              <div className="p-3 sm:p-4 rounded-lg bg-muted/30 brutal-border text-center min-h-[100px] flex flex-col items-center justify-center">
                <Repeat className="h-5 w-5 mx-auto mb-2 text-secondary" />
                <div className="text-xl sm:text-2xl font-display font-bold">
                  {stats.returningClients}
                </div>
                <p className="text-[11px] sm:text-xs font-sans text-muted-foreground mt-1">
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
