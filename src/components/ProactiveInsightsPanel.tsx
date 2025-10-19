/**
 * 🎯 TEAM 1: AI Integration
 * Proactive Insights Panel - Daily AI-powered business intelligence
 */

import { useProactiveInsights } from '@/hooks/useProactiveInsights';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Users, 
  Loader2,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProactiveInsightsPanelProps {
  stylistId: string;
}

export const ProactiveInsightsPanel: React.FC<ProactiveInsightsPanelProps> = ({ stylistId }) => {
  const { insights, loading, lastGenerated, regenerate } = useProactiveInsights(stylistId);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return AlertTriangle;
      case 'high': return TrendingUp;
      case 'medium': return Info;
      default: return CheckCircle;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'warning';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getCategoryIcon = (type: string) => {
    if (type === 'revenue_opportunity') return DollarSign;
    if (type === 'churn_risk') return AlertTriangle;
    if (type === 'efficiency') return Clock;
    if (type === 'retention') return Users;
    return Sparkles;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg font-medium">Analyzing your business...</p>
          <p className="text-sm text-muted-foreground">AI is discovering opportunities</p>
        </CardContent>
      </Card>
    );
  }

  const churnInsights = insights.filter(i => i.type === 'churn_risk');
  const revenueInsights = insights.filter(i => i.type === 'revenue_opportunity');
  const efficiencyInsights = insights.filter(i => i.type === 'efficiency');
  const retentionInsights = insights.filter(i => i.type === 'retention');

  const totalPotentialRevenue = revenueInsights.reduce((sum, i) => sum + (i.potentialRevenue || 0), 0);

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>AI Insights</CardTitle>
              <CardDescription>
                {lastGenerated ? `Updated ${new Date(lastGenerated).toLocaleTimeString()}` : 'Real-time analysis'}
              </CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={regenerate}>
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">
              All ({insights.length})
            </TabsTrigger>
            <TabsTrigger value="churn">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Risk
            </TabsTrigger>
            <TabsTrigger value="revenue">
              <DollarSign className="h-4 w-4 mr-1" />
              Revenue
            </TabsTrigger>
            <TabsTrigger value="efficiency">
              <Clock className="h-4 w-4 mr-1" />
              Time
            </TabsTrigger>
            <TabsTrigger value="retention">
              <Users className="h-4 w-4 mr-1" />
              Loyalty
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3 mt-4">
            {insights.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Sparkles className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="font-medium text-lg">All systems optimal!</p>
                <p className="text-sm">No urgent insights at this time</p>
              </div>
            ) : (
              <>
                {totalPotentialRevenue > 0 && (
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Potential Revenue Opportunity</p>
                          <p className="text-2xl font-bold text-primary">
                            ${totalPotentialRevenue.toFixed(0)}
                          </p>
                        </div>
                        <DollarSign className="h-12 w-12 text-primary opacity-20" />
                      </div>
                    </CardContent>
                  </Card>
                )}
                {insights.map((insight, idx) => {
                  const Icon = getCategoryIcon(insight.type);
                  const PriorityIcon = getPriorityIcon(insight.priority);
                  
                  return (
                    <Card key={idx} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{insight.title}</h4>
                                <Badge variant={insight.priority === 'urgent' ? 'destructive' : 'secondary'}>
                                  <PriorityIcon className="h-3 w-3 mr-1" />
                                  {insight.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">
                                {insight.description}
                              </p>
                              {insight.potentialRevenue && (
                                <div className="flex items-center gap-2 mb-3 text-sm">
                                  <DollarSign className="h-4 w-4 text-primary" />
                                  <span className="font-semibold text-primary">
                                    ${insight.potentialRevenue.toFixed(0)} opportunity
                                  </span>
                                </div>
                              )}
                              {insight.actionItems && insight.actionItems.length > 0 && (
                                <div className="space-y-2">
                                  <p className="text-xs font-medium text-muted-foreground uppercase">
                                    Recommended Actions:
                                  </p>
                                  {insight.actionItems.map((action, idx) => (
                                    <div 
                                      key={idx}
                                      className="flex items-start gap-2 p-2 bg-muted/50 rounded-md"
                                    >
                                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                      <span className="text-sm">{action.title}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </>
            )}
          </TabsContent>

          <TabsContent value="churn" className="space-y-3 mt-4">
            {churnInsights.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500 opacity-50" />
                <p className="font-medium text-lg">No churn risks detected</p>
              </div>
            ) : (
              churnInsights.map((insight, idx) => (
                <Card key={idx} className="border-l-4 border-l-destructive">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="revenue" className="space-y-3 mt-4">
            {revenueInsights.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <DollarSign className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="font-medium text-lg">No revenue opportunities right now</p>
              </div>
            ) : (
              revenueInsights.map((insight, idx) => (
                <Card key={idx} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{insight.title}</h4>
                      {insight.potentialRevenue && (
                        <Badge className="bg-green-500 text-white">
                          +${insight.potentialRevenue.toFixed(0)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="efficiency" className="space-y-3 mt-4">
            {efficiencyInsights.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="font-medium text-lg">Operating at peak efficiency</p>
              </div>
            ) : (
              efficiencyInsights.map((insight, idx) => (
                <Card key={idx} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="retention" className="space-y-3 mt-4">
            {retentionInsights.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-16 w-16 mx-auto mb-4 text-green-500 opacity-50" />
                <p className="font-medium text-lg">Retention looking strong</p>
              </div>
            ) : (
              retentionInsights.map((insight, idx) => (
                <Card key={idx} className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
