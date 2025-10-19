/**
 * 🎯 TEAM 1: AI Integration
 * Churn Risk Widget - Proactive client retention
 */

import { useState } from 'react';
import { useClientChurnPredictor } from '@/hooks/useClientChurnPredictor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, Mail, MessageSquare, Phone, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ChurnRiskWidgetProps {
  stylistId: string;
  variant?: 'compact' | 'full';
}

export const ChurnRiskWidget: React.FC<ChurnRiskWidgetProps> = ({ stylistId, variant = 'compact' }) => {
  const { predictions, loading, criticalCount, highRiskCount, refresh } = useClientChurnPredictor(stylistId);
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getRiskIcon = (level: string) => {
    return level === 'critical' || level === 'high' ? AlertTriangle : TrendingUp;
  };

  const handleAction = async (action: string, clientId: string, clientName: string) => {
    toast({
      title: `${action} for ${clientName}`,
      description: 'Opening communication tools...',
    });

    if (action === 'Email') {
      // Navigate to messaging
      navigate(`/clients/${clientId}?action=email`);
    } else if (action === 'SMS') {
      navigate(`/clients/${clientId}?action=sms`);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Analyzing churn risk...</span>
        </CardContent>
      </Card>
    );
  }

  const criticalClients = predictions.filter(p => p.riskLevel === 'critical');
  const highRiskClients = predictions.filter(p => p.riskLevel === 'high');

  if (variant === 'compact') {
    return (
      <Card className="border-l-4 border-l-destructive">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-base">At-Risk Clients</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={refresh}>
              <TrendingUp className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            {criticalCount + highRiskCount} clients need attention
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {criticalCount > 0 && (
            <div className="flex items-center justify-between p-2 bg-destructive/10 rounded-md">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">{criticalCount}</Badge>
                <span className="text-sm font-medium">Critical Risk</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/retention-dashboard')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
          {highRiskCount > 0 && (
            <div className="flex items-center justify-between p-2 bg-warning/10 rounded-md">
              <div className="flex items-center gap-2">
                <Badge className="bg-warning text-warning-foreground">{highRiskCount}</Badge>
                <span className="text-sm font-medium">High Risk</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/retention-dashboard')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <div>
              <CardTitle>Client Retention Analysis</CardTitle>
              <CardDescription>AI-powered churn prediction</CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={refresh}>
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Critical Risk Clients */}
        {criticalClients.length > 0 && (
          <Collapsible open={expanded} onOpenChange={setExpanded}>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg cursor-pointer hover:bg-destructive/20 transition-colors">
                <div className="flex items-center gap-3">
                  <Badge variant="destructive" className="text-base px-3 py-1">
                    {criticalClients.length}
                  </Badge>
                  <div>
                    <p className="font-semibold text-destructive">Critical Risk</p>
                    <p className="text-xs text-muted-foreground">Immediate action required</p>
                  </div>
                </div>
                <ChevronRight className={`h-5 w-5 transition-transform ${expanded ? 'rotate-90' : ''}`} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              {criticalClients.map((client) => (
                <Card key={client.clientId} className="border-l-4 border-l-destructive">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{client.clientName}</h4>
                          <Badge variant={getRiskColor(client.riskLevel)}>
                            {Math.round(client.churnProbability * 100)}% risk
                          </Badge>
                        </div>
                        <div className="text-sm space-y-1">
                          <p className="text-muted-foreground">
                            <strong>Key Factor:</strong> {client.factors[0]?.description}
                          </p>
                          <p className="text-muted-foreground">
                            <strong>Predicted Loss:</strong> ${client.predictedLossValue.toFixed(0)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium">Recommended Actions:</p>
                          {client.recommendedActions.slice(0, 2).map((action, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs">
                              <div className="w-1 h-1 rounded-full bg-primary mt-1.5" />
                              <span>{action.action}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-1 ml-4">
                        <Button 
                          size="icon" 
                          variant="outline"
                          onClick={() => handleAction('Email', client.clientId, client.clientName)}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="outline"
                          onClick={() => handleAction('SMS', client.clientId, client.clientName)}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* High Risk Clients */}
        {highRiskClients.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-base px-3 py-1">
                  {highRiskClients.length}
                </Badge>
                <div>
                  <p className="font-semibold">High Risk</p>
                  <p className="text-xs text-muted-foreground">Monitor closely</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/retention-dashboard')}
              >
                View All
              </Button>
            </div>
          </div>
        )}

        {predictions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">All clients are engaged!</p>
            <p className="text-sm">No churn risk detected</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
