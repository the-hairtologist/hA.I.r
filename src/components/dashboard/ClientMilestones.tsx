import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Gift, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ClientMilestonesProps {
  clientId: string;
}

export const ClientMilestones = ({ clientId }: ClientMilestonesProps) => {
  const { data: milestones, isLoading } = useQuery({
    queryKey: ['client-milestones', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_milestones')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data || [];
    },
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Discount code copied!');
  };

  const getMilestoneIcon = (type: string) => {
    if (type === 'anniversary') return Calendar;
    return Trophy;
  };

  if (isLoading) {
    return (
      <Card variant="glass" className="backdrop-blur-xl">
        <CardHeader className="p-4 sm:p-5 md:p-6 pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg font-pixel flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Your Rewards & Milestones
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 md:p-6">
          <div className="space-y-3 sm:space-y-4">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="h-20 bg-muted/20 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!milestones || milestones.length === 0) {
    return (
      <Card variant="glass" className="backdrop-blur-xl border-primary/10">
        <CardHeader className="p-4 sm:p-5 md:p-6 pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg font-pixel flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Your Rewards & Milestones
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 md:p-6">
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-xs sm:text-sm text-muted-foreground">
              Complete appointments to unlock rewards!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      variant="glass"
      className="backdrop-blur-xl border-primary/10 hover:border-primary/20 transition-all duration-300"
    >
      <CardHeader className="p-4 sm:p-5 md:p-6 pb-3 sm:pb-4">
        <CardTitle className="text-base sm:text-lg font-pixel flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          Your Rewards & Milestones
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 md:p-6">
        <div className="space-y-3 sm:space-y-4">
          {milestones.map((milestone, index) => {
            const Icon = getMilestoneIcon(milestone.milestone_type);
            return (
              <div
                key={milestone.id}
                className="group relative rounded-xl border border-border/50 bg-gradient-to-br from-background to-muted/20 p-3 sm:p-4 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                style={{
                  animation: `fadeInUp 0.4s ease-out ${index * 0.1}s both`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 shadow-sm min-h-[44px] min-w-[44px] flex items-center justify-center">
                      <Icon className="h-5 w-5 text-on-surface-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs sm:text-sm">
                        {milestone.milestone_type === 'anniversary'
                          ? `${milestone.milestone_value} Year${milestone.milestone_value > 1 ? 's' : ''} Anniversary! 🎂`
                          : `${milestone.milestone_value} Appointments Complete! ⭐`}
                      </p>
                      <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
                        {new Date(milestone.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {milestone.discount_code && (
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-success/10 border border-success/30">
                        <Gift className="h-3 w-3 text-success" />
                        <span className="text-[11px] sm:text-xs font-bold text-success">
                          ${milestone.discount_amount} OFF
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          milestone.discount_code &&
                          handleCopyCode(milestone.discount_code)
                        }
                        className="min-h-[44px] text-xs sm:text-sm"
                      >
                        Copy Code
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
