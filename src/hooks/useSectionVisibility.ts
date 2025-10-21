import { useEffect, useRef, useState } from 'react';
import { analytics } from '@/lib/analytics';
import { Variant } from '@/lib/abTestingSupabase';

interface UseSectionVisibilityOptions {
  sectionName: string;
  variant: Variant;
  threshold?: number;
  enabled?: boolean;
}

export const useSectionVisibility = ({
  sectionName,
  variant,
  threshold = 0.5,
  enabled = true,
}: UseSectionVisibilityOptions) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!enabled || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          
          // Track section visibility only once
          if (!hasTracked.current) {
            hasTracked.current = true;
            analytics.track('section_viewed', {
              variant,
              section: sectionName,
              timestamp: Date.now(),
            });
          }
        }
      },
      { threshold }
    );

    observer.observe(ref.current);

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [sectionName, variant, threshold, enabled]);

  return { ref, isVisible };
};
