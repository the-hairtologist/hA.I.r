/**
 * Zapier Integration Page
 * Allows users to connect their salon to 5000+ apps
 */

import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Zap, Check, ArrowLeft, ExternalLink, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const ZapierIntegration = () => {
  const navigate = useNavigate();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  const handleTestWebhook = async () => {
    if (!webhookUrl) {
      toast.error('Please enter your Zapier webhook URL');
      return;
    }

    setTesting(true);
    setTestSuccess(false);

    try {
      console.log('[Zapier] Testing webhook:', webhookUrl);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors', // Required for Zapier webhooks
        body: JSON.stringify({
          event: 'test',
          timestamp: new Date().toISOString(),
          source: 'hair.app',
          data: {
            message: 'Test connection from hair.app',
          },
        }),
      });

      // no-cors mode doesn't return proper response, so we assume success
      setTestSuccess(true);
      toast.success('Test sent!', {
        description: 'Check your Zap\'s history to confirm it was triggered',
      });
    } catch (error) {
      console.error('[Zapier] Test failed:', error);
      toast.error('Failed to send test', {
        description: 'Please check your webhook URL and try again',
      });
    } finally {
      setTesting(false);
    }
  };

  const useCases = [
    {
      title: 'New Appointment → Google Calendar',
      description: 'Auto-add appointments to your calendar',
      icon: '📅',
    },
    {
      title: 'New Client → CRM',
      description: 'Sync client info to Salesforce, HubSpot, etc.',
      icon: '👤',
    },
    {
      title: 'Completed Service → Accounting',
      description: 'Send invoices to QuickBooks, Xero',
      icon: '💰',
    },
    {
      title: 'New Review → Social Media',
      description: 'Auto-share 5-star reviews to Instagram',
      icon: '⭐',
    },
    {
      title: 'Low Stock → Slack',
      description: 'Get alerts when products run low',
      icon: '📦',
    },
    {
      title: 'Daily Summary → Email',
      description: 'Morning report with today\'s schedule',
      icon: '📧',
    },
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 max-w-4xl animate-fade-in">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/integrations')}
            className="gap-2 hover:bg-secondary/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Integrations
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 font-display flex items-center gap-2">
            <Zap className="h-10 w-10 text-primary" />
            Zapier Integration
          </h1>
          <p className="text-muted-foreground">
            Connect your salon to 5,000+ apps and automate your workflow
          </p>
        </div>

        {/* Setup Card */}
        <Card className="mb-8 border-2 border-primary shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Quick Setup
            </CardTitle>
            <CardDescription>
              Connect your Zapier webhook in 3 easy steps
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTitle className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                How it works
              </AlertTitle>
              <AlertDescription className="space-y-2 text-sm">
                <ol className="list-decimal list-inside space-y-1 mt-2">
                  <li>
                    Create a new Zap in Zapier with a{' '}
                    <strong>"Webhooks by Zapier"</strong> trigger
                  </li>
                  <li>Choose "Catch Hook" and copy the webhook URL</li>
                  <li>Paste the URL here and test the connection</li>
                  <li>Finish setting up your Zap to connect to any app!</li>
                </ol>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="webhook-url">Zapier Webhook URL</Label>
              <Input
                id="webhook-url"
                type="url"
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Your webhook URL should start with "https://hooks.zapier.com/hooks/catch/"
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleTestWebhook}
                disabled={!webhookUrl || testing}
                className="flex-1"
              >
                {testing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending Test...
                  </>
                ) : testSuccess ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Test Sent!
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Send Test
                  </>
                )}
              </Button>
              <Button variant="outline" asChild>
                <a
                  href="https://zapier.com/app/zaps"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Zapier
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Use Cases */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 font-display">Popular Use Cases</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {useCases.map((useCase, index) => (
              <Card key={index} className="border-2 hover:border-primary transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{useCase.icon}</span>
                    <div>
                      <h3 className="font-semibold mb-1">{useCase.title}</h3>
                      <p className="text-sm text-muted-foreground">{useCase.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tutorial */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help Getting Started?</CardTitle>
            <CardDescription>Follow our step-by-step tutorial</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Create Your Zap</p>
                  <p className="text-sm text-muted-foreground">
                    Go to Zapier and click "Create Zap"
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">Set Up Webhook Trigger</p>
                  <p className="text-sm text-muted-foreground">
                    Choose "Webhooks by Zapier" as trigger, select "Catch Hook"
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Copy & Test</p>
                  <p className="text-sm text-muted-foreground">
                    Copy the webhook URL, paste it above, and click "Send Test"
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  4
                </div>
                <div>
                  <p className="font-medium">Connect Your Apps</p>
                  <p className="text-sm text-muted-foreground">
                    Choose what happens next (e.g., add to calendar, send email, etc.)
                  </p>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full" asChild>
              <a
                href="https://zapier.com/learn/getting-started-guide/what-is-zapier"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Full Zapier Tutorial
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ZapierIntegration;
