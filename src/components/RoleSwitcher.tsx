import { useState } from "react";
import { Crown, Scissors, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ViewMode = "admin" | "stylist" | "client";

interface RoleSwitcherProps {
  onViewChange: (view: ViewMode) => void;
  currentView: ViewMode;
}

export function RoleSwitcher({ onViewChange, currentView }: RoleSwitcherProps) {
  const viewConfig = {
    admin: {
      icon: Crown,
      label: "Admin View",
      color: "text-warning",
      gradient: "bg-gradient-to-r from-amber-500 to-orange-500"
    },
    stylist: {
      icon: Scissors,
      label: "Stylist View",
      color: "text-purple-400",
      gradient: "bg-gradient-to-r from-purple-500 to-pink-500"
    },
    client: {
      icon: User,
      label: "Client View",
      color: "text-cyan-400",
      gradient: "bg-gradient-to-r from-cyan-500 to-blue-500"
    }
  };

  const CurrentIcon = viewConfig[currentView].icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-primary/20 hover:border-primary/40"
        >
          <div className={`p-1 rounded ${viewConfig[currentView].gradient}`}>
            <CurrentIcon className="h-3 w-3 text-primary-foreground" />
          </div>
          <span className="text-xs font-medium">{viewConfig[currentView].label}</span>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            Preview
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Switch View (Admin Only)
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {(Object.keys(viewConfig) as ViewMode[]).map((view) => {
          const ViewIcon = viewConfig[view].icon;
          return (
            <DropdownMenuItem
              key={view}
              onClick={() => onViewChange(view)}
              className={`cursor-pointer ${currentView === view ? "bg-muted" : ""}`}
            >
              <div className={`p-1 rounded mr-2 ${viewConfig[view].gradient}`}>
                <ViewIcon className="h-3 w-3 text-primary-foreground" />
              </div>
              <span>{viewConfig[view].label}</span>
              {currentView === view && (
                <Badge variant="secondary" className="ml-auto text-[10px]">
                  Active
                </Badge>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
