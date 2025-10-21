import { useEffect, useRef } from 'react';
import { analytics } from '@/lib/analytics';

interface UseScrollDepthTrackingOptions {
  enabled?: boolean;
}

export const useScrollDepthTracking = ({ enabled = true }: UseScrollDepthTrackingOptions) => {
  const tracked = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!enabled) return;

    const handleScroll = () => {
      const scrollPercent = Math.floor(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );

      // Track milestones: 25%, 50%, 75%, 100%
      const milestones = [25, 50, 75, 100];
      milestones.forEach((milestone) => {
        if (scrollPercent >= milestone && !tracked.current.has(milestone)) {
          tracked.current.add(milestone);
          analytics.track('scroll_depth_reached', {
            depth: milestone,
            timestamp: Date.now(),
          });
        }
      });
    };

    // Throttle scroll events
    let ticking = false;
    const scrollListener = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', scrollListener, { passive: true });
    return () => window.removeEventListener('scroll', scrollListener);
  }, [enabled]);

  return { maxDepth: Math.max(...Array.from(tracked.current), 0) };
};
