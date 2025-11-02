import { Check, Sparkles, TrendingUp, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { haptic } from '@/platform/haptics';

export type CelebrationType =
  | 'appointment-booked'
  | 'formula-saved'
  | 'client-added'
  | 'milestone'
  | 'income-secured';

interface CelebrationConfig {
  icon: React.ElementType;
  title: string;
  message: string;
  emoji: string;
}

const celebrations: Record<CelebrationType, CelebrationConfig> = {
  'appointment-booked': {
    icon: Calendar,
    title: 'Time Protected',
    message: 'Income secured ✨',
    emoji: '📅',
  },
  'formula-saved': {
    icon: Check,
    title: 'Look Archived',
    message: 'Your masterpiece is saved!',
    emoji: '💅',
  },
  'client-added': {
    icon: Sparkles,
    title: 'New Client Added',
    message: 'Your salon family is growing!',
    emoji: '✨',
  },
  milestone: {
    icon: TrendingUp,
    title: 'Milestone Reached',
    message: "You're crushing it!",
    emoji: '🎉',
  },
  'income-secured': {
    icon: TrendingUp,
    title: 'Income Secured',
    message: 'Another step toward your goals!',
    emoji: '💰',
  },
};

export const showCelebration = (
  type: CelebrationType,
  customMessage?: string,
  count?: number
) => {
  const config = celebrations[type];
  const Icon = config.icon;

  // Trigger haptic feedback
  haptic.success();

  // Show toast with custom styling
  toast.success(
    <div className="flex items-center gap-3">
      <div className="rounded-full bg-success/10 p-2">
        <Icon className="h-5 w-5 text-success" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm">{config.title}</p>
        <p className="text-xs text-muted-foreground">
          {customMessage || config.message}
        </p>
        {count !== undefined && (
          <p className="text-xs text-primary font-medium mt-1">
            {count} {type === 'formula-saved' ? 'looks' : 'total'} archived!{' '}
            {config.emoji}
          </p>
        )}
      </div>
    </div>,
    {
      duration: 3000,
      className: 'border-2 border-success/20 bg-success/5',
    }
  );
};

// Streak celebration component
export const showStreakCelebration = (count: number, type: string) => {
  haptic.success();

  toast.success(
    <div className="flex items-center gap-3">
      <div className="text-4xl animate-bounce">🔥</div>
      <div className="flex-1">
        <p className="font-bold text-base">
          {count} {type} Streak!
        </p>
        <p className="text-sm text-muted-foreground">
          Keep up the amazing work!
        </p>
      </div>
    </div>,
    {
      duration: 4000,
      className: 'border-2 border-warning/20 bg-warning/5',
    }
  );
};
