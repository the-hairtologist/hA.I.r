/**
 * Smooth Scroll Utilities
 * Provides smooth scrolling and scroll-based animations
 */

import { useEffect, useState, useCallback } from "react";

/**
 * Detects if element is in viewport
 */
export const useInView = (ref: React.RefObject<Element>, options?: IntersectionObserverInit) => {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, options);

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isInView;
};

/**
 * Tracks scroll progress (0-1)
 */
export const useScrollProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrolled = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = height > 0 ? scrolled / height : 0;
      setProgress(Math.min(Math.max(progress, 0), 1));
    };

    window.addEventListener("scroll", updateProgress);
    updateProgress();

    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return progress;
};

/**
 * Smooth scroll to element or position
 */
export const useSmoothScroll = () => {
  const scrollTo = useCallback((
    target: number | string | Element,
    options?: ScrollIntoViewOptions
  ) => {
    if (typeof target === "number") {
      window.scrollTo({
        top: target,
        behavior: "smooth",
      });
    } else if (typeof target === "string") {
      const element = document.querySelector(target);
      element?.scrollIntoView({
        behavior: "smooth",
        block: "start",
        ...options,
      });
    } else {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
        ...options,
      });
    }
  }, []);

  const scrollToTop = useCallback(() => {
    scrollTo(0);
  }, [scrollTo]);

  return { scrollTo, scrollToTop };
};

/**
 * Detects scroll direction
 */
export const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(null);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      
      if (scrollY > lastScrollY) {
        setScrollDirection("down");
      } else if (scrollY < lastScrollY) {
        setScrollDirection("up");
      }

      setLastScrollY(scrollY);
    };

    window.addEventListener("scroll", updateScrollDirection);
    return () => window.removeEventListener("scroll", updateScrollDirection);
  }, [lastScrollY]);

  return scrollDirection;
};

/**
 * Show/hide element based on scroll position
 */
export const useScrollThreshold = (threshold: number = 100) => {
  const [isAboveThreshold, setIsAboveThreshold] = useState(false);

  useEffect(() => {
    const updateThreshold = () => {
      setIsAboveThreshold(window.scrollY > threshold);
    };

    window.addEventListener("scroll", updateThreshold);
    updateThreshold();

    return () => window.removeEventListener("scroll", updateThreshold);
  }, [threshold]);

  return isAboveThreshold;
};