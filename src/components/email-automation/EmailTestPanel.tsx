import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Send, Zap } from 'lucide-react';

export const EmailTestPanel = () => {
  const [emailType, setEmailType] = useState<string>('birthday');
  const [testEmail, setTestEmail] = useState<string>('');

  const sendTestMutation = useMutation({
    mutationFn: async () => {
      if (!testEmail) throw new Error('Email address is required');

      const { data, error } = await supabase.functions.invoke(
        'test-automated-email',
        {
          body: {
            email_type: emailType,
            recipient_email: testEmail,
          },
        }
      );

      if (error) throw error;
      return data;
    },
    onSuccess: data => {
      toast({
        title: 'Test Email Sent! ✅',
        description: `Check ${testEmail} for your preview email`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Send',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-warning" />
          Test Automated Emails
        </CardTitle>
        <CardDescription>
          Send test previews of your automated emails to verify formatting and
          content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Email Type</Label>
          <Select value={emailType} onValueChange={setEmailType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="birthday">🎂 Birthday Email</SelectItem>
              <SelectItem value="review">⭐ Review Request</SelectItem>
              <SelectItem value="cancellation">
                💕 Cancellation Follow-Up
              </SelectItem>
              <SelectItem value="aftercare">✨ Aftercare Guide</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Your Test Email</Label>
          <Input
            type="email"
            placeholder="your@email.com"
            value={testEmail}
            onChange={e => setTestEmail(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            We'll send a test preview to this address
          </p>
        </div>

        <Button
          onClick={() => sendTestMutation.mutate()}
          disabled={sendTestMutation.isPending || !testEmail}
          className="w-full"
          size="lg"
        >
          <Send className="h-4 w-4 mr-2" />
          {sendTestMutation.isPending ? 'Sending...' : 'Send Test Email'}
        </Button>

        <div className="bg-info/10 dark:bg-info/20 p-4 rounded-lg border border-info/30">
          <p className="text-sm text-info">
            <strong>💡 Pro Tip:</strong> Test emails include a yellow banner at
            the top so you can distinguish them from real automated emails.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
