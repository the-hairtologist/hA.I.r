import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Star,
  AlertTriangle,
  UserPlus,
  Mail,
  Calendar,
} from 'lucide-react';
import { useState } from 'react';

export function ClientSegmentation() {
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  const segments = [
    {
      id: 'vip',
      name: 'VIP Clients',
      icon: Star,
      count: 0,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      description: 'High-value clients with 10+ visits or $2000+ spent',
      actions: ['Send exclusive offer', 'Schedule check-in'],
    },
    {
      id: 'at-risk',
      name: 'At Risk',
      icon: AlertTriangle,
      count: 0,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      description: "Haven't booked in 60+ days",
      actions: ['Send win-back offer', 'Personal outreach'],
    },
    {
      id: 'new',
      name: 'New Clients',
      icon: UserPlus,
      count: 0,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      description: 'First visit in last 30 days',
      actions: ['Send welcome message', 'Request review'],
    },
    {
      id: 'regular',
      name: 'Regular Clients',
      icon: Users,
      count: 0,
      color: 'text-success',
      bgColor: 'bg-success/10',
      description: 'Active clients with consistent bookings',
      actions: ['Thank you message', 'Loyalty reward'],
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="brutal-border">
        <CardHeader>
          <CardTitle>Client Segments</CardTitle>
          <CardDescription>
            Organize clients by behavior and value to target campaigns
            effectively
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {segments.map(segment => {
              const Icon = segment.icon;
              return (
                <Card
                  key={segment.id}
                  className={`cursor-pointer transition-all hover:shadow-brutal-lg ${
                    selectedSegment === segment.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedSegment(segment.id)}
                >
                  <CardContent className="p-4">
                    <div
                      className={`${segment.bgColor} rounded-lg p-3 mb-3 w-fit`}
                    >
                      <Icon className={`h-6 w-6 ${segment.color}`} />
                    </div>
                    <h3 className="font-semibold mb-1">{segment.name}</h3>
                    <div className="text-3xl font-bold mb-2">
                      {segment.count}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {segment.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedSegment && (
        <Card className="brutal-border animate-fade-in">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Engage with {segments.find(s => s.id === selectedSegment)?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {segments
                .find(s => s.id === selectedSegment)
                ?.actions.map((action, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    {action.toLowerCase().includes('send') ? (
                      <Mail className="h-4 w-4" />
                    ) : (
                      <Calendar className="h-4 w-4" />
                    )}
                    {action}
                  </Button>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
