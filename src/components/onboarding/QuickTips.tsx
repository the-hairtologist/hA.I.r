/**
 * Quick Tips Component
 * Displays helpful tips for new users in an unobtrusive way
 */

import { useState, useEffect } from 'react';
import { X, Zap, Keyboard, Mic, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Tip {
  icon: typeof Zap;
  title: string;
  description: string;
  badge?: string;
}

const tips: Tip[] = [
  {
    icon: Keyboard,
    title: 'Keyboard Shortcuts',
    description: 'Press Ctrl+K (Cmd+K on Mac) to quickly search anything',
    badge: 'Power User',
  },
  {
    icon: Mic,
    title: 'Voice Commands',
    description: 'Use voice control to navigate hands-free while working with clients',
    badge: 'Voice',
  },
  {
    icon: Sparkles,
    title: 'AI Formula Generator',
    description: 'Describe the desired color and let AI create the perfect formula',
    badge: 'AI',
  },
  {
    icon: Zap,
    title: 'Quick Actions',
    description: 'Access frequently used features from the dashboard quick actions',
  },
];

export const QuickTips = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Only show to new users (first 3 sessions)
    const sessionCount = parseInt(localStorage.getItem('session_count') || '0');
    const tipsDismissed = localStorage.getItem('quick_tips_dismissed');

    if (sessionCount < 3 && !tipsDismissed) {
      // Increment session count
      localStorage.setItem('session_count', String(sessionCount + 1));

      // Show tips after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentTipIndex < tips.length - 1) {
      setCurrentTipIndex(currentTipIndex + 1);
      setHasInteracted(true);
    } else {
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('quick_tips_dismissed', 'true');
  };

  if (!isVisible) return null;

  const currentTip = tips[currentTipIndex];
  const Icon = currentTip.icon;

  return (
    <Card className="fixed bottom-20 right-4 w-80 p-4 shadow-xl z-40 animate-slide-in-right">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">Pro Tip</h4>
            {currentTip.badge && (
              <Badge variant="secondary" className="text-xs mt-0.5">
                {currentTip.badge}
              </Badge>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 -mt-1"
          onClick={handleDismiss}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      <div className="mb-4">
        <h3 className="font-medium text-sm mb-2">{currentTip.title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {currentTip.description}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {tips.map((_, index) => (
            <div
              key={index}
              className={`h-1 w-6 rounded-full transition-colors ${
                index === currentTipIndex ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <div className="flex gap-2">
          {currentTipIndex < tips.length - 1 ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7"
                onClick={handleDismiss}
              >
                Skip All
              </Button>
              <Button
                size="sm"
                className="text-xs h-7"
                onClick={handleNext}
              >
                Next Tip
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              className="text-xs h-7"
              onClick={handleDismiss}
            >
              Got It!
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
