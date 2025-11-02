import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sparkles,
  Users,
  Calendar,
  MessageSquare,
  Scissors,
  Settings2,
  Plus,
  X,
  Palette,
  DollarSign,
  BookOpen,
  CreditCard,
  GripVertical,
  Crown,
  Shield,
  Activity,
  FileText,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface QuickActionsProps {
  userRole: string;
  isAdmin?: boolean;
}

interface ActionButton {
  id: string;
  label: string;
  icon: any;
  route: string;
  description?: string;
  gradient?: string;
  disabled?: boolean;
}

export const QuickActions = ({
  userRole,
  isAdmin = false,
}: QuickActionsProps) => {
  const navigate = useNavigate();
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const allStylistActions: ActionButton[] = [
    {
      id: 'support-chat',
      label: 'AI Support',
      icon: MessageSquare,
      route: '/support-chat',
      description: '24/7 instant help',
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      id: 'quick-formula',
      label: '⚡ Quick Formula',
      icon: Zap,
      route: '/quick-formula',
      description: 'Generate formulas in 2 seconds',
      gradient: 'from-yellow-500 to-orange-500',
    },
    {
      id: 'ai-chat',
      label: 'AI Expert Chat',
      description: 'Get instant advice',
      icon: Sparkles,
      route: '/ai-assistant',
      gradient: 'from-violet-500 to-purple-500',
    },
    {
      id: 'formula',
      label: 'Create Formula',
      description: 'Generate client formulas',
      icon: Scissors,
      route: '/formulas',
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      id: 'schedule',
      label: 'Appointments',
      description: 'View your schedule',
      icon: Calendar,
      route: '/appointments',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'messages',
      label: 'Messages',
      description: 'Client conversations',
      icon: MessageSquare,
      route: '/messages',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      id: 'clients',
      label: 'Client Management',
      description: 'Manage your clients',
      icon: Users,
      route: '/clients',
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      id: 'services',
      label: 'Services & Pricing',
      description: 'Edit your offerings',
      icon: Settings2,
      route: '/services',
      gradient: 'from-indigo-500 to-blue-500',
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      description: 'Showcase your work',
      icon: Palette,
      route: '/portfolio',
      gradient: 'from-fuchsia-500 to-pink-500',
    },
    {
      id: 'finance',
      label: 'Financial Overview',
      description: 'Track earnings & payments',
      icon: CreditCard,
      route: '/finance',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      id: 'referrals',
      label: 'Referral Program',
      description: 'Earn by referring',
      icon: DollarSign,
      route: '/referrals',
      gradient: 'from-yellow-500 to-amber-500',
    },
    {
      id: 'knowledge',
      label: 'Knowledge Base',
      description: 'Hair care resources',
      icon: BookOpen,
      route: '/knowledge',
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      id: 'ad-generator',
      label: 'Ad Generator',
      description: 'Create marketing content',
      icon: Sparkles,
      route: '/ad-generator',
      gradient: 'from-purple-500 to-pink-500',
    },
  ];

  const allClientActions: ActionButton[] = [
    {
      id: 'support-chat',
      label: 'AI Support',
      icon: MessageSquare,
      route: '/support-chat',
      description: 'Get instant help',
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      id: 'knowledge',
      label: 'Hair Care Tips',
      description: 'Learn & explore',
      icon: BookOpen,
      route: '/knowledge',
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      id: 'profile',
      label: 'My Profile',
      description: 'Update your info',
      icon: Settings2,
      route: '/settings',
      gradient: 'from-indigo-500 to-purple-500',
    },
  ];

  const allAdminActions: ActionButton[] = [
    {
      id: 'command-center',
      label: 'Command Center',
      description: 'Full platform control',
      icon: Crown,
      route: '/admin/command',
      gradient: 'from-amber-500 to-yellow-500',
    },
    {
      id: 'user-management',
      label: 'User Management',
      description: 'Manage users & roles',
      icon: Users,
      route: '/admin/users',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'audit-logs',
      label: 'Audit Logs',
      description: 'Security & compliance',
      icon: FileText,
      route: '/admin/audit-logs',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      id: 'system-health',
      label: 'System Health',
      description: 'Monitor performance',
      icon: Activity,
      route: '/system-health',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      id: 'security-scan',
      label: 'Security Scanner',
      description: 'Check vulnerabilities',
      icon: Shield,
      route: '/security-audit',
      gradient: 'from-red-500 to-orange-500',
    },
    {
      id: 'ai-assistant',
      label: 'AI Assistant',
      description: 'Platform insights',
      icon: Sparkles,
      route: '/ai-assistant',
      gradient: 'from-violet-500 to-purple-500',
    },
  ];

  const allActions = isAdmin
    ? allAdminActions
    : userRole === 'stylist'
      ? allStylistActions
      : allClientActions;
  const storageKey = `quickActions-${isAdmin ? 'admin' : userRole}`;

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setSelectedActions(JSON.parse(saved));
    } else {
      // Default: Admin (6 shortcuts), Client (2 essentials), Stylist (4 key actions)
      const defaultCount = isAdmin
        ? 6
        : userRole === 'client'
          ? allActions.length
          : 4;
      setSelectedActions(allActions.slice(0, defaultCount).map(a => a.id));
    }
  }, [userRole, isAdmin]);

  const toggleAction = (id: string) => {
    setSelectedActions(prev => {
      const newSelection = prev.includes(id)
        ? prev.filter(a => a !== id)
        : [...prev, id];
      localStorage.setItem(storageKey, JSON.stringify(newSelection));
      return newSelection;
    });
  };

  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

    setSelectedActions(prev => {
      const newOrder = [...prev];
      const draggedIndex = newOrder.indexOf(draggedItem);
      const targetIndex = newOrder.indexOf(targetId);

      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedItem);

      localStorage.setItem(storageKey, JSON.stringify(newOrder));
      return newOrder;
    });
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const displayedActions = allActions
    .filter(a => selectedActions.includes(a.id))
    .sort(
      (a, b) => selectedActions.indexOf(a.id) - selectedActions.indexOf(b.id)
    );

  return (
    <Card
      variant="glass"
      className={cn(
        'mb-6 animate-fade-in brutal-glass-card',
        isAdmin
          ? 'bg-gradient-to-br from-amber-500/10 via-yellow-500/10 to-orange-500/10 border-amber-500/30'
          : 'bg-gradient-to-br from-background/80 to-card/60'
      )}
    >
      <CardHeader className="p-4 sm:p-5 md:p-6 pb-3 sm:pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl font-pixel">
              {isAdmin ? (
                <Crown className="h-5 w-5 text-amber-500" />
              ) : (
                <Sparkles className="h-5 w-5 text-primary" />
              )}
              {isAdmin ? 'Admin Controls' : 'Your Quick Actions'}
            </CardTitle>
            <p className="text-[11px] sm:text-xs lg:text-sm font-sans font-medium mt-1 text-muted-foreground">
              {isAdmin
                ? 'Platform management at your fingertips'
                : 'Jump to what matters most'}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCustomizing(!isCustomizing)}
            className="shrink-0 font-bold uppercase tracking-wide"
          >
            {isCustomizing ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Done
              </>
            ) : (
              <>
                <Settings2 className="h-4 w-4 mr-2" />
                Customize
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 md:p-6">
        {isCustomizing ? (
          <div className="space-y-4">
            <div className="p-3 sm:p-4 rounded-lg brutal-border bg-gradient-to-r from-primary/10 to-accent/10 brutal-shadow-sm">
              <p className="text-[11px] sm:text-xs lg:text-sm font-pixel text-foreground">
                Customize Your Actions
              </p>
              <p className="text-[11px] sm:text-xs lg:text-sm font-sans text-muted-foreground mt-1">
                Click to toggle • Drag selected items to reorder
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {allActions.map(action => {
                const Icon = action.icon;
                const isSelected = selectedActions.includes(action.id);

                return (
                  <div
                    key={action.id}
                    draggable={isSelected}
                    onDragStart={() => handleDragStart(action.id)}
                    onDragOver={e => handleDragOver(e, action.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => toggleAction(action.id)}
                    className={cn(
                      'group relative flex items-center gap-3 p-4 rounded-lg brutal-border cursor-pointer transition-all',
                      isSelected
                        ? 'bg-gradient-to-br from-primary/10 to-accent/10 brutal-shadow-md hover:brutal-shadow-lg active:brutal-shadow-sm'
                        : 'bg-card/80 hover:bg-card brutal-shadow-xs hover:brutal-shadow-sm active:scale-95'
                    )}
                  >
                    <div
                      className={cn(
                        'p-2.5 rounded-lg brutal-border transition-all',
                        isSelected
                          ? `bg-gradient-to-br ${action.gradient}`
                          : 'bg-muted'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-5 w-5 transition-colors',
                          isSelected
                            ? 'text-primary-foreground'
                            : 'text-muted-foreground'
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'font-bold uppercase tracking-wide text-xs sm:text-sm lg:text-base truncate transition-colors',
                          isSelected && 'text-primary'
                        )}
                      >
                        {action.label}
                      </p>
                      <p className="text-[11px] sm:text-xs lg:text-sm font-sans text-muted-foreground truncate">
                        {action.description}
                      </p>
                    </div>
                    {isSelected && (
                      <>
                        <GripVertical className="h-5 w-5 text-primary cursor-grab active:cursor-grabbing shrink-0" />
                        <Badge
                          variant="secondary"
                          className="absolute -top-2 -right-2 brutal-border brutal-shadow-xs bg-primary text-primary-foreground font-bold"
                        >
                          {selectedActions.indexOf(action.id) + 1}
                        </Badge>
                      </>
                    )}
                    {!isSelected && (
                      <Plus className="h-5 w-5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {displayedActions.map((action, index) => {
              const Icon = action.icon;

              return (
                <button
                  key={action.id}
                  onClick={() => !action.disabled && navigate(action.route)}
                  disabled={action.disabled}
                  className={cn(
                    'group relative rounded-xl brutal-action-card',
                    action.disabled && 'opacity-60 cursor-not-allowed'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex flex-col items-center gap-3 p-5 text-center">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br opacity-15 ${!action.disabled && 'group-hover:opacity-20'} transition-opacity ${action.gradient}`}
                    />
                    <div className="relative">
                      <div
                        className={`inline-flex p-3 rounded-lg bg-gradient-to-br brutal-border brutal-shadow-xs ${!action.disabled && 'group-hover:brutal-shadow-sm'} transition-shadow ${action.gradient}`}
                      >
                        <Icon className="h-6 w-6 text-primary-foreground" />
                      </div>
                    </div>
                    <div className="relative">
                      <h4
                        className={cn(
                          'font-pixel text-xs sm:text-sm lg:text-base mb-1 transition-colors uppercase',
                          !action.disabled && 'group-hover:text-primary'
                        )}
                      >
                        {action.label}
                      </h4>
                      <p className="text-xs sm:text-sm lg:text-base font-sans text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
