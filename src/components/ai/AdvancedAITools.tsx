import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Brain, Users, Lightbulb, Loader2 } from 'lucide-react';
import { logger } from '@/lib/logger';

export function AdvancedAITools() {
  const [activeTab, setActiveTab] = useState('socratic');
  
  // Socratic Analysis state
  const [socraticText, setSocraticText] = useState('');
  const [socraticLoading, setSocraticLoading] = useState(false);
  const [socraticResult, setSocraticResult] = useState('');

  // Strategy Simulator state
  const [strategyDecision, setStrategyDecision] = useState('');
  const [strategyContext, setStrategyContext] = useState('');
  const [strategyLoading, setStrategyLoading] = useState(false);
  const [strategyResult, setStrategyResult] = useState('');

  // Creative Solver state
  const [problem, setProblem] = useState('');
  const [domainA, setDomainA] = useState('');
  const [domainB, setDomainB] = useState('');
  const [creativeLoading, setCreativeLoading] = useState(false);
  const [creativeResult, setCreativeResult] = useState('');

  const handleSocraticAnalysis = async () => {
    if (!socraticText.trim()) {
      toast.error('Please enter text to analyze');
      return;
    }

    if (socraticText.length > 5000) {
      toast.error('Text must be less than 5000 characters');
      return;
    }

    setSocraticLoading(true);
    setSocraticResult('');

    try {
      const { data, error } = await supabase.functions.invoke('socratic-analysis', {
        body: { text: socraticText }
      });

      if (error) {
        logger.error('Socratic analysis error', 'AdvancedAITools', error);
        
        if (error.message?.includes('429')) {
          toast.error('Rate limit exceeded. Please try again in a moment.');
        } else if (error.message?.includes('402')) {
          toast.error('AI credits depleted. Please add credits in Settings.');
        } else {
          toast.error('Failed to analyze text. Please try again.');
        }
        return;
      }

      setSocraticResult(data.analysis);
      toast.success('Analysis complete!');
    } catch (error) {
      logger.error('Unexpected error in Socratic analysis', 'AdvancedAITools', error as Error);
      toast.error('An unexpected error occurred');
    } finally {
      setSocraticLoading(false);
    }
  };

  const handleStrategySimulation = async () => {
    if (!strategyDecision.trim()) {
      toast.error('Please describe the strategic decision');
      return;
    }

    if (strategyDecision.length > 1000) {
      toast.error('Decision description must be less than 1000 characters');
      return;
    }

    setStrategyLoading(true);
    setStrategyResult('');

    try {
      const { data, error } = await supabase.functions.invoke('strategy-simulator', {
        body: { 
          decision: strategyDecision,
          context: strategyContext 
        }
      });

      if (error) {
        logger.error('Strategy simulation error', 'AdvancedAITools', error);
        
        if (error.message?.includes('429')) {
          toast.error('Rate limit exceeded. Please try again in a moment.');
        } else if (error.message?.includes('402')) {
          toast.error('AI credits depleted. Please add credits in Settings.');
        } else {
          toast.error('Failed to run simulation. Please try again.');
        }
        return;
      }

      setStrategyResult(data.simulation);
      toast.success('Simulation complete!');
    } catch (error) {
      logger.error('Unexpected error in strategy simulation', 'AdvancedAITools', error as Error);
      toast.error('An unexpected error occurred');
    } finally {
      setStrategyLoading(false);
    }
  };

  const handleCreativeSolver = async () => {
    if (!problem.trim() || !domainA.trim() || !domainB.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (problem.length > 1000 || domainA.length > 500 || domainB.length > 500) {
      toast.error('Input too long. Problem: max 1000 chars, Domains: max 500 chars each');
      return;
    }

    setCreativeLoading(true);
    setCreativeResult('');

    try {
      const { data, error } = await supabase.functions.invoke('creative-solver', {
        body: { problem, domainA, domainB }
      });

      if (error) {
        logger.error('Creative solver error', 'AdvancedAITools', error);
        
        if (error.message?.includes('429')) {
          toast.error('Rate limit exceeded. Please try again in a moment.');
        } else if (error.message?.includes('402')) {
          toast.error('AI credits depleted. Please add credits in Settings.');
        } else {
          toast.error('Failed to generate solutions. Please try again.');
        }
        return;
      }

      setCreativeResult(data.solutions);
      toast.success('Solutions generated!');
    } catch (error) {
      logger.error('Unexpected error in creative solver', 'AdvancedAITools', error as Error);
      toast.error('An unexpected error occurred');
    } finally {
      setCreativeLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-6 w-6" />
          Advanced AI Analysis Tools
        </CardTitle>
        <CardDescription>
          Powerful AI-driven analysis and strategy tools for salon business decisions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="socratic">
              <Brain className="h-4 w-4 mr-2" />
              Self-Analysis
            </TabsTrigger>
            <TabsTrigger value="strategy">
              <Users className="h-4 w-4 mr-2" />
              Strategy Sim
            </TabsTrigger>
            <TabsTrigger value="creative">
              <Lightbulb className="h-4 w-4 mr-2" />
              Creative Solver
            </TabsTrigger>
          </TabsList>

          <TabsContent value="socratic" className="space-y-4">
            <div>
              <Label htmlFor="socratic-text">Text to Analyze</Label>
              <Textarea
                id="socratic-text"
                placeholder="Paste your email, business plan, client communication, or any text you want to analyze for hidden assumptions and biases..."
                value={socraticText}
                onChange={(e) => setSocraticText(e.target.value)}
                rows={8}
                maxLength={5000}
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-1">
                {socraticText.length}/5000 characters
              </p>
            </div>

            <Button 
              onClick={handleSocraticAnalysis}
              disabled={socraticLoading || !socraticText.trim()}
              className="w-full"
            >
              {socraticLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Text'
              )}
            </Button>

            {socraticResult && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Analysis Results:</h3>
                <div className="whitespace-pre-wrap text-sm">{socraticResult}</div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="strategy" className="space-y-4">
            <div>
              <Label htmlFor="strategy-decision">Strategic Decision</Label>
              <Textarea
                id="strategy-decision"
                placeholder="Describe the strategic decision you're facing (e.g., 'Should I hire a second stylist?' or 'Should I expand my service menu to include skincare?')"
                value={strategyDecision}
                onChange={(e) => setStrategyDecision(e.target.value)}
                rows={4}
                maxLength={1000}
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-1">
                {strategyDecision.length}/1000 characters
              </p>
            </div>

            <div>
              <Label htmlFor="strategy-context">Additional Context (Optional)</Label>
              <Textarea
                id="strategy-context"
                placeholder="Add any relevant data: financials, market research, constraints, goals..."
                value={strategyContext}
                onChange={(e) => setStrategyContext(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>

            <Button 
              onClick={handleStrategySimulation}
              disabled={strategyLoading || !strategyDecision.trim()}
              className="w-full"
            >
              {strategyLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Simulation...
                </>
              ) : (
                'Run Expert Simulation'
              )}
            </Button>

            {strategyResult && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Expert Perspectives:</h3>
                <div className="whitespace-pre-wrap text-sm">{strategyResult}</div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="creative" className="space-y-4">
            <div>
              <Label htmlFor="problem">Problem to Solve</Label>
              <Textarea
                id="problem"
                placeholder="Describe the challenge (e.g., 'How to reduce no-shows' or 'How to attract younger clients')"
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                rows={3}
                maxLength={1000}
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-1">
                {problem.length}/1000 characters
              </p>
            </div>

            <div>
              <Label htmlFor="domainA">Domain A - The Perspective Lens</Label>
              <Input
                id="domainA"
                placeholder="e.g., 'Restaurant hospitality principles' or 'Video game engagement mechanics'"
                value={domainA}
                onChange={(e) => setDomainA(e.target.value)}
                maxLength={500}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="domainB">Domain B - The Toolkit</Label>
              <Input
                id="domainB"
                placeholder="e.g., 'Sports team psychology' or 'Social media algorithms'"
                value={domainB}
                onChange={(e) => setDomainB(e.target.value)}
                maxLength={500}
                className="mt-2"
              />
            </div>

            <Button 
              onClick={handleCreativeSolver}
              disabled={creativeLoading || !problem.trim() || !domainA.trim() || !domainB.trim()}
              className="w-full"
            >
              {creativeLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Solutions...
                </>
              ) : (
                'Generate Creative Solutions'
              )}
            </Button>

            {creativeResult && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Novel Solutions:</h3>
                <div className="whitespace-pre-wrap text-sm">{creativeResult}</div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
