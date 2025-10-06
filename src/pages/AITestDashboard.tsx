/**
 * AI Test Dashboard - Internal testing and monitoring
 */

import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Play, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { aiTestRunner } from '@/lib/ai/AITestRunner';
import { toast } from 'sonner';

export default function AITestDashboard() {
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    toast.info('Running AI system tests...');
    
    try {
      const results = await aiTestRunner.runFullTest();
      setTestResults(results);
      
      const report = aiTestRunner.generateReport(results.results);
      console.log(report);
      
      if (results.failed === 0) {
        toast.success('All AI tests passed! 🎉');
      } else {
        toast.warning(`${results.failed} test(s) failed`);
      }
    } catch (error) {
      toast.error('Failed to run tests');
      console.error(error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            AI System Testing
          </h1>
          <p className="text-muted-foreground">
            Comprehensive testing and validation of all AI systems
          </p>
        </div>

        {/* Run Tests Button */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Test Suite</CardTitle>
            <CardDescription>
              Run comprehensive tests on all AI systems to ensure everything is working correctly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={runTests} 
              disabled={isRunning}
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-secondary"
            >
              <Play className="mr-2 h-5 w-5" />
              {isRunning ? 'Running Tests...' : 'Run Full Test Suite'}
            </Button>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Test Results</CardTitle>
                <Badge 
                  variant={testResults.failed === 0 ? 'default' : 'destructive'}
                  className="text-sm px-4 py-2"
                >
                  {testResults.passed}/{testResults.passed + testResults.failed} Passed
                </Badge>
              </div>
              <CardDescription>{testResults.summary}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.results.map((result: any, index: number) => (
                  <Card key={index} className={`border-2 ${
                    result.passed 
                      ? 'border-green-500/20 bg-green-500/5' 
                      : 'border-red-500/20 bg-red-500/5'
                  }`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        {result.passed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm mb-1">{result.system}</h3>
                          <p className="text-sm text-muted-foreground">{result.message}</p>
                          {result.details && (
                            <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                              <pre className="overflow-auto">
                                {JSON.stringify(result.details, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-info" />
              Testing Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-semibold text-sm mb-2">What We Test:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>AI Orchestrator initialization and status</li>
                <li>Smart Cache AI pattern tracking and recommendations</li>
                <li>Adaptive Learning AI behavior tracking</li>
                <li>Client Retention AI system readiness</li>
                <li>System status and health monitoring</li>
                <li>Intelligence gathering and data flow</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-2">Expected Results:</h4>
              <p className="text-sm text-muted-foreground">
                All tests should pass (6/6). If any tests fail, check the console logs for detailed error messages.
                The AI systems work together to provide intelligent, adaptive features throughout the application.
              </p>
            </div>

            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="text-sm">
                <strong>Note:</strong> Some tests (like Client Retention AI) require actual user data to show full functionality.
                In a fresh environment, these tests verify system readiness rather than actual data processing.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
