/**
 * Rate Limit Warning Hook
 * Track and warn users before hitting AI rate limits
 */

import { useState, useEffect, useCallback } from 'react';
import { log } from '@/lib/logger';

export type RateLimitLevel = 'safe' | 'moderate' | 'critical' | 'exceeded';

export interface RateLimitWarning {
  level: RateLimitLevel;
  message: string;
  callsRemaining: number;
  resetIn: number; // milliseconds until reset
  percentage: number; // 0-100
}

interface RateLimitConfig {
  maxCallsPerMinute?: number;
  warningThreshold?: number; // percentage (0-100)
  criticalThreshold?: number; // percentage (0-100)
}

const DEFAULT_CONFIG: Required<RateLimitConfig> = {
  maxCallsPerMinute: 50,
  warningThreshold: 70, // Warn at 70% usage
  criticalThreshold: 90, // Critical at 90% usage
};

/**
 * Hook to track AI rate limit usage and provide warnings
 */
export function useRateLimitWarning(
  config: RateLimitConfig = {}
): {
  warning: RateLimitWarning | null;
  recordCall: () => void;
  canMakeCall: () => boolean;
  reset: () => void;
} {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const [warning, setWarning] = useState<RateLimitWarning | null>(null);
  const [recentCalls, setRecentCalls] = useState<number[]>([]);
  
  // Clean up old calls (outside 1-minute window)
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      const oneMinuteAgo = now - 60000;
      
      setRecentCalls(prev => {
        const filtered = prev.filter(timestamp => timestamp > oneMinuteAgo);
        
        // Update warning based on filtered calls
        updateWarning(filtered, mergedConfig);
        
        return filtered;
      });
    }, 5000); // Clean up every 5 seconds
    
    return () => clearInterval(cleanupInterval);
  }, [mergedConfig]);
  
  // Update warning when calls change
  useEffect(() => {
    updateWarning(recentCalls, mergedConfig);
  }, [recentCalls, mergedConfig]);
  
  const updateWarning = (calls: number[], config: Required<RateLimitConfig>) => {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Count calls in last minute
    const callsLastMinute = calls.filter(timestamp => timestamp > oneMinuteAgo).length;
    const callsRemaining = Math.max(0, config.maxCallsPerMinute - callsLastMinute);
    const percentage = (callsLastMinute / config.maxCallsPerMinute) * 100;
    
    // Calculate reset time (when oldest call expires)
    const oldestCall = calls[0];
    const resetIn = oldestCall ? Math.max(0, 60000 - (now - oldestCall)) : 0;
    
    // Determine warning level
    let level: RateLimitLevel;
    let message: string;
    
    if (callsLastMinute >= config.maxCallsPerMinute) {
      level = 'exceeded';
      message = 'Rate limit reached. Please wait before making more AI requests.';
    } else if (percentage >= config.criticalThreshold) {
      level = 'critical';
      message = `Only ${callsRemaining} AI requests left this minute. Slow down to avoid rate limit.`;
    } else if (percentage >= config.warningThreshold) {
      level = 'moderate';
      message = `${callsRemaining} AI requests remaining this minute.`;
    } else {
      level = 'safe';
      message = 'AI usage is within normal limits.';
    }
    
    // Only show warning if not safe
    if (level === 'safe') {
      setWarning(null);
    } else {
      setWarning({
        level,
        message,
        callsRemaining,
        resetIn,
        percentage,
      });
      
      log.info(`Rate limit warning: ${level}`, 'useRateLimitWarning', {
        callsLastMinute,
        callsRemaining,
        percentage: percentage.toFixed(1),
      });
    }
  };
  
  const recordCall = useCallback(() => {
    const now = Date.now();
    setRecentCalls(prev => [...prev, now]);
    
    log.info('AI call recorded for rate limit tracking', 'useRateLimitWarning', {
      totalCalls: recentCalls.length + 1,
    });
  }, [recentCalls.length]);
  
  const canMakeCall = useCallback((): boolean => {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const callsLastMinute = recentCalls.filter(timestamp => timestamp > oneMinuteAgo).length;
    
    return callsLastMinute < mergedConfig.maxCallsPerMinute;
  }, [recentCalls, mergedConfig.maxCallsPerMinute]);
  
  const reset = useCallback(() => {
    setRecentCalls([]);
    setWarning(null);
    log.info('Rate limit tracking reset', 'useRateLimitWarning');
  }, []);
  
  return {
    warning,
    recordCall,
    canMakeCall,
    reset,
  };
}

/**
 * Get color for rate limit level
 */
export function getRateLimitColor(level: RateLimitLevel): string {
  switch (level) {
    case 'safe':
      return 'text-success';
    case 'moderate':
      return 'text-warning';
    case 'critical':
      return 'text-destructive';
    case 'exceeded':
      return 'text-destructive';
    default:
      return 'text-muted-foreground';
  }
}

/**
 * Format reset time as human-readable string
 */
export function formatResetTime(milliseconds: number): string {
  const seconds = Math.ceil(milliseconds / 1000);
  
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }
  
  return `${minutes}m ${remainingSeconds}s`;
}
