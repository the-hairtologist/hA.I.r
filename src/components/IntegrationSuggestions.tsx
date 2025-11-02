/**
 * Integration Suggestions Component
 * Smart recommendations for integrations based on user behavior
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Calendar, MessageSquare, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IntegrationSuggestion {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  integrationId: string;
  benefit: string;
  priority: 'high' | 'medium' | 'low';
}

interface IntegrationSuggestionsProps {
  context: 'dashboard' | 'appointments' | 'clients' | 'messages';
  userStats?: {
    appointmentCount?: number;
    clientCount?: number;
    messageCount?: number;
    missedAppointments?: number;
  };
  className?: string;
}

export const IntegrationSuggestions = ({
  context,
  userStats = {},
  className,
}: IntegrationSuggestionsProps) => {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState<IntegrationSuggestion[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    generateSuggestions();
  }, [context, userStats]);

  const generateSuggestions = () => {
    const newSuggestions: IntegrationSuggestion[] = [];

    // Appointment-based suggestions
    if (userStats.appointmentCount && userStats.appointmentCount > 10) {
      newSuggestions.push({
        id: 'google-calendar-sync',
        title: 'Sync with Google Calendar',
        description: 'Two-way sync prevents double-bookings',
        icon: Calendar,
        integrationId: 'google-calendar',
        benefit: 'Never miss a beat',
        priority: 'high',
      });
    }

    // No-show prevention
    if (userStats.missedAppointments && userStats.missedAppointments > 2) {
      newSuggestions.push({
        id: 'sms-reminders',
        title: 'Enable SMS Reminders',
        description: 'Cut no-shows by 70%',
        icon: MessageSquare,
        integrationId: 'twilio',
        benefit: 'Protect your time',
        priority: 'high',
      });
    }

    // Client growth suggestions
    if (userStats.clientCount && userStats.clientCount > 15) {
      newSuggestions.push({
        id: 'automation-zapier',
        title: 'Automate Client Follow-ups',
        description: 'Auto-send thank you messages & rebooking prompts',
        icon: Zap,
        integrationId: 'zapier',
        benefit: 'More repeat bookings',
        priority: 'medium',
      });
    }

    // Context-specific suggestions
    if (
      context === 'appointments' &&
      userStats.appointmentCount &&
      userStats.appointmentCount > 5
    ) {
      newSuggestions.push({
        id: 'calendar-integration',
        title: 'Connect Your Calendar',
        description: 'One calendar. Less chaos.',
        icon: Calendar,
        integrationId: 'google-calendar',
        benefit: 'Sync once, done',
        priority: 'high',
      });
    }

    // Filter out dismissed suggestions
    const filtered = newSuggestions.filter(s => !dismissed.has(s.id));

    // Sort by priority
    filtered.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    setSuggestions(filtered.slice(0, 2)); // Show max 2 suggestions
  };

  const handleDismiss = (suggestionId: string) => {
    setDismissed(prev => new Set([...prev, suggestionId]));
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));

    // Store dismissed state
    const dismissedList = JSON.parse(
      localStorage.getItem('dismissed_integration_suggestions') || '[]'
    );
    localStorage.setItem(
      'dismissed_integration_suggestions',
      JSON.stringify([...dismissedList, suggestionId])
    );
  };

  const handleViewIntegration = (integrationId: string) => {
    navigate(`/integrations?highlight=${integrationId}`);
  };

  if (suggestions.length === 0) return null;

  return (
    <div className={cn('space-y-3', className)}>
      {suggestions.map(suggestion => {
        const Icon = suggestion.icon;
        return (
          <Card
            key={suggestion.id}
            className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 relative overflow-hidden"
          >
            <div className="absolute top-2 right-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDismiss(suggestion.id)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <Badge variant="secondary" className="text-xs">
                      Suggested
                    </Badge>
                  </div>
                  <CardTitle className="text-base">
                    {suggestion.title}
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    {suggestion.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary">
                  {suggestion.benefit}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    handleViewIntegration(suggestion.integrationId)
                  }
                >
                  Connect
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
