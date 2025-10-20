/**
 * A/B Testing Dashboard (Admin Only)
 * View and analyze landing page conversion test results
 */

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getResults, getConversionRate, getWinningVariant, resetABTest, VARIANTS } from "@/lib/abTesting";
import { BarChart, TrendingUp, Trophy, RefreshCw, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ABTestDashboard() {
  const [results, setResults] = useState(getResults());
  const [winner, setWinner] = useState(getWinningVariant());

  const refreshData = () => {
    setResults(getResults());
    setWinner(getWinningVariant());
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all A/B test data? This cannot be undone.")) {
      resetABTest();
      refreshData();
    }
  };

  useEffect(() => {
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

  const rateA = getConversionRate('A');
  const rateB = getConversionRate('B');

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl xs:text-3xl sm:text-4xl font-pixel uppercase text-foreground mb-2 leading-tight">
              A/B TEST DASHBOARD
            </h1>
            <p className="text-sm xs:text-base font-sans text-muted-foreground">
              Landing page conversion optimization results
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={refreshData}
              variant="outline"
              size="sm"
              className="font-pixel text-xs"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              REFRESH
            </Button>
            <Button
              onClick={handleReset}
              variant="destructive"
              size="sm"
              className="font-pixel text-xs"
            >
              RESET DATA
            </Button>
          </div>
        </div>

        {/* Statistical Significance Alert */}
        {!winner && (results.A.views > 0 || results.B.views > 0) && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-sans text-sm">
              Need at least 100 views per variant for statistical significance. 
              Keep testing! (A: {results.A.views}/100 | B: {results.B.views}/100)
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
                    VARIANT {winner.variant} WINS!
                  </CardTitle>
                  <CardDescription className="font-sans">
                    {winner.confidence.toFixed(1)}% better conversion rate
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
                <Badge variant={winner?.variant === 'A' ? 'default' : 'secondary'} className="font-pixel text-xs">
                  {winner?.variant === 'A' ? 'WINNER' : 'TESTING'}
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
                  <p className="font-pixel text-2xl text-primary">{results.A.views}</p>
                  <p className="font-sans text-xs text-muted-foreground">Views</p>
                </div>
                <div className="border-[2px] border-primary bg-primary/10 p-3 text-center">
                  <p className="font-pixel text-2xl text-primary">{results.A.conversions}</p>
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
                <Badge variant={winner?.variant === 'B' ? 'default' : 'secondary'} className="font-pixel text-xs">
                  {winner?.variant === 'B' ? 'WINNER' : 'TESTING'}
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
                  <p className="font-pixel text-2xl text-secondary">{results.B.views}</p>
                  <p className="font-sans text-xs text-muted-foreground">Views</p>
                </div>
                <div className="border-[2px] border-secondary bg-secondary/10 p-3 text-center">
                  <p className="font-pixel text-2xl text-secondary">{results.B.conversions}</p>
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
                <p className="font-pixel text-3xl text-foreground">{results.A.views + results.B.views}</p>
                <p className="font-sans text-sm text-muted-foreground">Total Views</p>
              </div>
              <div className="text-center">
                <p className="font-pixel text-3xl text-foreground">{results.A.conversions + results.B.conversions}</p>
                <p className="font-sans text-sm text-muted-foreground">Total Signups</p>
              </div>
              <div className="text-center">
                <p className="font-pixel text-3xl text-accent">
                  {((results.A.conversions + results.B.conversions) / (results.A.views + results.B.views) * 100 || 0).toFixed(1)}%
                </p>
                <p className="font-sans text-sm text-muted-foreground">Avg Rate</p>
              </div>
              <div className="text-center">
                <p className="font-pixel text-3xl text-primary">
                  {Math.abs(rateA - rateB).toFixed(1)}%
                </p>
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
              {!winner && <li>• Keep testing until you reach 100 views per variant for statistical significance</li>}
              {winner && winner.confidence < 20 && <li>• Winner declared, but confidence is low. Consider testing longer.</li>}
              {winner && winner.confidence >= 20 && (
                <>
                  <li>• Strong winner identified! Consider implementing Variant {winner.variant} permanently.</li>
                  <li>• Create new variants to test further improvements (different value props, CTAs, visuals)</li>
                </>
              )}
              <li>• Test one element at a time for clearer insights (headline OR CTA, not both)</li>
              <li>• Review analytics to see if quality of signups differs between variants</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
