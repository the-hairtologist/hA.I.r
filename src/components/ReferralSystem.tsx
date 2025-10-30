import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Copy, Share2, Gift, Users, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';

interface ReferralData {
  referral_code: string;
  successful_referrals: number;
  reward_tier: string;
}

interface ReferralTracking {
  id: string;
  referred_stylist_id: string;
  signup_date: string;
  is_qualified: boolean;
}

export const ReferralSystem = () => {
  const { toast } = useToast();
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [referrals, setReferrals] = useState<ReferralTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [stylistProfile, setStylistProfile] = useState<any>(null);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get stylist profile
      const { data: profile } = await supabase
        .from('stylist_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!profile) return;
      setStylistProfile(profile);

      // Check if referral code exists
      let { data: existingRef } = await supabase
        .from('stylist_referrals')
        .select('*')
        .eq('stylist_id', profile.id)
        .maybeSingle();

      // Create referral code if doesn't exist
      if (!existingRef) {
        const { data: newCode, error: codeError } = await supabase.rpc(
          'generate_referral_code',
          { stylist_name: profile.business_name || 'Stylist' }
        );

        if (!codeError && newCode) {
          const { data: newRef } = await supabase
            .from('stylist_referrals')
            .insert({
              stylist_id: profile.id,
              referral_code: newCode,
            })
            .select()
            .maybeSingle();

          existingRef = newRef;
        }
      }

      setReferralData(existingRef);

      // Load referral tracking
      const { data: trackingData } = await supabase
        .from('referral_tracking')
        .select('*')
        .eq('referrer_id', profile.id)
        .order('signup_date', { ascending: false });

      setReferrals(trackingData || []);
    } catch (error) {
      console.error('Error loading referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    if (referralData?.referral_code) {
      navigator.clipboard.writeText(referralData.referral_code);
      toast({
        title: 'Copied!',
        description: 'Referral code copied to clipboard',
      });
    }
  };

  const shareReferralLink = async () => {
    const referralLink = `${window.location.origin}?ref=${referralData?.referral_code}`;
    const shareText = `Join me on hA.I.r - the AI-powered salon assistant! Use my code ${referralData?.referral_code} when you sign up. 💇‍♀️✨`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join hA.I.r',
          text: shareText,
          url: referralLink,
        });
      } catch (error) {
        logger.debug('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(`${shareText}\n${referralLink}`);
      toast({
        title: 'Link Copied!',
        description: 'Share this with fellow stylists',
      });
    }
  };

  const getRewardProgress = () => {
    const count = referralData?.successful_referrals || 0;
    if (count >= 10)
      return {
        tier: 'Gold',
        next: 'Max',
        progress: 100,
        reward: '6 months free',
      };
    if (count >= 5)
      return {
        tier: 'Silver',
        next: 'Gold (10)',
        progress: (count / 10) * 100,
        reward: '3 months free',
      };
    if (count >= 3)
      return {
        tier: 'Bronze',
        next: 'Silver (5)',
        progress: (count / 5) * 100,
        reward: '2 months free',
      };
    return {
      tier: 'None',
      next: 'Bronze (3)',
      progress: (count / 3) * 100,
      reward: '1 month free',
    };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const reward = getRewardProgress();

  return (
    <div className="space-y-6">
      {/* Main Referral Card */}
      <Card className="brutal-border border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Refer Stylists, Get Rewarded
          </CardTitle>
          <CardDescription>
            Invite other stylists and earn free months when they join and stay
            active
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Referral Code */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Referral Code</label>
            <div className="flex gap-2">
              <Input
                value={referralData?.referral_code || ''}
                readOnly
                className="font-mono text-lg font-bold"
              />
              <Button
                onClick={copyReferralCode}
                variant="outline"
                size="icon"
                aria-label="Copy referral code"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                onClick={shareReferralLink}
                size="icon"
                aria-label="Share referral link"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary/5 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                Total Referrals
              </div>
              <div className="text-2xl font-bold">
                {referralData?.successful_referrals || 0}
              </div>
            </div>
            <div className="bg-accent/5 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                Current Tier
              </div>
              <div className="text-2xl font-bold">{reward.tier}</div>
            </div>
          </div>

          {/* Progress to Next Tier */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Progress to {reward.next}</span>
              <span className="text-muted-foreground">
                {referralData?.successful_referrals || 0} referrals
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full bg-gradient-to-r from-primary to-accent transition-all duration-500',
                  reward.progress === 100 && 'from-accent to-primary'
                )}
                style={{ width: `${reward.progress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Next reward:{' '}
              <span className="font-semibold text-primary">
                {reward.reward}
              </span>
            </p>
          </div>

          {/* Share Button */}
          <Button onClick={shareReferralLink} className="w-full" size="lg">
            <Share2 className="h-4 w-4 mr-2" />
            Share Your Code
          </Button>
        </CardContent>
      </Card>

      {/* Rewards Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Reward Tiers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                referrals: '3 referrals',
                tier: 'Bronze',
                reward: '1 month free',
              },
              {
                referrals: '5 referrals',
                tier: 'Silver',
                reward: '2 months free',
              },
              {
                referrals: '10 referrals',
                tier: 'Gold',
                reward: '3 months free',
              },
            ].map((item, i) => (
              <div
                key={i}
                className={cn(
                  'flex justify-between items-center p-3 rounded-lg border',
                  (referralData?.successful_referrals || 0) >=
                    parseInt(item.referrals) && 'bg-primary/5 border-primary/20'
                )}
              >
                <div>
                  <div className="font-medium">{item.tier}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.referrals}
                  </div>
                </div>
                <div className="text-sm font-semibold text-primary">
                  {item.reward}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Referrals */}
      {referrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {referrals.map(ref => (
                <div
                  key={ref.id}
                  className="flex justify-between items-center p-3 rounded-lg bg-muted/50"
                >
                  <div className="text-sm">
                    <div className="font-medium">
                      {ref.is_qualified ? '✅ Qualified' : '⏳ Pending'}
                    </div>
                    <div className="text-muted-foreground">
                      {new Date(ref.signup_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
