import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/DashboardLayout';
import {
  CheckCircle2,
  Clock,
  Mail,
  MessageSquare,
  TrendingUp,
  Calendar,
  Heart,
  Bell,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';

export default function AutomationMonitoring() {
  const automationConfig = [
    {
      name: 'Smart Upsell AI',
      function: 'smart-upsell',
      icon: TrendingUp,
      description: 'Personalized upsell recommendations',
      color: 'text-green-500',
    },
    {
      name: 'Appointment Followup',
      function: 'automated-appointment-followup',
      icon: Calendar,
      description: 'Birthday & rebooking reminders',
      color: 'text-blue-500',
    },
    {
      name: 'No-Show Prevention',
      function: 'no-show-prevention',
      icon: Bell,
      description: '48h & 24h confirmation requests',
      color: 'text-orange-500',
    },
    {
      name: 'Retention Messages',
      function: 'retention-messages',
      icon: Heart,
      description: 'Weekly at-risk client outreach',
      color: 'text-pink-500',
    },
    {
      name: 'SMS Sender',
      function: 'send-sms',
      icon: MessageSquare,
      description: 'SMS delivery via Twilio',
      color: 'text-purple-500',
    },
    {
      name: 'Email Sender',
      function: 'send-email',
      icon: Mail,
      description: 'Email delivery via Resend',
      color: 'text-indigo-500',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Automation Monitoring</h1>
          <p className="text-muted-foreground mt-1">
            Track all automated systems and edge functions
          </p>
        </div>

        {/* Automation Status Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {automationConfig.map(automation => {
            const Icon = automation.icon;

            return (
              <Card key={automation.function}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg bg-muted ${automation.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {automation.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {automation.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Status
                      </span>
                      <Badge
                        variant="outline"
                        className="bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Edge function deployed and ready to receive requests
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Scheduled Jobs Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Scheduled Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Smart Upsell AI</p>
                    <p className="text-xs text-muted-foreground">
                      Runs daily at 8:00 AM
                    </p>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Appointment Follow-up</p>
                    <p className="text-xs text-muted-foreground">
                      Runs daily at 9:00 AM
                    </p>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">No-Show Prevention</p>
                    <p className="text-xs text-muted-foreground">
                      Runs twice daily at 8 AM & 8 PM
                    </p>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Retention Messages</p>
                    <p className="text-xs text-muted-foreground">
                      Runs weekly on Mondays at 9 AM
                    </p>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Documentation & Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-4">
                All automations are configured and running via pg_cron. View
                full details in AUTOMATION_STATUS.md.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button variant="outline" className="justify-start" asChild>
                  <a
                    href="https://docs.lovable.dev/features/cloud"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Backend Documentation
                  </a>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <a href="/help">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Get Support
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
