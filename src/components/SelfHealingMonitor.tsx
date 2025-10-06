/**
 * Self-Healing Monitor Component
 * 
 * UI component to display system health and trigger maintenance actions.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, AlertTriangle, CheckCircle, Wrench, Zap, TrendingUp } from 'lucide-react';
import { selfHealing, healthMonitor, dataIntegrity } from '@/lib/selfHealing';
import { toast } from 'sonner';

export const SelfHealingMonitor = () => {
  const [status, setStatus] = useState<any>(null);
  const [isRunningMaintenance, setIsRunningMaintenance] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    const currentStatus = selfHealing.getStatus();
    setStatus(currentStatus);
    setLastCheck(new Date());
  };

  const runMaintenance = async () => {
    setIsRunningMaintenance(true);
    toast.info('Running system maintenance...');

    try {
      const result = await selfHealing.runMaintenance();
      toast.success(`Maintenance complete: ${result.issuesFixed} issues fixed`);
      await loadStatus();
    } catch (error) {
      toast.error('Maintenance failed');
    } finally {
      setIsRunningMaintenance(false);
    }
  };

  const runIntegrityCheck = async () => {
    toast.info('Checking data integrity...');
    
    const issues = await dataIntegrity.runFullCheck();
    
    if (issues.length === 0) {
      toast.success('No integrity issues found');
    } else {
      const fixed = await dataIntegrity.autoFix(issues);
      toast.info(`Found ${issues.length} issues, fixed ${fixed}`);
    }
    
    await loadStatus();
  };

  const forceHealthCheck = async () => {
    toast.info('Running health check...');
    await healthMonitor.checkNow();
    await loadStatus();
    toast.success('Health check complete');
  };

  if (!status) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <Activity className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading system status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const healthStatus = status.health.status;
  const isHealthy = healthStatus === 'healthy';
  const isDegraded = healthStatus === 'degraded';

  return (
    <div className="space-y-4">
      {/* System Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Self-Healing System
              </CardTitle>
              <CardDescription>
                Automated monitoring and maintenance
              </CardDescription>
            </div>
            <Badge
              variant={isHealthy ? 'default' : isDegraded ? 'secondary' : 'destructive'}
              className="text-sm"
            >
              {isHealthy ? (
                <CheckCircle className="h-4 w-4 mr-1" />
              ) : (
                <AlertTriangle className="h-4 w-4 mr-1" />
              )}
              {healthStatus}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold">
                    {status.initialized ? 'Active' : 'Inactive'}
                  </div>
                  <div className="text-sm text-muted-foreground">System Status</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold">
                    {status.health.metrics?.errorRate 
                      ? `${(status.health.metrics.errorRate * 100).toFixed(1)}%`
                      : 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">Error Rate</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                  <div className="text-2xl font-bold">
                    {status.errorRecovery.openCircuits.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Open Circuits</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {lastCheck && (
            <div className="text-xs text-muted-foreground text-center">
              Last updated: {lastCheck.toLocaleTimeString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="health">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="health">Health</TabsTrigger>
              <TabsTrigger value="recovery">Recovery</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="health" className="space-y-4">
              {status.health.metrics && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Memory Usage</span>
                    <span className="text-sm font-mono">
                      {(status.health.metrics.memoryUsage * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">API Latency</span>
                    <span className="text-sm font-mono">
                      {status.health.metrics.apiLatency.toFixed(0)}ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Cache Hit Rate</span>
                    <span className="text-sm font-mono">
                      {(status.health.metrics.cacheHitRate * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                {status.health.message}
              </p>
            </TabsContent>

            <TabsContent value="recovery" className="space-y-4">
              {status.errorRecovery.openCircuits.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Active Circuit Breakers:</p>
                  {status.errorRecovery.openCircuits.map((circuit: any) => (
                    <Card key={circuit.component}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{circuit.component}</div>
                            <div className="text-xs text-muted-foreground">
                              {circuit.failures} failures since{' '}
                              {new Date(circuit.since).toLocaleTimeString()}
                            </div>
                          </div>
                          <Badge variant="destructive">Open</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>All systems operational</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <div className="grid gap-2">
                <Button
                  onClick={runMaintenance}
                  disabled={isRunningMaintenance}
                  className="w-full"
                >
                  <Wrench className="h-4 w-4 mr-2" />
                  {isRunningMaintenance ? 'Running...' : 'Run Full Maintenance'}
                </Button>
                
                <Button
                  onClick={runIntegrityCheck}
                  variant="outline"
                  className="w-full"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Check Data Integrity
                </Button>
                
                <Button
                  onClick={forceHealthCheck}
                  variant="outline"
                  className="w-full"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Force Health Check
                </Button>
              </div>

              <div className="text-xs text-muted-foreground text-center pt-4">
                Maintenance actions may take a few moments to complete
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
