/**
 * Error Boundary Debugger
 * Admin-only tool for testing and verifying error boundaries
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertTriangle,
  Bug,
  CheckCircle2,
  XCircle,
  Zap,
  Network,
  Clock,
  Database,
  BarChart3,
} from 'lucide-react';
import {
  throwTestError,
  throwAsyncError,
  errorScenarios,
  type ErrorType,
} from '@/lib/errors/errorBoundaryTesting';
import { toast } from 'sonner';

export const ErrorBoundaryDebugger = () => {
  const [testResults, setTestResults] = useState<Array<{
    type: string;
    status: 'pending' | 'success' | 'error';
    message?: string;
  }>>([]);

  const runTest = async (type: ErrorType, description: string) => {
    const testId = `test-${type}-${Date.now()}`;
    
    setTestResults(prev => [...prev, {
      type: description,
      status: 'pending',
    }]);

    try {
      // This should be caught by error boundary
      throwTestError(type);
      
      // If we reach here, error boundary failed
      setTestResults(prev => prev.map(t =>
        t.type === description ? { ...t, status: 'error' as const, message: 'Not caught' } : t
      ));
    } catch (error) {
      // Expected - error boundary should catch it
      setTestResults(prev => prev.map(t =>
        t.type === description ? { ...t, status: 'success' as const, message: 'Caught successfully' } : t
      ));
    }
  };

  const triggerScenario = (scenarioName: keyof typeof errorScenarios) => {
    try {
      errorScenarios[scenarioName]();
      toast.error(`Triggered: ${scenarioName}`);
    } catch (error) {
      toast.error('Error boundary should catch this!');
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Card className="border-[3px] border-foreground shadow-[5px_5px_0px_0px_hsl(var(--foreground))]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Error Boundary Debugger
            </CardTitle>
            <CardDescription>
              Test error boundaries and verify coverage (Dev/Admin Only)
            </CardDescription>
          </div>
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Testing Tool
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="triggers" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="triggers">Error Triggers</TabsTrigger>
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
            <TabsTrigger value="results">
              Results {testResults.length > 0 && `(${testResults.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="triggers" className="space-y-4 mt-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                These buttons trigger errors that should be caught by error boundaries.
                If you see an uncaught error, there's a gap in coverage.
              </AlertDescription>
            </Alert>

            <div className="grid sm:grid-cols-2 gap-3">
              <Button
                onClick={() => runTest('render', 'Render Error')}
                variant="outline"
                className="justify-start gap-2 h-auto py-3"
              >
                <Zap className="h-4 w-4 text-destructive" />
                <div className="text-left">
                  <div className="font-semibold">Render Error</div>
                  <div className="text-xs text-muted-foreground">
                    Component rendering failure
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => runTest('async', 'Async Error')}
                variant="outline"
                className="justify-start gap-2 h-auto py-3"
              >
                <Clock className="h-4 w-4 text-orange-500" />
                <div className="text-left">
                  <div className="font-semibold">Async Error</div>
                  <div className="text-xs text-muted-foreground">
                    Promise rejection
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => runTest('network', 'Network Error')}
                variant="outline"
                className="justify-start gap-2 h-auto py-3"
              >
                <Network className="h-4 w-4 text-yellow-500" />
                <div className="text-left">
                  <div className="font-semibold">Network Error</div>
                  <div className="text-xs text-muted-foreground">
                    Failed fetch request
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => runTest('data', 'Data Error')}
                variant="outline"
                className="justify-start gap-2 h-auto py-3"
              >
                <Database className="h-4 w-4 text-blue-500" />
                <div className="text-left">
                  <div className="font-semibold">Data Error</div>
                  <div className="text-xs text-muted-foreground">
                    Data fetch failure
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => runTest('timeout', 'Timeout Error')}
                variant="outline"
                className="justify-start gap-2 h-auto py-3"
              >
                <Clock className="h-4 w-4 text-purple-500" />
                <div className="text-left">
                  <div className="font-semibold">Timeout Error</div>
                  <div className="text-xs text-muted-foreground">
                    Request timeout
                  </div>
                </div>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="scenarios" className="space-y-4 mt-4">
            <Alert>
              <BarChart3 className="h-4 w-4" />
              <AlertDescription>
                Complex error scenarios to test recovery mechanisms
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Button
                onClick={() => triggerScenario('renderError')}
                variant="outline"
                className="w-full justify-start"
              >
                Simple Render Failure
              </Button>
              <Button
                onClick={() => triggerScenario('networkFailure')}
                variant="outline"
                className="w-full justify-start"
              >
                Network Connection Lost
              </Button>
              <Button
                onClick={() => triggerScenario('dataFetchError')}
                variant="outline"
                className="w-full justify-start"
              >
                Data Fetch Failure
              </Button>
              <Button
                onClick={() => triggerScenario('intermittentError')}
                variant="outline"
                className="w-full justify-start"
              >
                Intermittent Error (50% chance)
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4 mt-4">
            {testResults.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No tests run yet. Switch to "Error Triggers" tab to run tests.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {testResults.filter(t => t.status === 'success').length} / {testResults.length} tests passed
                  </div>
                  <Button onClick={clearResults} variant="ghost" size="sm">
                    Clear Results
                  </Button>
                </div>

                <div className="space-y-2">
                  {testResults.map((result, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border-2"
                    >
                      <div className="flex items-center gap-3">
                        {result.status === 'success' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : result.status === 'error' ? (
                          <XCircle className="h-4 w-4 text-destructive" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-500 animate-spin" />
                        )}
                        <div>
                          <div className="font-medium">{result.type}</div>
                          {result.message && (
                            <div className="text-xs text-muted-foreground">
                              {result.message}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant={
                          result.status === 'success'
                            ? 'default'
                            : result.status === 'error'
                              ? 'destructive'
                              : 'secondary'
                        }
                      >
                        {result.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
