import { useEffect, useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface AIProgressNarrativeProps {
  stage: "analyzing" | "mixing" | "optimizing" | "finalizing";
  className?: string;
}

const narratives = {
  analyzing: [
    "Analyzing your hair tone...",
    "Reading undertones and highlights...",
    "Mapping your unique color profile...",
  ],
  mixing: [
    "Mixing your perfect formula...",
    "Balancing color ratios...",
    "Crafting your custom blend...",
  ],
  optimizing: [
    "Optimizing for your hair type...",
    "Fine-tuning color intensity...",
    "Perfecting the application sequence...",
  ],
  finalizing: [
    "Almost there...",
    "Finalizing your custom formula...",
    "Preparing your results...",
  ],
};

export const AIProgressNarrative = ({ stage, className }: AIProgressNarrativeProps) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const messages = narratives[stage];
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const increment = stage === "analyzing" ? 2 : stage === "mixing" ? 3 : stage === "optimizing" ? 4 : 5;
        return prev >= 95 ? 95 : prev + increment;
      });
    }, 300);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [stage]);

  const stageProgress = {
    analyzing: 25,
    mixing: 50,
    optimizing: 75,
    finalizing: 95,
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          <div className="absolute inset-0 animate-ping opacity-20">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div className="flex-1">
          <p className="text-lg font-medium gradient-text animate-fade-in">
            {narratives[stage][messageIndex]}
          </p>
        </div>
        <Loader2 className="h-5 w-5 text-primary animate-spin" />
      </div>

      {/* Confidence Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>AI Confidence</span>
          <span>{Math.min(progress, stageProgress[stage])}%</span>
        </div>
        <Progress 
          value={Math.min(progress, stageProgress[stage])} 
          className="h-2 brutal-border brutal-shadow-xs"
        />
      </div>

      {/* Stage Indicators */}
      <div className="flex justify-between gap-2">
        {Object.keys(narratives).map((s) => {
          const stageKey = s as keyof typeof narratives;
          const isActive = stageKey === stage;
          const isPast = Object.keys(narratives).indexOf(stageKey) < Object.keys(narratives).indexOf(stage);
          
          return (
            <div
              key={s}
              className={cn(
                "flex-1 h-1 rounded-full transition-all duration-500",
                isActive && "bg-gradient-to-r from-primary to-primary/60 animate-pulse",
                isPast && "bg-primary",
                !isActive && !isPast && "bg-secondary"
              )}
            />
          );
        })}
      </div>
    </div>
  );
};
