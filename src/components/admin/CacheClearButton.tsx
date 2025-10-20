/**
 * Cache Clear Button
 * Admin utility to manually clear all application caches
 */

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cacheOptimizer } from '@/lib/selfHealing/CacheOptimizer';
import { toast } from 'sonner';

export const CacheClearButton = () => {
  const [isClearing, setIsClearing] = useState(false);

  const handleClearCache = async () => {
    setIsClearing(true);
    
    try {
      // Clear all caches
      cacheOptimizer.clearAll();
      
      // Show success
      toast.success('All caches cleared!', {
        description: 'The app will now fetch fresh data',
      });
      
      // Reload to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error('Failed to clear cache', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsClearing(false);
    }
  };

  const showCacheStats = () => {
    const stats = cacheOptimizer.getStats();
    toast.info('Cache Statistics', {
      description: `Query Cache: ${stats.queryCache} | React Query: ${stats.reactQuery} | Total: ${stats.total}`,
      duration: 5000,
    });
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={showCacheStats}
      >
        View Cache Stats
      </Button>
      
      <Button
        variant="destructive"
        size="sm"
        onClick={handleClearCache}
        disabled={isClearing}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isClearing ? 'animate-spin' : ''}`} />
        {isClearing ? 'Clearing...' : 'Clear All Caches'}
      </Button>
    </div>
  );
};
