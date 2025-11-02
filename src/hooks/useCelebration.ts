import { useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { notification } from '@/platform/haptics';

type CelebrationType = 'save' | 'create' | 'complete' | 'milestone' | 'success';

const celebrations: Record<
  CelebrationType,
  {
    icon: string;
    title: string;
    duration?: number;
  }
> = {
  save: { icon: '✓', title: 'Saved!', duration: 1500 },
  create: { icon: '✨', title: 'Created!', duration: 2000 },
  complete: { icon: '🎉', title: 'Completed!', duration: 2000 },
  milestone: { icon: '🏆', title: 'Milestone reached!', duration: 3000 },
  success: { icon: '✓', title: 'Success!', duration: 1500 },
};

export const useCelebration = () => {
  const celebrate = useCallback(
    (
      type: CelebrationType,
      customMessage?: string,
      options?: { skipHaptic?: boolean; duration?: number }
    ) => {
      const config = celebrations[type];

      if (!options?.skipHaptic) {
        notification('success');
      }

      toast({
        title: `${config.icon} ${config.title}`,
        description: customMessage,
        duration: options?.duration || config.duration,
        className:
          'border-2 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]',
      });
    },
    []
  );

  return { celebrate };
};
