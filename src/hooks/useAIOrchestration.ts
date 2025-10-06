/**
 * Hook to access AI Orchestration system
 */

import { useEffect, useState } from 'react';
import { aiOrchestrator } from '@/lib/ai/AIOrchestrator';
import { useAuth } from './useAuth';

export const useAIOrchestration = () => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [status, setStatus] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Auto-start AI orchestration
    const initAI = async () => {
      await aiOrchestrator.start();
      loadData();
    };

    initAI();

    // Refresh data periodically
    const interval = setInterval(loadData, 60000); // Every minute

    return () => {
      clearInterval(interval);
    };
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    const currentStatus = aiOrchestrator.getStatus();
    setStatus(currentStatus);

    const smartSuggestions = await aiOrchestrator.getSmartSuggestions(user.id);
    setSuggestions(smartSuggestions);
  };

  return {
    suggestions,
    status,
    refresh: loadData,
  };
};
