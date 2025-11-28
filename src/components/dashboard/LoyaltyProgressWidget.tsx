/**
 * Loyalty Progress Widget
 * Shows client's reward points and progress to next reward
 * OPTIMIZED: Uses EnhancedAuth context to avoid duplicate queries
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Star, Trophy, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { logger } from '@/lib/logger';

interface Milestone {
  id: string;
  milestone_type: string;
  milestone_value: number;
  discount_amount: number;
  discount_code: string;
  celebrated: boolean;
}

export function LoyaltyProgressWidget() {
  const navigate = useNavigate();
  const { clientProfile } = useEnhancedAuth();
  const [loading, setLoading] = useState(true);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    if (clientProfile?.id) {
      loadLoyaltyData();
    }
  }, [clientProfile?.id]);

  const loadLoyaltyData = async () => {
    if (!clientProfile?.id) return;

    try {
      // Get completed appointment count - NO DUPLICATE QUERY
      const { count } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientProfile.id)
        .eq('status', 'completed');

      setAppointmentCount(count || 0);

      // Get milestones
      const { data: milestonesData } = await supabase
        .from('client_milestones')
        .select('*')
        .eq('client_id', clientProfile.id)
        .order('created_at', { ascending: false });

      setMilestones(
        milestonesData?.map(m => ({
          ...m,
          discount_amount: m.discount_amount ?? 0,
          discount_code: m.discount_code ?? '',
          celebrated: m.celebrated ?? false,
        })) || []
      );
    } catch (error) {
      logger.error(
        'Error loading loyalty data',
        'LoyaltyProgressWidget',
        error as Error
      );
    } finally {
      setLoading(false);
    }
  };

  // Calculate next milestone
  const milestoneThresholds = [5, 10, 25, 50, 100];
  const nextMilestone =
    milestoneThresholds.find(m => m > appointmentCount) || 100;
  const prevMilestone =
    milestoneThresholds.filter(m => m <= appointmentCount).pop() || 0;
  const progressRange = nextMilestone - prevMilestone;
  const currentProgress = appointmentCount - prevMilestone;
  const progressPercent = (currentProgress / progressRange) * 100;

  // Get unclaimed rewards
  const unclaimedRewards = milestones.filter(m => !m.celebrated);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          Loyalty Rewards
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress to next reward */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground">
              Progress to next reward
            </span>
            <span className="font-bold text-primary">
              {appointmentCount} / {nextMilestone} visits
            </span>
          </div>

          <Progress value={progressPercent} className="h-3" />

          <p className="text-[11px] sm:text-xs text-muted-foreground">
            {nextMilestone - appointmentCount} more{' '}
            {nextMilestone - appointmentCount === 1 ? 'visit' : 'visits'} until
            your next reward!
          </p>
        </div>

        {/* Unclaimed rewards */}
        {unclaimedRewards.length > 0 && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span className="text-xs sm:text-sm font-medium">
                You have {unclaimedRewards.length} reward
                {unclaimedRewards.length !== 1 ? 's' : ''}!
              </span>
            </div>
            <div className="space-y-2">
              {unclaimedRewards.map(reward => (
                <div
                  key={reward.id}
                  className="p-3 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-amber-500" />
                      <span className="text-xs sm:text-sm font-medium">
                        ${reward.discount_amount} Off
                      </span>
                    </div>
                    <code className="text-[11px] sm:text-xs bg-background/50 px-2 py-1 rounded">
                      {reward.discount_code}
                    </code>
                  </div>
                  <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
                    {reward.milestone_type === 'appointments'
                      ? `${reward.milestone_value} appointments milestone`
                      : `${reward.milestone_value} year anniversary`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call to action */}
        <Button
          onClick={() => navigate('/appointments')}
          variant="outline"
          className="w-full"
        >
          <Star className="h-4 w-4 mr-2" />
          View All Rewards
        </Button>
      </CardContent>
    </Card>
  );
}
