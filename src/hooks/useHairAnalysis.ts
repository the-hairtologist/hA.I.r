import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logging/productionLogger';

interface AnalysisResult {
  analysisId: string;
  analysis: {
    fullText: string;
    sections: Record<string, string>;
    analyzedAt: string;
  };
  rawAnalysis: string;
}

export const useHairAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const analyzePhoto = async (imageUrl: string, clientId?: string) => {
    setIsAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke(
        'analyze-hair-photo',
        {
          body: { imageUrl, clientId },
        }
      );

      if (error) {
        logger.error('Hair photo analysis error', error, {
          component: 'useHairAnalysis',
          clientId,
        });
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.success) {
        throw new Error('Analysis failed - no data returned');
      }

      setResult({
        analysisId: data.analysisId,
        analysis: data.analysis,
        rawAnalysis: data.rawAnalysis,
      });

      toast({
        title: 'Analysis Complete',
        description: 'AI has analyzed the hair photo successfully.',
      });

      return data;
    } catch (error: any) {
      logger.error('Hair analysis error', error, {
        component: 'useHairAnalysis',
        clientId,
      });

      let errorMessage = 'Failed to analyze photo';

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
        title: 'Analysis Failed',
        description: errorMessage,
        variant: 'destructive',
      });

      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fetchAnalysisHistory = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('hair_analysis_results')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error('Error fetching analysis history', error, {
        component: 'useHairAnalysis',
        clientId,
      });
      toast({
        title: 'Error',
        description: 'Failed to load analysis history',
        variant: 'destructive',
      });
      return [];
    }
  };

  return {
    analyzePhoto,
    fetchAnalysisHistory,
    isAnalyzing,
    result,
  };
};
