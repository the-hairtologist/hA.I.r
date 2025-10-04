/**
 * Consistent Page Header Component
 * Provides standardized header with back navigation
 */

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  icon?: ReactNode;
  actions?: ReactNode;
  backTo?: string;
  className?: string;
}

export const PageHeader = ({ title, icon, actions, backTo = "/dashboard", className = "" }: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header 
      role="banner"
      className={`border-b-[3px] border-foreground bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-[4px_4px_0px_0px_hsl(var(--foreground)_/_0.1)] ${className}`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(backTo)}
              aria-label="Go back"
              className="min-h-[44px] min-w-[44px] hover:bg-secondary/20 hover:-translate-x-1 transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              {icon && <div className="text-primary">{icon}</div>}
              <h1 className="text-2xl md:text-3xl font-display font-bold gradient-text">{title}</h1>
            </div>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    </header>
  );
};
