import { Sparkles, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { haptic } from "@/platform/haptics";

interface UpsellSuggestion {
  service: string;
  addon: string;
  incomeBoost: number;
  reasoning: string;
}

interface SmartUpsellProps {
  currentService: string;
  onAddUpsell?: (addon: string) => void;
  className?: string;
}

const upsellMap: Record<string, UpsellSuggestion> = {
  "Haircut": {
    service: "Haircut",
    addon: "Color Consultation",
    incomeBoost: 20,
    reasoning: "Clients love a fresh color with their new cut",
  },
  "Color": {
    service: "Color",
    addon: "Deep Conditioning Treatment",
    incomeBoost: 15,
    reasoning: "Protect color investment with premium conditioning",
  },
  "Highlights": {
    service: "Highlights",
    addon: "Toner + Gloss",
    incomeBoost: 25,
    reasoning: "Enhance dimension and add stunning shine",
  },
  "Blowout": {
    service: "Blowout",
    addon: "Hair Treatment",
    incomeBoost: 30,
    reasoning: "Make the style last longer with professional treatment",
  },
};

export const SmartUpsell = ({ currentService, onAddUpsell, className }: SmartUpsellProps) => {
  const suggestion = upsellMap[currentService];

  if (!suggestion) return null;

  const handleAdd = () => {
    haptic.tap();
    onAddUpsell?.(suggestion.addon);
  };

  return (
    <Card
      className={cn(
        "border-[2px] border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5",
        "animate-fade-in",
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-primary/10 p-2 mt-0.5">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3 w-3 text-primary" />
              <p className="text-xs font-semibold text-primary">Smart Upsell Suggestion</p>
            </div>
            
            <p className="text-sm font-medium">
              Add <span className="gradient-text font-bold">{suggestion.addon}</span>
            </p>
            
            <p className="text-xs text-muted-foreground">
              {suggestion.reasoning}
            </p>
            
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-success">+{suggestion.incomeBoost}%</span>
                <span className="text-xs text-muted-foreground">income boost</span>
              </div>
              
              <Button
                size="sm"
                variant="default"
                onClick={handleAdd}
                className="h-7 text-xs gap-1 border-[2px] border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_hsl(var(--foreground))]"
              >
                <Sparkles className="h-3 w-3" />
                Add Service
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
