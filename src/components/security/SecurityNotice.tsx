/**
 * Security Notice Component
 * Displays security reminders and best practices to users
 */

import { Shield, Lock, Eye, Key } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SecurityNoticeProps {
  variant?: 'inline' | 'card';
  showIcon?: boolean;
}

export function SecurityNotice({ variant = 'inline', showIcon = true }: SecurityNoticeProps) {
  const notices = [
    {
      icon: Lock,
      title: 'Data Protection',
      description: 'All sensitive information is encrypted and protected with enterprise-grade security.',
    },
    {
      icon: Eye,
      title: 'Privacy First',
      description: 'Client medical information requires explicit consent and is only accessible to authorized stylists.',
    },
    {
      icon: Key,
      title: 'Secure Authentication',
      description: 'Your account is protected with industry-standard authentication and session management.',
    },
    {
      icon: Shield,
      title: 'Regular Security Audits',
      description: 'We perform continuous security monitoring to protect your data.',
    },
  ];

  if (variant === 'card') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Security & Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {notices.map((notice, index) => {
            const Icon = notice.icon;
            return (
              <div key={index} className="flex items-start gap-3">
                <Icon className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">{notice.title}</p>
                  <p className="text-sm text-muted-foreground">{notice.description}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  }

  return (
    <Alert>
      {showIcon && <Shield className="h-4 w-4" />}
      <AlertTitle>Security Notice</AlertTitle>
      <AlertDescription className="space-y-2 mt-2">
        <p>Your data is protected with enterprise-grade security measures:</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>End-to-end encryption for sensitive information</li>
          <li>Role-based access control</li>
          <li>Consent-based data sharing</li>
          <li>Continuous security monitoring</li>
        </ul>
      </AlertDescription>
    </Alert>
  );
}
