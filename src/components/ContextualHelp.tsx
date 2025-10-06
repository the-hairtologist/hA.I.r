import { ReactNode, useState } from "react";
import { HelpCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ContextualHelpProps {
  title: string;
  description: string;
  content: ReactNode;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  className?: string;
}

const positionClasses = {
  "top-right": "top-0 right-0 mt-10",
  "top-left": "top-0 left-0 mt-10",
  "bottom-right": "bottom-0 right-0 mb-10",
  "bottom-left": "bottom-0 left-0 mb-10",
};

export const ContextualHelp = ({
  title,
  description,
  content,
  position = "top-right",
  className,
}: ContextualHelpProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-8 w-8 rounded-full",
          isOpen && "bg-accent"
        )}
        aria-label="Toggle help"
      >
        <HelpCircle className="h-4 w-4" />
      </Button>

      {isOpen && (
        <Card className={cn(
          "absolute z-50 w-80",
          "border-2 border-foreground shadow-[6px_6px_0px_0px_hsl(var(--foreground))]",
          "animate-scale-in",
          positionClasses[position]
        )}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription className="text-sm">{description}</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            {content}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
