/**
 * Intersection Observer Hook
 * For lazy loading components when they enter viewport
 */

import { useEffect, useRef, useState } from 'react';

interface IntersectionOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useIntersectionObserver(options: IntersectionOptions = {}) {
  const { threshold = 0.1, rootMargin = '50px', triggerOnce = true } = options;

  const ref = useRef<HTMLElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // If triggerOnce and already intersected, skip observer
    if (triggerOnce && hasIntersected) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);

        if (entry.isIntersecting) {
          setHasIntersected(true);
          if (triggerOnce) {
            observer.disconnect();
          }
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, hasIntersected]);

  return { ref, isIntersecting, hasIntersected };
}
