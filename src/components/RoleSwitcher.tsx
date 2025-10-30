import { Crown, Scissors, User, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type ViewMode = 'admin' | 'stylist' | 'client';

interface RoleSwitcherProps {
  onViewChange: (view: ViewMode) => void;
  currentView: ViewMode;
}

export function RoleSwitcher({ onViewChange, currentView }: RoleSwitcherProps) {
  const viewConfig = {
    admin: {
      icon: Crown,
      label: 'Admin View',
      color: 'text-warning',
      gradient: 'bg-gradient-warning-orange',
    },
    stylist: {
      icon: Scissors,
      label: 'Stylist View',
      color: 'text-accent',
      gradient: 'bg-gradient-purple-pink',
    },
    client: {
      icon: User,
      label: 'Client View',
      color: 'text-info',
      gradient: 'bg-gradient-cyan-blue',
    },
  };

  const CurrentIcon = viewConfig[currentView].icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <DropdownMenu>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 md:gap-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 px-2 md:px-3 transition-all"
              >
                <div
                  className={`p-1 rounded ${viewConfig[currentView].gradient}`}
                >
                  <CurrentIcon className="h-3 w-3 text-primary-foreground" />
                </div>
                <span className="hidden sm:inline text-xs font-medium">
                  {viewConfig[currentView].label}
                </span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">
              Switch between user views to test different experiences
            </p>
          </TooltipContent>
          <DropdownMenuContent align="end" className="w-52 z-50 bg-popover">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Preview Different User Experiences
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {(Object.keys(viewConfig) as ViewMode[]).map(view => {
              const ViewIcon = viewConfig[view].icon;
              return (
                <DropdownMenuItem
                  key={view}
                  onClick={() => onViewChange(view)}
                  className={`cursor-pointer transition-colors ${currentView === view ? 'bg-primary/10' : 'hover:bg-muted'}`}
                >
                  <div
                    className={`p-1 rounded mr-2 ${viewConfig[view].gradient}`}
                  >
                    <ViewIcon className="h-3 w-3 text-primary-foreground" />
                  </div>
                  <span className="text-sm">{viewConfig[view].label}</span>
                  {currentView === view && (
                    <Badge
                      variant="secondary"
                      className="ml-auto text-[11px] bg-primary text-primary-foreground min-h-[20px]"
                    >
                      Active
                    </Badge>
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </Tooltip>
    </TooltipProvider>
  );
}
