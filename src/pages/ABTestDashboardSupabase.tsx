/**
 * A/B Testing Dashboard with Supabase Backend (Admin Only)
 * View and analyze landing page conversion test results
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VARIANTS, initializeExperiment, getExperimentResults } from "@/lib/abTestingSupabase";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, TrendingUp, Trophy, RefreshCw, AlertCircle, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface ExperimentResult {
  variant_key: string;
  views: number;
  conversions: number;
  conversion_rate: number;
}

export default function ABTestDashboardSupabase() {
  const navigate = useNavigate();
  const [activeExperiment, setActiveExperiment] = useState<any>(null);
  const [results, setResults] = useState<ExperimentResult[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      // Get active experiment
      const { data: experiment } = await supabase
        .from('ab_experiments' as any)
        .select('*')
        .eq('is_active', true)
        .single();

      if (experiment) {
        setActiveExperiment(experiment);
        
        // Get results
        const resultsData = await getExperimentResults((experiment as any).id);
        setResults(resultsData || []);
      } else {
        setActiveExperiment(null);
        setResults([]);
      }
    } catch (error) {
      console.error('Error loading A/B test data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExperiment = async () => {
    setLoading(true);
    const experimentId = await initializeExperiment(
      "Landing Page Hero Test",
      "Testing pain-focused vs aspiration-focused headlines"
    );
    
    if (experimentId) {
      toast.success("✅ New A/B test experiment created!");
      await loadData();
    } else {
      toast.error("Failed to create experiment");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-[4px] border-primary border-t-transparent animate-spin mx-auto mb-4"></div>
            <p className="font-pixel text-sm text-muted-foreground">LOADING...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!activeExperiment) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="w-20 h-20 border-[4px] border-primary bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <BarChart className="h-10 w-10 text-primary" />
          </div>
          
          <h1 className="font-pixel text-2xl text-foreground mb-4 uppercase">NO ACTIVE A/B TEST</h1>
          <p className="font-sans text-muted-foreground mb-8">
            Create a new experiment to start testing landing page variants
          </p>
          
          <Button
            onClick={handleCreateExperiment}
            className="font-pixel text-xs uppercase"
          >
            <Plus className="h-4 w-4 mr-2" />
            CREATE EXPERIMENT
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const resultA = results.find(r => r.variant_key === 'A');
  const resultB = results.find(r => r.variant_key === 'B');
  const rateA = resultA?.conversion_rate || 0;
  const rateB = resultB?.conversion_rate || 0;

  const viewsA = resultA?.views || 0;
  const viewsB = resultB?.views || 0;
  const totalViews = viewsA + viewsB;

  const conversionsA = resultA?.conversions || 0;
  const conversionsB = resultB?.conversions || 0;
  const totalConversions = conversionsA + conversionsB;

  const avgRate = totalViews > 0 ? (totalConversions / totalViews * 100) : 0;
  const hasSignificance = viewsA >= 100 && viewsB >= 100;
  
  let winner: 'A' | 'B' | null = null;
  let confidence = 0;
  
  if (hasSignificance) {
    winner = rateA > rateB ? 'A' : 'B';
    const winnerRate = Math.max(rateA, rateB);
    const loserRate = Math.min(rateA, rateB);
    confidence = loserRate > 0 ? ((winnerRate - loserRate) / loserRate) * 100 : 100;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl xs:text-3xl sm:text-4xl font-pixel uppercase text-foreground mb-2 leading-tight">
              A/B TEST RESULTS
            </h1>
            <p className="text-sm xs:text-base font-sans text-muted-foreground">
              {(activeExperiment as any).name}
            </p>
          </div>
          
          <Button
            onClick={loadData}
            variant="outline"
            size="sm"
            className="font-pixel text-xs"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            REFRESH
          </Button>
        </div>

        {/* Statistical Significance Alert */}
        {!hasSignificance && totalViews > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-sans text-sm">
              Need at least 100 views per variant for statistical significance. 
              Keep testing! (A: {viewsA}/100 | B: {viewsB}/100)
            </AlertDescription>
          </Alert>
        )}

        {/* Winner Announcement */}
        {winner && (
          <Card className="border-[3px] border-accent bg-accent/10">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 border-[3px] border-accent bg-accent flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <CardTitle className="font-pixel text-xl uppercase text-accent">
                    VARIANT {winner} WINS!
                  </CardTitle>
                  <CardDescription className="font-sans">
                    {confidence.toFixed(1)}% better conversion rate
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Variant Comparison */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Variant A */}
          <Card className="border-[3px] border-black">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 border-[3px] border-primary bg-primary flex items-center justify-center">
                    <span className="font-pixel text-primary-foreground">A</span>
                  </div>
                  <CardTitle className="font-pixel text-lg uppercase">VARIANT A</CardTitle>
                </div>
                <Badge variant={winner === 'A' ? 'default' : 'secondary'} className="font-pixel text-xs">
                  {winner === 'A' ? 'WINNER' : 'TESTING'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Copy Preview */}
              <div className="border-[2px] border-border p-3 bg-muted/30">
                <p className="font-pixel text-xs text-muted-foreground mb-2">HEADLINE:</p>
                <p className="font-sans text-sm font-bold">{VARIANTS.A.hero.headline}</p>
                <p className="font-pixel text-xs text-muted-foreground mt-3 mb-2">CTA:</p>
                <p className="font-sans text-sm">{VARIANTS.A.cta.primary}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="border-[2px] border-primary bg-primary/10 p-3 text-center">
                  <p className="font-pixel text-2xl text-primary">{viewsA}</p>
                  <p className="font-sans text-xs text-muted-foreground">Views</p>
                </div>
                <div className="border-[2px] border-primary bg-primary/10 p-3 text-center">
                  <p className="font-pixel text-2xl text-primary">{conversionsA}</p>
                  <p className="font-sans text-xs text-muted-foreground">Signups</p>
                </div>
                <div className="border-[2px] border-accent bg-accent/10 p-3 text-center">
                  <p className="font-pixel text-2xl text-accent">{rateA.toFixed(1)}%</p>
                  <p className="font-sans text-xs text-muted-foreground">Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Variant B */}
          <Card className="border-[3px] border-black">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 border-[3px] border-secondary bg-secondary flex items-center justify-center">
                    <span className="font-pixel text-secondary-foreground">B</span>
                  </div>
                  <CardTitle className="font-pixel text-lg uppercase">VARIANT B</CardTitle>
                </div>
                <Badge variant={winner === 'B' ? 'default' : 'secondary'} className="font-pixel text-xs">
                  {winner === 'B' ? 'WINNER' : 'TESTING'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Copy Preview */}
              <div className="border-[2px] border-border p-3 bg-muted/30">
                <p className="font-pixel text-xs text-muted-foreground mb-2">HEADLINE:</p>
                <p className="font-sans text-sm font-bold">{VARIANTS.B.hero.headline}</p>
                <p className="font-pixel text-xs text-muted-foreground mt-3 mb-2">CTA:</p>
                <p className="font-sans text-sm">{VARIANTS.B.cta.primary}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="border-[2px] border-secondary bg-secondary/10 p-3 text-center">
                  <p className="font-pixel text-2xl text-secondary">{viewsB}</p>
                  <p className="font-sans text-xs text-muted-foreground">Views</p>
                </div>
                <div className="border-[2px] border-secondary bg-secondary/10 p-3 text-center">
                  <p className="font-pixel text-2xl text-secondary">{conversionsB}</p>
                  <p className="font-sans text-xs text-muted-foreground">Signups</p>
                </div>
                <div className="border-[2px] border-accent bg-accent/10 p-3 text-center">
                  <p className="font-pixel text-2xl text-accent">{rateB.toFixed(1)}%</p>
                  <p className="font-sans text-xs text-muted-foreground">Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overall Stats */}
        <Card className="border-[3px] border-black">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border-[3px] border-foreground bg-accent flex items-center justify-center">
                <BarChart className="h-5 w-5 text-accent-foreground" />
              </div>
              <CardTitle className="font-pixel text-lg uppercase">COMBINED STATS</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="font-pixel text-3xl text-foreground">{totalViews}</p>
                <p className="font-sans text-sm text-muted-foreground">Total Views</p>
              </div>
              <div className="text-center">
                <p className="font-pixel text-3xl text-foreground">{totalConversions}</p>
                <p className="font-sans text-sm text-muted-foreground">Total Signups</p>
              </div>
              <div className="text-center">
                <p className="font-pixel text-3xl text-accent">{avgRate.toFixed(1)}%</p>
                <p className="font-sans text-sm text-muted-foreground">Avg Rate</p>
              </div>
              <div className="text-center">
                <p className="font-pixel text-3xl text-primary">{Math.abs(rateA - rateB).toFixed(1)}%</p>
                <p className="font-sans text-sm text-muted-foreground">Difference</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="border-[3px] border-black bg-muted/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border-[3px] border-primary bg-primary flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary-foreground" />
              </div>
              <CardTitle className="font-pixel text-lg uppercase">NEXT STEPS</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 font-sans text-sm text-foreground">
              {!hasSignificance && <li>• Keep testing until you reach 100 views per variant for statistical significance</li>}
              {winner && confidence < 20 && <li>• Winner declared, but confidence is low. Consider testing longer.</li>}
              {winner && confidence >= 20 && (
                <>
                  <li>• Strong winner identified! Consider implementing Variant {winner} permanently.</li>
                  <li>• Create new variants to test further improvements (different value props, CTAs, visuals)</li>
                </>
              )}
              <li>• Test one element at a time for clearer insights (headline OR CTA, not both)</li>
              <li>• Review conversion quality: Are variant signups converting to paid users?</li>
              <li>• Consider testing: Social proof placement, phone mockup, trust badges</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
