import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Users, TrendingUp, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { logger } from '@/lib/logger';

interface ClientMetrics {
  totalClients: number;
  newClients: number;
  returningClients: number;
  retentionRate: number;
  averageLifetimeValue: number;
  topClients: Array<{ name: string; totalSpent: number; visits: number }>;
}

export const RealClientMetrics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<ClientMetrics>({
    totalClients: 0,
    newClients: 0,
    returningClients: 0,
    retentionRate: 0,
    averageLifetimeValue: 0,
    topClients: [],
  });

  useEffect(() => {
    loadClientMetrics();
  }, [user]);

  const loadClientMetrics = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get stylist profile
      const { data: stylistProfile } = await supabase
        .from('stylist_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!stylistProfile) return;

      // Get all clients with appointments
      const { data: appointments } = await supabase
        .from('appointments')
        .select(
          `
          client_id,
          appointment_date,
          stylist_services(price),
          client_profiles(full_name)
        `
        )
        .eq('stylist_id', stylistProfile.id)
        .eq('status', 'completed');

      if (!appointments) return;

      // Calculate metrics
      const clientMap = new Map<
        string,
        { name: string; visits: number; totalSpent: number; firstVisit: Date }
      >();

      appointments.forEach(apt => {
        const clientId = apt.client_id;
        const price = Number(apt.stylist_services?.price || 0);
        const date = new Date(apt.appointment_date);
        const name = apt.client_profiles?.full_name || 'Unknown';

        if (!clientMap.has(clientId)) {
          clientMap.set(clientId, {
            name,
            visits: 0,
            totalSpent: 0,
            firstVisit: date,
          });
        }

        const client = clientMap.get(clientId)!;
        client.visits += 1;
        client.totalSpent += price;
        if (date < client.firstVisit) {
          client.firstVisit = date;
        }
      });

      // Calculate stats
      const totalClients = clientMap.size;
      const returningClients = Array.from(clientMap.values()).filter(
        c => c.visits > 1
      ).length;
      const newClients = totalClients - returningClients;
      const retentionRate =
        totalClients > 0 ? (returningClients / totalClients) * 100 : 0;

      const totalRevenue = Array.from(clientMap.values()).reduce(
        (sum, c) => sum + c.totalSpent,
        0
      );
      const averageLifetimeValue =
        totalClients > 0 ? totalRevenue / totalClients : 0;

      // Top 5 clients by spending
      const topClients = Array.from(clientMap.values())
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5)
        .map(c => ({
          name: c.name,
          totalSpent: c.totalSpent,
          visits: c.visits,
        }));

      setMetrics({
        totalClients,
        newClients,
        returningClients,
        retentionRate,
        averageLifetimeValue,
        topClients,
      });
    } catch (error) {
      logger.error(
        'Error loading client metrics',
        'RealClientMetrics',
        error as Error
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="brutal-border shadow-brutal">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Client Analytics
        </CardTitle>
        <CardDescription>Client metrics and lifetime value</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border-2 border-foreground rounded-lg">
            <p className="text-sm text-muted-foreground">Total Clients</p>
            <p className="text-3xl font-bold">{metrics.totalClients}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {metrics.newClients} new
              </Badge>
              <Badge variant="outline" className="text-xs">
                {metrics.returningClients} returning
              </Badge>
            </div>
          </div>

          <div className="p-4 border-2 border-foreground rounded-lg">
            <p className="text-sm text-muted-foreground">Retention Rate</p>
            <p className="text-3xl font-bold">
              {metrics.retentionRate.toFixed(1)}%
            </p>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>Client loyalty</span>
            </div>
          </div>

          <div className="p-4 border-2 border-foreground rounded-lg col-span-2">
            <p className="text-sm text-muted-foreground">Avg Lifetime Value</p>
            <p className="text-3xl font-bold">
              ${metrics.averageLifetimeValue.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Per client revenue
            </p>
          </div>
        </div>

        {/* Top Clients */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            Top Clients
          </h4>
          <div className="space-y-2">
            {metrics.topClients.map((client, idx) => (
              <div
                key={client.name}
                className="flex items-center justify-between p-3 border-2 border-foreground rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {client.visits} visits
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">
                    ${client.totalSpent.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">total spent</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
