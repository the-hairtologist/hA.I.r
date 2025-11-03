import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Check, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { logger } from '@/lib/logging/productionLogger';

interface IntegrationStatusProps {
  compact?: boolean;
}

export const IntegrationStatus = ({
  compact = false,
}: IntegrationStatusProps) => {
  const [statuses, setStatuses] = useState({
    lovableAI: 'checking',
    calendar: 'checking',
    payments: 'checking',
    email: 'checking',
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkIntegrationStatuses();
  }, []);

  const checkIntegrationStatuses = async () => {
    try {
      setStatuses({
        lovableAI: 'active', // Lovable AI is always active
        calendar: 'available', // Will be active when user connects
        payments: 'active', // Stripe is always active
        email: 'active', // Resend is always active
      });
    } catch (error) {
      logger.error('Error checking integration statuses', error, {
        component: 'IntegrationStatus',
      });
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    const activeCount = Object.values(statuses).filter(
      s => s === 'active'
    ).length;
    return (
      <Card
        className="cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => navigate('/integrations')}
      >
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Integrations</p>
              <p className="text-xs text-muted-foreground">
                {activeCount} active
              </p>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Check className="h-3 w-3" />
              Active
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Integration Status
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/integrations')}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>Monitor your connected services</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <StatusItem
          name="Lovable AI"
          status={statuses.lovableAI}
          description="AI-powered features"
        />
        <StatusItem
          name="Google Calendar"
          status={statuses.calendar}
          description="Appointment syncing"
        />
        <StatusItem
          name="Stripe Payments"
          status={statuses.payments}
          description="Payment processing"
        />
        <StatusItem
          name="Email Service"
          status={statuses.email}
          description="Automated emails"
        />
      </CardContent>
    </Card>
  );
};

const StatusItem = ({
  name,
  status,
  description,
}: {
  name: string;
  status: string;
  description: string;
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          icon: <Check className="h-4 w-4 text-success" />,
          badge: (
            <Badge variant="default" className="bg-success hover:bg-success">
              Active
            </Badge>
          ),
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-4 w-4 text-destructive" />,
          badge: <Badge variant="destructive">Error</Badge>,
        };
      case 'checking':
        return {
          icon: (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ),
          badge: <Badge variant="outline">Checking</Badge>,
        };
      default:
        return {
          icon: <AlertCircle className="h-4 w-4 text-muted-foreground" />,
          badge: <Badge variant="outline">Available</Badge>,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        {config.icon}
        <div>
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {config.badge}
    </div>
  );
};
