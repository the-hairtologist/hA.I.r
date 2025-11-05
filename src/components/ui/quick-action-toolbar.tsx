/**
 * Quick Action Toolbar Component
 * Floating toolbar for common actions with keyboard shortcuts
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Download, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  shortcut: string;
  action: () => void;
  disabled?: boolean;
}

interface QuickActionToolbarProps {
  actions: QuickAction[];
  className?: string;
}

export const QuickActionToolbar = ({
  actions,
  className,
}: QuickActionToolbarProps) => {
  return (
    <Card
      className={cn(
        'brutal-border-subtle shadow-brutal-sm',
        className
      )}
    >
      <CardContent className="p-2 flex items-center gap-2">
        {actions.map((action, idx) => (
          <Button
            key={idx}
            variant="ghost"
            size="sm"
            onClick={action.action}
            disabled={action.disabled}
            className="gap-2 group"
            title={`${action.label} (${action.shortcut})`}
          >
            <action.icon className="h-4 w-4" />
            <span className="hidden md:inline">{action.label}</span>
            <kbd className="hidden lg:inline-flex px-1.5 py-0.5 text-xs bg-muted rounded border opacity-60 group-hover:opacity-100">
              {action.shortcut}
            </kbd>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};
