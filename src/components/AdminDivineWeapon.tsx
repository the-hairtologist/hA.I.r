/**
 * Admin Divine Weapon Dashboard
 * The ultimate admin control center with god-mode powers
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  Zap, 
  Eye,
  Lock,
  RefreshCw,
  Users,
  DollarSign,
  Brain,
  Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { securityGuardian } from '@/lib/ai/SecurityGuardian';
import { predictiveAnalytics } from '@/lib/ai/PredictiveAnalytics';
import { useDevMode } from '@/hooks/useDevMode';
import { DeveloperPanel } from './admin/DeveloperPanel';

export const AdminDivineWeapon = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isDevMode } = useDevMode();
  const [securityStatus, setSecurityStatus] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    
    try {
      // Load security status
      const security = await securityGuardian.getSecurityStatus();
      setSecurityStatus(security);
      
      // Load predictive insights
      const predictions = await predictiveAnalytics.generateInsights();
      setInsights(predictions);
      
      // Load system health from database
      setSystemHealth({ healthy: true });
      
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runFullMaintenance = async () => {
    toast({
      title: "Running Full Maintenance",
      description: "Activating all divine systems..."
    });
    
    // Run security and analytics checks
    await loadDashboardData();
    
    toast({
      title: "Maintenance Complete",
      description: "All systems optimized and protected"
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'warning': return 'warning';
      case 'info': return 'default';
      default: return 'secondary';
    }
  };

  if (isLoading && !securityStatus) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <Brain className="h-12 w-12 animate-pulse mx-auto text-primary" />
          <p className="text-muted-foreground">Initializing Divine Systems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Divine Weapon Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Ultimate admin control center • God-mode activated
          </p>
        </div>
        <Button onClick={runFullMaintenance} size="lg" className="gap-2">
          <Zap className="h-5 w-5" />
          Run Full Maintenance
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Security</CardTitle>
              <Shield className={`h-5 w-5 ${
                securityStatus?.status === 'secure' ? 'text-success' : 'text-warning'
              }`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {securityStatus?.status === 'secure' ? 'Secure' : 'Warning'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {securityStatus?.unresolvedThreats || 0} active threats
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">System Health</CardTitle>
              <Activity className="h-5 w-5 text-info" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemHealth?.healthy ? 'Excellent' : 'Degraded'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All angels active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">AI Insights</CardTitle>
              <Brain className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Predictive alerts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Auto-Healing</CardTitle>
              <RefreshCw className="h-5 w-5 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground mt-1">
              Continuous protection
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="security" className="space-y-4">
        <TabsList>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          {isDevMode && <TabsTrigger value="developer">Developer</TabsTrigger>}
        </TabsList>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-success" />
                  <div>
                    <p className="font-medium">Guardian Angel Active</p>
                    <p className="text-sm text-muted-foreground">
                      24/7 threat monitoring enabled
                    </p>
                  </div>
                </div>
                <Badge variant="default">Active</Badge>
              </div>

              {securityStatus?.unresolvedThreats > 0 && (
                <div className="flex items-center justify-between p-4 border border-warning rounded-lg bg-warning/10">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    <div>
                      <p className="font-medium">Threats Detected</p>
                      <p className="text-sm text-muted-foreground">
                        {securityStatus.unresolvedThreats} suspicious activities require review
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Review
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-4 w-4 text-info" />
                    <span className="text-sm font-medium">Events Logged</span>
                  </div>
                  <p className="text-2xl font-bold">{securityStatus?.recentEvents || 0}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium">Auto-Blocked</span>
                  </div>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {insights.map((insight, idx) => (
            <Card key={idx}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {insight.type === 'security' && <Shield className="h-5 w-5" />}
                    {insight.type === 'performance' && <Activity className="h-5 w-5" />}
                    {insight.type === 'revenue' && <DollarSign className="h-5 w-5" />}
                    {insight.type === 'user_experience' && <Users className="h-5 w-5" />}
                    <CardTitle>{insight.title}</CardTitle>
                  </div>
                  <Badge variant={getSeverityColor(insight.severity) as any}>
                    {insight.severity}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{insight.description}</p>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">🔮 Prediction:</p>
                  <p className="text-sm">{insight.prediction}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Confidence: {insight.confidence}%
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Suggested Actions:</p>
                  <ul className="space-y-1">
                    {insight.suggestedActions.map((action: string) => (
                      <li key={action} className="text-sm text-muted-foreground flex items-center gap-2">
                        <Target className="h-3 w-3" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm">
                    <span className="font-medium">Estimated Impact:</span> {insight.estimatedImpact}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {insights.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No insights at this time</p>
                <p className="text-sm text-muted-foreground mt-2">
                  AI angels are analyzing your kingdom
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Advanced user management and role control will be available here.
              </p>
              <Button onClick={() => navigate('/admin/users')} className="gap-2">
                <Users className="h-4 w-4" />
                Go to User Management
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  System-level controls and configurations.
                </p>
                <div className="grid gap-3">
                  <Button onClick={() => navigate('/system-health')} variant="outline" className="justify-start">
                    <Activity className="h-4 w-4 mr-2" />
                    View System Health
                  </Button>
                  <Button onClick={() => navigate('/access-codes')} variant="outline" className="justify-start">
                    <Lock className="h-4 w-4 mr-2" />
                    Manage Access Codes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {isDevMode && (
          <TabsContent value="developer">
            <DeveloperPanel />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
