import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';

interface FormulaAnalysis {
  success_score: number;
  insights: {
    strengths: string[];
    weaknesses: string[];
    risk_factors: string[];
  };
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    suggestion: string;
    expected_improvement: string;
  }>;
  pattern_analysis: {
    processing_time_optimal: boolean;
    color_combination_effective: boolean;
    damage_prevention_adequate: boolean;
  };
}

interface Formula {
  id: string;
  formula_name: string;
  color_line: string;
  steps: any;
  notes?: string;
}

export function useFormulaAnalyzer() {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Record<string, FormulaAnalysis>>({});

  const analyzeFormulas = async (formulas: Formula[]) => {
    if (!formulas.length) {
      toast.error('No formulas to analyze');
      return;
    }

    setAnalyzing(true);

    try {
      logger.info('Analyzing formulas', 'FormulaAnalyzer', {
        count: formulas.length,
      });

      const { data, error } = await supabase.functions.invoke(
        'ai-formula-analyzer',
        {
          body: { formulas },
        }
      );

      if (error) throw error;

      if (data?.formulas) {
        const analysisMap: Record<string, FormulaAnalysis> = {};
        data.formulas.forEach(
          (f: Formula & { intelligence?: FormulaAnalysis }) => {
            if (f.intelligence) {
              analysisMap[f.id] = f.intelligence;
            }
          }
        );

        setAnalysis(analysisMap);
        logger.info('Formula analysis complete', 'FormulaAnalyzer', {
          analyzed: Object.keys(analysisMap).length,
        });
        toast.success(`Analyzed ${Object.keys(analysisMap).length} formulas`);

      return analysisMap;
      }

      return null;
    } catch (error) {
      logger.error('Formula analysis failed', 'FormulaAnalyzer', error as any);
      toast.error('Failed to analyze formulas');
      return null;
    } finally {
      setAnalyzing(false);
    }
  };

  return {
    analyzing,
    analysis,
    analyzeFormulas,
  };
}
