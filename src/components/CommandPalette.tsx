/**
 * Command Palette (Ctrl+K)
 * Global search and quick navigation
 */

import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Home,
  Scissors,
  Calendar,
  Users,
  Sparkles,
  Settings,
  HelpCircle,
  MessageSquare,
  LayoutDashboard,
  FileText,
  CreditCard,
  Palette,
  Search,
} from 'lucide-react';

interface Command {
  id: string;
  label: string;
  icon: typeof Home;
  path: string;
  keywords: string[];
  group: 'navigation' | 'quick-actions';
}

const commands: Command[] = [
  // Navigation
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    keywords: ['home', 'overview', 'main'],
    group: 'navigation',
  },
  {
    id: 'formulas',
    label: 'Formulas',
    icon: Palette,
    path: '/formulas',
    keywords: ['color', 'formula', 'recipe', 'mix'],
    group: 'navigation',
  },
  {
    id: 'clients',
    label: 'Clients',
    icon: Users,
    path: '/clients',
    keywords: ['customer', 'client', 'contact'],
    group: 'navigation',
  },
  {
    id: 'appointments',
    label: 'Appointments',
    icon: Calendar,
    path: '/appointments',
    keywords: ['schedule', 'booking', 'calendar', 'appointment'],
    group: 'navigation',
  },
  {
    id: 'ai-assistant',
    label: 'AI Assistant',
    icon: Sparkles,
    path: '/ai-assistant',
    keywords: ['ai', 'chat', 'help', 'assistant', 'ask'],
    group: 'navigation',
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    icon: Palette,
    path: '/portfolio',
    keywords: ['photos', 'gallery', 'work', 'showcase'],
    group: 'navigation',
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: MessageSquare,
    path: '/messages',
    keywords: ['chat', 'conversation', 'inbox', 'dm'],
    group: 'navigation',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/settings',
    keywords: ['preferences', 'config', 'profile', 'account'],
    group: 'navigation',
  },
  {
    id: 'help',
    label: 'Help & Support',
    icon: HelpCircle,
    path: '/help',
    keywords: ['support', 'faq', 'documentation', 'guide'],
    group: 'navigation',
  },
  // Quick Actions
  {
    id: 'quick-formula',
    label: 'Generate Formula',
    icon: Sparkles,
    path: '/quick-formula',
    keywords: ['generate', 'create', 'new', 'ai', 'quick'],
    group: 'quick-actions',
  },
  {
    id: 'schedule',
    label: 'Manage Schedule',
    icon: Calendar,
    path: '/schedule',
    keywords: ['availability', 'hours', 'time'],
    group: 'quick-actions',
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: CreditCard,
    path: '/finance',
    keywords: ['payment', 'money', 'revenue', 'earnings'],
    group: 'quick-actions',
  },
];

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const filteredCommands = useMemo(() => {
    return commands;
  }, []);

  const handleSelect = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search or jump to..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          {filteredCommands
            .filter((cmd) => cmd.group === 'navigation')
            .map((command) => {
              const Icon = command.icon;
              return (
                <CommandItem
                  key={command.id}
                  onSelect={() => handleSelect(command.path)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{command.label}</span>
                </CommandItem>
              );
            })}
        </CommandGroup>

        <CommandGroup heading="Quick Actions">
          {filteredCommands
            .filter((cmd) => cmd.group === 'quick-actions')
            .map((command) => {
              const Icon = command.icon;
              return (
                <CommandItem
                  key={command.id}
                  onSelect={() => handleSelect(command.path)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{command.label}</span>
                </CommandItem>
              );
            })}
        </CommandGroup>
      </CommandList>

      <div className="border-t p-2 text-xs text-muted-foreground text-center">
        <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘K</kbd> or{' '}
        <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+K</kbd>
      </div>
    </CommandDialog>
  );
};
