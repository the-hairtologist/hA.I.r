import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logging/productionLogger';

interface Recommendation {
  title: string;
  priority: 'high' | 'medium' | 'low';
  formula: string;
  reasoning: string;
  expectedResult?: string;
  processingTime?: string;
  developVolume?: string;
  concerns?: string[];
}

interface RecommendationResult {
  recommendations: Recommendation[];
  insights?: string[];
  notes?: string;
  rawText?: string;
}

export const useFormulaRecommendations = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] =
    useState<RecommendationResult | null>(null);
  const { toast } = useToast();

  const generateRecommendations = async (
    clientId: string,
    stylistId: string
  ) => {
    setIsGenerating(true);
    setRecommendations(null);

    try {
      const { data, error } = await supabase.functions.invoke(
        'generate-formula-recommendations',
        {
          body: { clientId, stylistId },
        }
      );

      if (error) {
        logger.error('Recommendation error', error, {
          context: 'useFormulaRecommendations',
          data: { clientId, stylistId },
        });
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.success) {
        throw new Error('Failed to generate recommendations');
      }

      setRecommendations(data.recommendations);

      toast({
        title: 'Recommendations Ready',
        description: `Generated ${data.recommendations?.recommendations?.length || 0} formula suggestions`,
      });

      return data.recommendations;
    } catch (error: any) {
      logger.error('Formula recommendations error', error, {
        context: 'useFormulaRecommendations',
        data: { clientId, stylistId },
      });

      let errorMessage = 'Failed to generate recommendations';

      if (error.message?.includes('Rate limit')) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (
        error.message?.includes('credits exhausted') ||
        error.message?.includes('402')
      ) {
        errorMessage = 'AI credits exhausted. Please add credits to continue.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: 'Generation Failed',
        description: errorMessage,
        variant: 'destructive',
      });

      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchInsights = async (stylistId: string, clientId?: string) => {
    try {
      let query = supabase
        .from('ai_insights')
        .select('*')
        .eq('stylist_id', stylistId)
        .eq('is_dismissed', false)
        .order('created_at', { ascending: false });

      if (clientId) {
        query = query.contains('affected_clients', [clientId]);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error('Error fetching insights', error, {
        context: 'useFormulaRecommendations',
        data: { stylistId, clientId },
      });
      toast({
        title: 'Error',
        description: 'Failed to load insights',
        variant: 'destructive',
      });
      return [];
    }
  };

  const dismissInsight = async (insightId: string) => {
    try {
      const { error } = await supabase
        .from('ai_insights')
        .update({
          is_dismissed: true,
          dismissed_at: new Date().toISOString(),
        })
        .eq('id', insightId);

      if (error) throw error;

      toast({
        title: 'Insight Dismissed',
        description: 'The recommendation has been dismissed',
      });
    } catch (error) {
      logger.error('Error dismissing insight', error, {
        context: 'useFormulaRecommendations',
        data: { insightId },
      });
      toast({
        title: 'Error',
        description: 'Failed to dismiss insight',
        variant: 'destructive',
      });
    }
  };

  return {
    generateRecommendations,
    fetchInsights,
    dismissInsight,
    isGenerating,
    recommendations,
  };
};
