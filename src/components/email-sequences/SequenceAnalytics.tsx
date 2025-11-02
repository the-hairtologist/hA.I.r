import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Mail, TrendingUp, Users, BarChart3, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const SequenceAnalytics = () => {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['sequence_analytics'],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data: stylistProfile } = await supabase
        .from('stylist_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!stylistProfile?.id) return null;

      // Total sequences
      const { count: totalSequences } = await supabase
        .from('email_sequences')
        .select('*', { count: 'exact', head: true })
        .eq('stylist_id', stylistProfile.id);

      // Active enrollments
      const { count: activeEnrollments } = await supabase
        .from('email_sequence_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('stylist_id', stylistProfile.id)
        .eq('status', 'active');

      // Total emails sent
      const { count: emailsSent } = await supabase
        .from('email_sequence_logs')
        .select('*', { count: 'exact', head: true })
        .eq('stylist_id', stylistProfile.id);

      // Opened emails
      const { count: emailsOpened } = await supabase
        .from('email_sequence_logs')
        .select('*', { count: 'exact', head: true })
        .eq('stylist_id', stylistProfile.id)
        .not('opened_at', 'is', null);

      // Completed sequences
      const { count: completedSequences } = await supabase
        .from('email_sequence_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('stylist_id', stylistProfile.id)
        .eq('status', 'completed');

      const openRate =
        emailsSent && emailsOpened
          ? ((emailsOpened / emailsSent) * 100).toFixed(1)
          : '0';

      return {
        totalSequences: totalSequences || 0,
        activeEnrollments: activeEnrollments || 0,
        emailsSent: emailsSent || 0,
        emailsOpened: emailsOpened || 0,
        completedSequences: completedSequences || 0,
        openRate,
      };
    },
    enabled: !!user,
  });

  const statCards = [
    {
      title: 'Total Sequences',
      value: stats?.totalSequences || 0,
      icon: Mail,
      gradient: 'from-primary to-secondary',
    },
    {
      title: 'Active Enrollments',
      value: stats?.activeEnrollments || 0,
      icon: Users,
      gradient: 'from-accent to-info',
    },
    {
      title: 'Emails Sent',
      value: stats?.emailsSent || 0,
      icon: TrendingUp,
      gradient: 'from-secondary to-accent',
    },
    {
      title: 'Open Rate',
      value: `${stats?.openRate || 0}%`,
      icon: BarChart3,
      gradient: 'from-success to-accent',
    },
    {
      title: 'Completed',
      value: stats?.completedSequences || 0,
      icon: CheckCircle,
      gradient: 'from-primary to-accent',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Analytics</h2>
        <p className="text-sm text-muted-foreground">
          Track the performance of your email sequences
        </p>
      </div>

      {isLoading ? (
        <Card className="p-12 text-center border-2">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </Card>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {statCards.map(stat => (
              <Card
                key={stat.title}
                className="p-6 border-2 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div
                    className={`p-3 rounded-lg bg-gradient-to-br ${stat.gradient} group-hover:scale-110 transition-transform`}
                  >
                    <stat.icon className="h-6 w-6 text-on-surface-primary" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
