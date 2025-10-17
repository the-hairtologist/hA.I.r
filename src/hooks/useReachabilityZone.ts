import { useState, useEffect } from 'react';

export type ReachabilityZone = 'green' | 'yellow' | 'red';

export interface ReachabilityState {
  zone: ReachabilityZone;
  height: number;
  isOneHandedMode: boolean;
}

/**
 * Hook to detect thumb reachability zones for one-handed mobile use
 * Green zone: Bottom 40% (easy reach)
 * Yellow zone: Middle 30% (requires stretch)
 * Red zone: Top 30% (hard to reach)
 */
export const useReachabilityZone = () => {
  const [state, setState] = useState<ReachabilityState>({
    zone: 'green',
    height: window.innerHeight,
    isOneHandedMode: window.innerWidth < 768, // Mobile detection
  });

  useEffect(() => {
    const updateReachability = () => {
      const height = window.innerHeight;
      const isMobile = window.innerWidth < 768;
      
      setState({
        zone: 'green',
        height,
        isOneHandedMode: isMobile,
      });
    };

    updateReachability();
    window.addEventListener('resize', updateReachability);
    window.addEventListener('orientationchange', updateReachability);

    return () => {
      window.removeEventListener('resize', updateReachability);
      window.removeEventListener('orientationchange', updateReachability);
    };
  }, []);

  /**
   * Calculate which zone an element is in based on its position
   */
  const getZoneForPosition = (yPosition: number): ReachabilityZone => {
    const { height } = state;
    const greenThreshold = height * 0.6; // Bottom 40%
    const yellowThreshold = height * 0.3; // Top 30%

    if (yPosition >= greenThreshold) return 'green';
    if (yPosition >= yellowThreshold) return 'yellow';
    return 'red';
  };

  /**
   * Get recommended position for critical actions
   */
  const getOptimalActionPosition = () => {
    return {
      bottom: '5vh', // Green zone
      position: 'fixed' as const,
    };
  };

  return {
    ...state,
    getZoneForPosition,
    getOptimalActionPosition,
  };
};
