import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, Activity, TrendingUp, Shield, Sparkles } from 'lucide-react';
import { aiOrchestrator } from '@/lib/ai/AIOrchestrator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const AICommandCenter = () => {
  const [status, setStatus] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isStarting, setIsStarting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadStatus();
    if (user) {
      loadSuggestions();
    }
  }, [user]);

  const loadStatus = () => {
    const currentStatus = aiOrchestrator.getStatus();
    setStatus(currentStatus);
  };

  const loadSuggestions = async () => {
    if (!user) return;
    const smartSuggestions = await aiOrchestrator.getSmartSuggestions(user.id);
    setSuggestions(smartSuggestions);
  };

  const handleStart = async () => {
    setIsStarting(true);
    try {
      await aiOrchestrator.start();
      loadStatus();
      toast({
        title: "AI Systems Activated",
        description: "All AI systems are now working together intelligently",
      });
    } catch (error) {
      toast({
        title: "Failed to start AI systems",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setIsStarting(false);
    }
  };

  const handleStop = () => {
    aiOrchestrator.stop();
    loadStatus();
    toast({
      title: "AI Systems Stopped",
      description: "All AI systems have been deactivated",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">AI Command Center</CardTitle>
                <CardDescription>
                  Deep AI integration orchestrating all intelligent systems
                </CardDescription>
              </div>
            </div>
            <Badge variant={status?.running ? "default" : "secondary"} className="text-sm px-4 py-2">
              {status?.running ? (
                <><Activity className="h-4 w-4 mr-2 animate-pulse" /> Active</>
              ) : (
                'Inactive'
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!status?.running ? (
            <Button 
              onClick={handleStart} 
              disabled={isStarting}
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              {isStarting ? 'Activating AI Systems...' : 'Activate AI Intelligence'}
            </Button>
          ) : (
            <Button 
              onClick={handleStop} 
              variant="outline"
              size="lg"
              className="w-full"
            >
              Stop AI Systems
            </Button>
          )}

          {status?.running && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-green-500/20 bg-green-500/5">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Retention AI</span>
                    </div>
                    <p className="text-2xl font-bold text-green-500 mt-2">Active</p>
                  </CardContent>
                </Card>

                <Card className="border-blue-500/20 bg-blue-500/5">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Cache AI</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-500 mt-2">Active</p>
                  </CardContent>
                </Card>

                <Card className="border-purple-500/20 bg-purple-500/5">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Behavior AI</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-500 mt-2">Active</p>
                  </CardContent>
                </Card>

                <Card className="border-orange-500/20 bg-orange-500/5">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">Health AI</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-500 mt-2">Active</p>
                  </CardContent>
                </Card>
              </div>

              {suggestions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      AI Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-muted-foreground">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <p className="text-sm font-medium">🎯 Active Capabilities:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Continuous performance monitoring & optimization</li>
                  <li>• Predictive client retention analysis</li>
                  <li>• Adaptive user behavior learning</li>
                  <li>• Automatic cache optimization</li>
                  <li>• Self-healing error recovery</li>
                  <li>• Cross-system intelligence sharing</li>
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
