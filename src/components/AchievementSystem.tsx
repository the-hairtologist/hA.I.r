import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  Star,
  Zap,
  Target,
  Award,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: Date;
}

export const AchievementSystem = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Get appointment count
    const { count: appointmentCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('stylist_id', user.id);

    // Get client count
    const { count: clientCount } = await supabase
      .from('client_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('preferred_stylist_id', user.id);

    // Get formula count
    const { count: formulaCount } = await supabase
      .from('formulas')
      .select('*', { count: 'exact', head: true })
      .eq('stylist_id', user.id);

    // Get reviews
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('stylist_id', user.id);

    const avgRating = reviews?.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    const achievementsList: Achievement[] = [
      {
        id: 'first_appointment',
        title: 'First Steps',
        description: 'Complete your first appointment',
        icon: Calendar,
        progress: Math.min(appointmentCount || 0, 1),
        maxProgress: 1,
        unlocked: (appointmentCount || 0) >= 1,
      },
      {
        id: 'appointments_10',
        title: 'Rising Star',
        description: 'Complete 10 appointments',
        icon: Star,
        progress: Math.min(appointmentCount || 0, 10),
        maxProgress: 10,
        unlocked: (appointmentCount || 0) >= 10,
      },
      {
        id: 'appointments_50',
        title: 'Professional',
        description: 'Complete 50 appointments',
        icon: Award,
        progress: Math.min(appointmentCount || 0, 50),
        maxProgress: 50,
        unlocked: (appointmentCount || 0) >= 50,
      },
      {
        id: 'appointments_100',
        title: 'Master Stylist',
        description: 'Complete 100 appointments',
        icon: Trophy,
        progress: Math.min(appointmentCount || 0, 100),
        maxProgress: 100,
        unlocked: (appointmentCount || 0) >= 100,
      },
      {
        id: 'clients_10',
        title: 'Growing Practice',
        description: 'Serve 10 unique clients',
        icon: Target,
        progress: Math.min(clientCount || 0, 10),
        maxProgress: 10,
        unlocked: (clientCount || 0) >= 10,
      },
      {
        id: 'formulas_25',
        title: 'Formula Expert',
        description: 'Create 25 hair formulas',
        icon: Zap,
        progress: Math.min(formulaCount || 0, 25),
        maxProgress: 25,
        unlocked: (formulaCount || 0) >= 25,
      },
      {
        id: 'high_rating',
        title: '5-Star Service',
        description: 'Maintain 4.5+ average rating',
        icon: TrendingUp,
        progress: Math.round(avgRating * 10),
        maxProgress: 50,
        unlocked: avgRating >= 4.5,
      },
    ];

    setAchievements(achievementsList);
    setLoading(false);
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <CardTitle>Achievements</CardTitle>
            </div>
            <CardDescription>
              Track your milestones and unlock rewards
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {unlockedCount}/{totalCount}
          </Badge>
        </div>
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Overall Progress
            </span>
            <span className="text-sm font-semibold">
              {completionPercentage}%
            </span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {achievements.map(achievement => {
            const Icon = achievement.icon;
            const progressPercent =
              (achievement.progress / achievement.maxProgress) * 100;

            return (
              <div
                key={achievement.id}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all',
                  achievement.unlocked
                    ? 'bg-primary/5 border-primary shadow-sm'
                    : 'bg-muted/50 border-border'
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'p-2 rounded-lg',
                      achievement.unlocked
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">
                        {achievement.title}
                      </h4>
                      {achievement.unlocked && (
                        <Badge variant="default" className="text-xs px-2 py-0">
                          ✓
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {achievement.description}
                    </p>
                    {!achievement.unlocked && (
                      <div className="space-y-1">
                        <Progress value={progressPercent} className="h-1.5" />
                        <p className="text-xs text-muted-foreground">
                          {achievement.progress}/{achievement.maxProgress}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
