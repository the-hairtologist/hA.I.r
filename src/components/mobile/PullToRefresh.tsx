/**
 * Pull to Refresh Component
 * Enables pull-to-refresh functionality on mobile devices
 */

import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  pullDistance?: number;
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  pullDistance = 80,
  className,
}) => {
  const [pullStartY, setPullStartY] = useState(0);
  const [pullMoveY, setPullMoveY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canRefresh, setCanRefresh] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      setPullStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (pullStartY === 0 || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - pullStartY;

    if (diff > 0) {
      setPullMoveY(Math.min(diff, pullDistance * 1.5));
      setCanRefresh(diff >= pullDistance);
    }
  };

  const handleTouchEnd = async () => {
    if (canRefresh && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullStartY(0);
    setPullMoveY(0);
    setCanRefresh(false);
  };

  const pullProgress = Math.min(pullMoveY / pullDistance, 1);
  const rotationDegrees = pullProgress * 360;

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-auto', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200"
        style={{
          height: `${pullMoveY}px`,
          opacity: pullProgress,
        }}
      >
        <div
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-full bg-primary/10',
            isRefreshing && 'animate-spin'
          )}
          style={{
            transform: `rotate(${rotationDegrees}deg)`,
          }}
        >
          <RefreshCw
            className={cn(
              'w-5 h-5 text-primary',
              canRefresh && 'text-primary',
              !canRefresh && 'text-muted-foreground'
            )}
          />
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${pullMoveY}px)`,
          transition:
            isRefreshing || pullMoveY === 0 ? 'transform 0.2s' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
};
