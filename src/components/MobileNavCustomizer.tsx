import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { logger } from '@/lib/logging/productionLogger';
import {
  Home,
  Calendar,
  MessageSquare,
  User,
  Users,
  Sparkles,
  Shield,
  Activity,
  GripVertical,
  RotateCcw,
  Smartphone,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface NavItem {
  id: string;
  icon: LucideIcon;
  label: string;
  path: string;
  gradient: string;
  required?: boolean;
}

interface MobileNavCustomizerProps {
  userRole: string;
}

const SortableNavItem = ({
  item,
  isEnabled,
  onToggle,
}: {
  item: NavItem;
  isEnabled: boolean;
  onToggle: (id: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = item.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 p-3 brutal-border bg-card rounded-lg',
        isDragging && 'opacity-50 shadow-brutal-lg',
        !isEnabled && 'opacity-40'
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>

      <div
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-lg',
          'bg-gradient-to-br',
          item.gradient
        )}
      >
        <Icon className="h-5 w-5 text-on-surface-primary" />
      </div>

      <div className="flex-1">
        <div className="font-medium flex items-center gap-2">
          {item.label}
          {item.required && (
            <Badge variant="secondary" className="text-xs">
              Required
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground">{item.path}</div>
      </div>

      <Switch
        checked={isEnabled}
        onCheckedChange={() => !item.required && onToggle(item.id)}
        disabled={item.required}
      />
    </div>
  );
};

export const MobileNavCustomizer = ({ userRole }: MobileNavCustomizerProps) => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole(user?.id);
  const [mounted, setMounted] = useState(false);

  // Stylist navigation items
  const stylistNavItems: NavItem[] = [
    {
      id: 'schedule',
      icon: Calendar,
      label: 'Schedule',
      path: '/appointments',
      gradient: 'from-cyan-500 to-blue-500',
      required: true,
    },
    {
      id: 'clients',
      icon: Users,
      label: 'Clients',
      path: '/clients',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      id: 'home',
      icon: Home,
      label: 'Home',
      path: '/dashboard',
      gradient: 'from-purple-500 to-pink-500',
      required: true,
    },
    {
      id: 'ai',
      icon: Sparkles,
      label: 'AI',
      path: '/ai-assistant',
      gradient: 'from-violet-500 to-purple-500',
    },
    {
      id: 'messages',
      icon: MessageSquare,
      label: 'Messages',
      path: '/messages',
      gradient: 'from-pink-500 to-rose-500',
    },
  ];

  // Client navigation items
  const clientNavItems: NavItem[] = [
    {
      id: 'home',
      icon: Home,
      label: 'Home',
      path: '/dashboard',
      gradient: 'from-purple-500 to-pink-500',
      required: true,
    },
    {
      id: 'tips',
      icon: Sparkles,
      label: 'Tips',
      path: '/knowledge',
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      id: 'profile',
      icon: User,
      label: 'Profile',
      path: '/settings',
      gradient: 'from-blue-500 to-indigo-500',
      required: true,
    },
  ];

  // Admin navigation items
  const adminNavItems: NavItem[] = [
    {
      id: 'home',
      icon: Home,
      label: 'Home',
      path: '/dashboard',
      gradient: 'from-purple-500 to-pink-500',
      required: true,
    },
    {
      id: 'command',
      icon: Shield,
      label: 'Command',
      path: '/admin/command',
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      id: 'users',
      icon: Users,
      label: 'Users',
      path: '/admin/users',
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      id: 'health',
      icon: Activity,
      label: 'Health',
      path: '/system-health',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      id: 'messages',
      icon: MessageSquare,
      label: 'Messages',
      path: '/messages',
      gradient: 'from-violet-500 to-purple-500',
    },
  ];

  // SECURITY: Only show admin items if user actually has admin role
  const allItems = isAdmin
    ? adminNavItems
    : userRole === 'stylist'
      ? stylistNavItems
      : clientNavItems;

  const effectiveRole = isAdmin ? 'admin' : userRole;
  const storageKey = `mobileNav-${effectiveRole}`;
  const [items, setItems] = useState<NavItem[]>(allItems);
  const [enabledIds, setEnabledIds] = useState<string[]>(
    allItems.map(item => item.id)
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setMounted(true);
    const savedConfig = localStorage.getItem(storageKey);
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setEnabledIds(config.enabledIds || allItems.map(item => item.id));

        // Restore order
        if (config.order) {
          const orderedItems = config.order
            .map((id: string) => allItems.find(item => item.id === id))
            .filter(Boolean);
          setItems(orderedItems as NavItem[]);
        }
      } catch (e) {
        logger.error('Failed to load mobile nav config', e, {
          context: 'MobileNavCustomizer',
        });
      }
    }
  }, [userRole]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems(items => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);

        // Save to localStorage
        const config = {
          order: newOrder.map(item => item.id),
          enabledIds,
        };
        localStorage.setItem(storageKey, JSON.stringify(config));

        return newOrder;
      });
    }
  };

  const handleToggle = (id: string) => {
    const newEnabledIds = enabledIds.includes(id)
      ? enabledIds.filter(eid => eid !== id)
      : [...enabledIds, id];

    // Enforce min 3, max 5 items for stylists/admins
    const minItems = userRole === 'client' ? 2 : 3;
    const maxItems = 5;

    if (newEnabledIds.length < minItems) {
      toast.error(`You need at least ${minItems} items in your bottom nav`);
      return;
    }

    if (newEnabledIds.length > maxItems) {
      toast.error(`You can have maximum ${maxItems} items in your bottom nav`);
      return;
    }

    setEnabledIds(newEnabledIds);

    // Save to localStorage
    const config = {
      order: items.map(item => item.id),
      enabledIds: newEnabledIds,
    };
    localStorage.setItem(storageKey, JSON.stringify(config));

    toast.success('Mobile navigation updated');
  };

  const handleReset = () => {
    localStorage.removeItem(storageKey);
    setItems(allItems);
    setEnabledIds(allItems.map(item => item.id));
    toast.success('Reset to default navigation');
  };

  if (!mounted) return null;

  const enabledCount = enabledIds.length;
  const minItems = userRole === 'client' ? 2 : 3;
  const maxItems = 5;

  return (
    <Card className="brutal-border brutal-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-purple-start to-pink-end">
              <Smartphone className="h-5 w-5 text-on-surface-primary" />
            </div>
            <div>
              <CardTitle>Mobile Bottom Navigation</CardTitle>
              <CardDescription>
                Customize your mobile navigation bar ({enabledCount}/{maxItems}{' '}
                items)
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/30 p-4 rounded-lg border-2 border-dashed border-muted-foreground/20">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg">💡</span>
            </div>
            <div className="text-sm space-y-1">
              <p className="font-medium">Quick Tips:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                <li>Drag items to reorder them</li>
                <li>Toggle switches to show/hide items</li>
                <li>
                  Keep {minItems}-{maxItems} items for best experience
                </li>
                <li>Required items cannot be hidden</li>
              </ul>
            </div>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map(item => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {items.map(item => (
                <SortableNavItem
                  key={item.id}
                  item={item}
                  isEnabled={enabledIds.includes(item.id)}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Changes are saved automatically
            </span>
            <Badge
              variant={
                enabledCount >= minItems && enabledCount <= maxItems
                  ? 'default'
                  : 'destructive'
              }
            >
              {enabledCount} / {maxItems} items
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
