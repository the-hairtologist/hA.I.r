import { useEffect, useState } from 'react';

interface UseCounterOptions {
  start?: number;
  end: number;
  duration?: number;
  isActive?: boolean;
}

export const useCounter = ({ start = 0, end, duration = 1500, isActive = false }: UseCounterOptions) => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    if (!isActive) return;

    const startTime = Date.now();
    const endTime = startTime + duration;

    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = endTime - now;

      if (remaining <= 0) {
        setCount(end);
        clearInterval(timer);
      } else {
        const progress = 1 - remaining / duration;
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(start + (end - start) * eased));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [start, end, duration, isActive]);

  return count;
};
