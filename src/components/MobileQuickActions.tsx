import { useState } from 'react';
import {
  Plus,
  UserPlus,
  Calendar,
  Palette,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BottomSheet } from '@/components/BottomSheet';
import { cn } from '@/lib/utils';
import { haptic } from '@/platform/haptics';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';

interface QuickAction {
  icon: any;
  label: string;
  description: string;
  path?: string;
  action?: () => void;
  gradient: string;
  roles: ('stylist' | 'client' | 'admin')[];
}

export const MobileQuickActions = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { isAdmin, isStylist, isClient } = useEnhancedAuth();

  const userRole = isAdmin ? 'admin' : isStylist ? 'stylist' : 'client';

  const quickActions: QuickAction[] = [
    {
      icon: Calendar,
      label: 'Book Appointment',
      description: 'Schedule a new appointment',
      path: '/book-appointment',
      gradient: 'from-cyan-500 to-blue-500',
      roles: ['client', 'stylist', 'admin'],
    },
    {
      icon: UserPlus,
      label: 'Add Client',
      description: 'Create new client profile',
      action: () => {
        window.dispatchEvent(new CustomEvent('open-add-client-dialog'));
        setOpen(false);
      },
      gradient: 'from-green-500 to-emerald-500',
      roles: ['stylist', 'admin'],
    },
    {
      icon: Palette,
      label: 'New Formula',
      description: 'Create hair color formula',
      path: '/formulas',
      gradient: 'from-purple-500 to-pink-500',
      roles: ['stylist', 'admin'],
    },
    {
      icon: Sparkles,
      label: 'AI Analysis',
      description: 'Get AI-powered insights',
      path: '/clients',
      gradient: 'from-amber-500 to-orange-500',
      roles: ['stylist', 'admin'],
    },
    {
      icon: MessageCircle,
      label: 'Send Message',
      description: 'Message a client',
      path: '/messages',
      gradient: 'from-pink-500 to-rose-500',
      roles: ['stylist', 'admin'],
    },
  ];

  const availableActions = quickActions.filter(action =>
    action.roles.includes(userRole)
  );

  const handleAction = (action: QuickAction) => {
    haptic.tap();
    if (action.action) {
      action.action();
    } else if (action.path) {
      navigate(action.path);
      setOpen(false);
    }
  };

  return (
    <>
      <Button
        size="icon"
        onClick={() => {
          haptic.tap();
          setOpen(true);
        }}
        className={cn(
          'fixed bottom-24 right-4 z-40',
          'lg:hidden',
          'h-14 w-14 rounded-full shadow-brutal-lg',
          'bg-gradient-to-br from-primary to-primary/80',
          'brutal-border',
          'hover:scale-110 active:scale-95',
          'transition-all duration-200'
        )}
        aria-label="Quick actions"
      >
        <Plus className="h-7 w-7 text-on-surface-primary" strokeWidth={3} />
        <div className="absolute -top-1 -right-1 h-3 w-3 bg-accent rounded-full animate-pulse border-2 border-background" />
      </Button>

      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title="Quick Actions"
        description="Jump to your most-used features"
      >
        <div className="grid grid-cols-2 gap-3 p-4">
          {availableActions.map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => handleAction(action)}
                className={cn(
                  'relative p-4 rounded-xl',
                  'brutal-border',
                  'bg-gradient-to-br from-card to-secondary/10',
                  'brutal-shadow-sm',
                  'hover:translate-y-[-2px] hover:brutal-shadow-md',
                  'active:translate-y-[1px] active:brutal-shadow-xs',
                  'transition-all duration-200',
                  'text-left group'
                )}
              >
                <div
                  className={cn(
                    'inline-flex p-3 rounded-xl mb-2',
                    'bg-gradient-to-br',
                    action.gradient,
                    'border-2 border-foreground/20'
                  )}
                >
                  <Icon className="h-6 w-6 text-on-surface-primary" strokeWidth={2.5} />
                </div>
                <h3 className="font-pixel text-sm mb-1 group-hover:text-primary transition-colors">
                  {action.label}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {action.description}
                </p>
              </button>
            );
          })}
        </div>

        <div className="px-4 pb-4 pt-2 border-t border-border">
          <p className="text-xs text-center text-muted-foreground">
            Tap the <Plus className="inline h-3 w-3" /> button anytime for quick
            access
          </p>
        </div>
      </BottomSheet>
    </>
  );
};
