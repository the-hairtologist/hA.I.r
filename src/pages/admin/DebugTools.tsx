/**
 * Admin Debug Tools Page
 * Provides debugging utilities for development and troubleshooting
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logging/productionLogger';
import { userJourney } from '@/lib/logging/userJourneyTracker';
import { Bug, Zap, Database, Activity, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export default function DebugTools() {
  const { toast } = useToast();
  const [testResults, setTestResults] = useState<Array<{ test: string; status: 'pass' | 'fail'; message: string }>>([]);

  // Get buffered logs
  const logs = logger.getBufferedLogs();

  // Get journey events
  const journeyEvents = userJourney.getRecentEvents(20);
  const journeySummary = userJourney.getJourneySummary();

  // Health check query
  const { data: healthData, refetch: refetchHealth } = useQuery({
    queryKey: ['health-check'],
    queryFn: async () => {
      const start = Date.now();
      const { data, error } = await supabase.from('profiles').select('count').single();
      const duration = Date.now() - start;
      
      return {
        database: !error,
        auth: !!(await supabase.auth.getSession()).data.session,
        latency: duration,
      };
    },
  });

  /**
   * Trigger test error scenarios
   */
  const triggerError = (type: 'unhandled' | 'promise' | 'network' | 'boundary') => {
    try {
      switch (type) {
        case 'unhandled':
          throw new Error('Test unhandled error');
        case 'promise':
          Promise.reject(new Error('Test promise rejection'));
          break;
        case 'network':
          fetch('https://invalid-domain-that-does-not-exist.com')
            .catch((err) => logger.error('Test network error', err));
          break;
        case 'boundary':
          // This will trigger error boundary
          throw new Error('Test error boundary');
      }
      
      toast({
        title: 'Test Error Triggered',
        description: `${type} error has been triggered`,
      });
    } catch (error) {
      logger.error('Test error triggered', error);
      toast({
        title: 'Error Logged',
        description: 'Check console and logs tab',
        variant: 'destructive',
      });
    }
  };

  /**
   * Run health checks
   */
  const runHealthChecks = async () => {
    setTestResults([]);
    const results: typeof testResults = [];

    // Check database connection
    try {
      await supabase.from('profiles').select('count').single();
      results.push({ test: 'Database Connection', status: 'pass', message: 'Connected successfully' });
    } catch (error) {
      results.push({ test: 'Database Connection', status: 'fail', message: 'Connection failed' });
    }

    // Check auth
    try {
      const { data } = await supabase.auth.getSession();
      results.push({ 
        test: 'Authentication', 
        status: data.session ? 'pass' : 'fail', 
        message: data.session ? 'User authenticated' : 'No active session' 
      });
    } catch (error) {
      results.push({ test: 'Authentication', status: 'fail', message: 'Auth check failed' });
    }

    // Check localStorage
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      results.push({ test: 'LocalStorage', status: 'pass', message: 'Working correctly' });
    } catch (error) {
      results.push({ test: 'LocalStorage', status: 'fail', message: 'Storage unavailable' });
    }

    // Check network
    try {
      await fetch(import.meta.env.VITE_SUPABASE_URL + '/rest/v1/');
      results.push({ test: 'Network', status: 'pass', message: 'Online' });
    } catch (error) {
      results.push({ test: 'Network', status: 'fail', message: 'Offline or blocked' });
    }

    setTestResults(results);
    toast({
      title: 'Health Check Complete',
      description: `${results.filter(r => r.status === 'pass').length}/${results.length} checks passed`,
    });
  };

  /**
   * Clear all logs and journey
   */
  const clearAllData = () => {
    logger.clearBuffer();
    userJourney.clear();
    setTestResults([]);
    toast({
      title: 'Data Cleared',
      description: 'All logs and journey data cleared',
    });
  };

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Debug Tools</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Development and troubleshooting utilities
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            <Activity className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="errors" className="text-xs sm:text-sm">
            <Bug className="h-4 w-4 mr-2" />
            Test Errors
          </TabsTrigger>
          <TabsTrigger value="logs" className="text-xs sm:text-sm">
            <Database className="h-4 w-4 mr-2" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="journey" className="text-xs sm:text-sm">
            <Zap className="h-4 w-4 mr-2" />
            Journey
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">System Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Database</span>
                  <Badge variant={healthData?.database ? 'default' : 'destructive'}>
                    {healthData?.database ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Auth</span>
                  <Badge variant={healthData?.auth ? 'default' : 'secondary'}>
                    {healthData?.auth ? 'Active' : 'No Session'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Latency</span>
                  <Badge variant="outline">{healthData?.latency || '—'}ms</Badge>
                </div>
                <Button onClick={() => refetchHealth()} size="sm" className="w-full mt-2">
                  Refresh
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">Session Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span>{(journeySummary.sessionDuration / 1000 / 60).toFixed(1)} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Events</span>
                  <span>{journeySummary.totalEvents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Errors</span>
                  <Badge variant={journeySummary.errorCount > 0 ? 'destructive' : 'default'}>
                    {journeySummary.errorCount}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Logs</span>
                  <span>{logs.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button onClick={runHealthChecks} size="sm" className="w-full" variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Run Health Checks
                </Button>
                <Button onClick={clearAllData} size="sm" className="w-full" variant="outline">
                  <XCircle className="h-4 w-4 mr-2" />
                  Clear All Data
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Health Check Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {testResults.map((result, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        {result.status === 'pass' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-medium text-sm">{result.test}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{result.message}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Test Errors Tab */}
        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Simulation</CardTitle>
              <CardDescription>
                Trigger test errors to verify error handling and logging
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <Button onClick={() => triggerError('unhandled')} variant="outline" className="justify-start">
                <AlertCircle className="h-4 w-4 mr-2" />
                Unhandled Error
              </Button>
              <Button onClick={() => triggerError('promise')} variant="outline" className="justify-start">
                <AlertCircle className="h-4 w-4 mr-2" />
                Promise Rejection
              </Button>
              <Button onClick={() => triggerError('network')} variant="outline" className="justify-start">
                <AlertCircle className="h-4 w-4 mr-2" />
                Network Error
              </Button>
              <Button onClick={() => triggerError('boundary')} variant="outline" className="justify-start">
                <AlertCircle className="h-4 w-4 mr-2" />
                Error Boundary
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Buffered Logs ({logs.length})</CardTitle>
              <CardDescription>Recent log entries from the application</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                {logs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No logs recorded</p>
                ) : (
                  <div className="space-y-2">
                    {logs.map((log, idx) => (
                      <div key={idx} className="text-xs font-mono border-l-2 pl-2" style={{
                        borderColor: log.level === 'error' ? '#ef4444' : log.level === 'warn' ? '#f59e0b' : '#3b82f6'
                      }}>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={log.level === 'error' ? 'destructive' : 'outline'} className="text-[10px]">
                            {log.level.toUpperCase()}
                          </Badge>
                          <span className="text-muted-foreground">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-foreground">{log.message}</p>
                        {log.context && (
                          <pre className="text-muted-foreground mt-1 overflow-x-auto">
                            {JSON.stringify(log.context, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Journey Tab */}
        <TabsContent value="journey" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Journey ({journeyEvents.length} events)</CardTitle>
              <CardDescription>Track user navigation and actions</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                {journeyEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No journey events recorded</p>
                ) : (
                  <div className="space-y-2">
                    {journeyEvents.map((event, idx) => (
                      <div key={idx} className="text-xs border-l-2 border-primary/20 pl-3 py-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[10px]">
                            {event.type}
                          </Badge>
                          <span className="text-muted-foreground">
                            +{((event.timestamp - journeySummary.sessionDuration) / 1000).toFixed(1)}s
                          </span>
                        </div>
                        <p className="text-foreground">{event.description}</p>
                        {event.route && <p className="text-muted-foreground mt-1">Route: {event.route}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
