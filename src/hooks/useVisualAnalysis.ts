import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';

interface HairAnalysis {
  condition_score: number;
  damage_level: 'minimal' | 'moderate' | 'severe';
  color_fade_percentage?: number;
  texture: 'fine' | 'medium' | 'coarse';
  porosity: 'low' | 'normal' | 'high';
  recommendations: Array<{
    category: string;
    recommendation: string;
    priority: string;
  }>;
}

export function useVisualAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<HairAnalysis | null>(null);

  const analyzeHairPhoto = async (photoUrl: string, clientId: string, context?: string) => {
    if (!photoUrl || !clientId) {
      toast.error('Photo URL and client ID required');
      return null;
    }

    setAnalyzing(true);
    
    try {
      logger.info('Analyzing hair photo', 'VisualAnalysis', { clientId, context });

      const { data, error } = await supabase.functions.invoke('ai-visual-analysis', {
        body: { 
          photoUrl, 
          clientId, 
          context: context || 'General hair analysis'
        },
      });

      if (error) throw error;

      if (data) {
        setAnalysis(data);
        logger.info('Visual analysis complete', 'VisualAnalysis', { 
          condition: data.condition_score,
          damage: data.damage_level 
        });
        toast.success('Hair analysis complete');
        return data;
      }

      return null;
    } catch (error) {
      logger.error('Visual analysis failed', error);
      toast.error('Our bad 🙏 — Try that again?', {
        description: 'Quick tip: Upload photos in natural light for best results 💡'
      });
      return null;
    } finally {
      setAnalyzing(false);
    }
  };

  return {
    analyzing,
    analysis,
    analyzeHairPhoto,
  };
}
